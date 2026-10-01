// ============================================================
//  LEAGUES ROUTES — лиги (ежедневная, недельная, месячная, спец)
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  ХЕЛПЕР — получить активные лиги
// ============================================================
async function getActiveLeagues() {
  const result = await db.query(
    `SELECT id, type, name, start_time, duration_days, prizes, active, created_at
     FROM leagues
     WHERE active = TRUE
     ORDER BY
       CASE type
         WHEN 'daily' THEN 1
         WHEN 'weekly' THEN 2
         WHEN 'monthly' THEN 3
         ELSE 4
       END,
       start_time DESC`
  );
  return result.rows;
}

// Хелпер — время до конца лиги
function getEndTime(league) {
  const start = new Date(league.start_time).getTime();
  const end = start + league.duration_days * 24 * 3600 * 1000;
  return end;
}

// ============================================================
//  GET /api/leagues — список активных лиг
// ============================================================
router.get('/', async (req, res) => {
  try {
    const leagues = await getActiveLeagues();
    const now = Date.now();

    const enriched = leagues.map(l => {
      const endTime = getEndTime(l);
      const remaining = Math.max(0, endTime - now);
      return {
        ...l,
        end_time: new Date(endTime).toISOString(),
        time_remaining_ms: remaining,
        is_active: remaining > 0,
      };
    });

    res.json({ ok: true, leagues: enriched });
  } catch (err) {
    console.error('GET /leagues error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения лиг' });
  }
});

// ============================================================
//  GET /api/leagues/:type/top — топ игроков в лиге
//  type: daily | weekly | monthly
// ============================================================
router.get('/:type/top', async (req, res) => {
  try {
    const { type } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);

    if (!['daily', 'weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ ok: false, error: 'Неверный тип лиги' });
    }

    // Находим активную лигу этого типа
    const leagueResult = await db.query(
      `SELECT * FROM leagues
       WHERE type = $1 AND active = TRUE
       ORDER BY start_time DESC
       LIMIT 1`,
      [type]
    );

    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Активная лига этого типа не найдена' });
    }

    const league = leagueResult.rows[0];

    // Получаем топ игроков по очкам в лиге
    const topResult = await db.query(
      `SELECT
        lp.user_id,
        lp.points,
        u.username,
        u.elo,
        u.avatar,
        u.frame,
        u.active_nick_effect,
        u.active_badges
       FROM league_points lp
       JOIN users u ON u.id = lp.user_id
       WHERE lp.league_id = $1 AND u.banned = FALSE
       ORDER BY lp.points DESC
       LIMIT $2`,
      [league.id, limit]
    );

    // Добавляем позиции
    const players = topResult.rows.map((p, idx) => ({
      ...p,
      position: idx + 1,
      prize: league.prizes[idx] || null,
    }));

    // Добавляем время до конца
    const endTime = getEndTime(league);
    const remaining = Math.max(0, endTime - Date.now());

    res.json({
      ok: true,
      league: {
        id: league.id,
        type: league.type,
        name: league.name,
        start_time: league.start_time,
        end_time: new Date(endTime).toISOString(),
        time_remaining_ms: remaining,
        prizes: league.prizes,
      },
      count: players.length,
      players,
    });
  } catch (err) {
    console.error('GET /leagues/:type/top error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения топа лиги' });
  }
});

// ============================================================
//  GET /api/leagues/my — мои очки во всех лигах
// ============================================================
router.get('/my', authRequired, async (req, res) => {
  try {
    // Получаем мои очки во всех лигах
    const result = await db.query(
      `SELECT
        l.id as league_id,
        l.type,
        l.name,
        l.start_time,
        l.duration_days,
        l.prizes,
        COALESCE(lp.points, 0) as points,
        COALESCE(
          (SELECT COUNT(*) + 1
           FROM league_points lp2
           WHERE lp2.league_id = l.id AND lp2.points > COALESCE(lp.points, 0)),
          1
        ) as position
       FROM leagues l
       LEFT JOIN league_points lp ON lp.league_id = l.id AND lp.user_id = $1
       WHERE l.active = TRUE
       ORDER BY
         CASE l.type
           WHEN 'daily' THEN 1
           WHEN 'weekly' THEN 2
           WHEN 'monthly' THEN 3
           ELSE 4
         END`,
      [req.user.id]
    );

    const now = Date.now();
    const leagues = result.rows.map(l => {
      const endTime = getEndTime(l);
      return {
        ...l,
        points: parseInt(l.points),
        position: parseInt(l.position),
        end_time: new Date(endTime).toISOString(),
        time_remaining_ms: Math.max(0, endTime - now),
        is_active: endTime > now,
      };
    });

    res.json({ ok: true, leagues });
  } catch (err) {
    console.error('GET /leagues/my error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения моих лиг' });
  }
});

// ============================================================
//  GET /api/leagues/user/:username — лиги конкретного игрока
// ============================================================
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1 AND banned = FALSE',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Игрок не найден' });
    }
    const userId = userResult.rows[0].id;

    const result = await db.query(
      `SELECT
        l.id as league_id,
        l.type,
        l.name,
        l.prizes,
        COALESCE(lp.points, 0) as points
       FROM leagues l
       LEFT JOIN league_points lp ON lp.league_id = l.id AND lp.user_id = $1
       WHERE l.active = TRUE
       ORDER BY
         CASE l.type
           WHEN 'daily' THEN 1
           WHEN 'weekly' THEN 2
           WHEN 'monthly' THEN 3
           ELSE 4
         END`,
      [userId]
    );

    res.json({
      ok: true,
      username,
      leagues: result.rows.map(l => ({ ...l, points: parseInt(l.points) })),
    });
  } catch (err) {
    console.error('GET /leagues/user/:username error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения лиг игрока' });
  }
});

// ============================================================
//  POST /api/leagues — создать лигу (только админ)
//  Body: { type, name, duration_days, prizes }
// ============================================================
router.post('/', authRequired, adminRequired, async (req, res) => {
  try {
    const { type, name, duration_days, prizes } = req.body;

    if (!['daily', 'weekly', 'monthly', 'special'].includes(type)) {
      return res.status(400).json({ ok: false, error: 'Неверный тип лиги' });
    }
    if (!duration_days || duration_days < 1) {
      return res.status(400).json({ ok: false, error: 'duration_days обязателен' });
    }
    if (!Array.isArray(prizes) || prizes.length === 0) {
      return res.status(400).json({ ok: false, error: 'prizes должен быть массивом' });
    }

    // Деактивируем старые лиги того же типа (для daily/weekly/monthly)
    if (type !== 'special') {
      await db.query(
        `UPDATE leagues SET active = FALSE
         WHERE type = $1 AND active = TRUE`,
        [type]
      );
    }

    const result = await db.query(
      `INSERT INTO leagues (type, name, duration_days, prizes, active, start_time)
       VALUES ($1, $2, $3, $4::jsonb, TRUE, NOW())
       RETURNING *`,
      [type, name || null, duration_days, JSON.stringify(prizes)]
    );

    res.status(201).json({
      ok: true,
      message: 'Лига создана',
      league: result.rows[0],
    });
  } catch (err) {
    console.error('POST /leagues error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка создания лиги' });
  }
});

// ============================================================
//  POST /api/leagues/:id/stop — остановить лигу (только админ)
// ============================================================
router.post('/:id/stop', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE leagues SET active = FALSE WHERE id = $1 RETURNING id, type, active`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Лига не найдена' });
    }
    res.json({ ok: true, message: 'Лига остановлена', league: result.rows[0] });
  } catch (err) {
    console.error('POST /leagues/:id/stop error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка остановки лиги' });
  }
});

module.exports = router;