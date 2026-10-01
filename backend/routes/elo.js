// ============================================================
//  ELO ROUTES — рейтинг
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired, authOptional } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  РАНГИ (синхронизировано с config.js фронта)
// ============================================================
const ELO_RANKS = [
  { name: 'Bronze',   icon: '🥉', min: 0,    max: 900,   color: '#cd7f32' },
  { name: 'Silver',   icon: '🥈', min: 900,  max: 1200,  color: '#c0c0c0' },
  { name: 'Gold',     icon: '🥇', min: 1200, max: 1500,  color: '#ffd700' },
  { name: 'Platinum', icon: '💎', min: 1500, max: 1900,  color: '#88ddff' },
  { name: 'Diamond',  icon: '👑', min: 1900, max: 2300,  color: '#a78bfa' },
  { name: 'Legend',   icon: '⚡', min: 2300, max: 99999, color: '#ff44ff' },
];

function getRank(elo) {
  return ELO_RANKS.find(r => elo >= r.min && elo < r.max) || ELO_RANKS[ELO_RANKS.length - 1];
}

// ============================================================
//  GET /api/elo/ranks — список всех рангов
// ============================================================
router.get('/ranks', (req, res) => {
  res.json({ ok: true, ranks: ELO_RANKS });
});

// ============================================================
//  GET /api/elo/top — топ-100 по ELO
//  ?limit=100
// ============================================================
router.get('/top', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);

    const result = await db.query(
      `SELECT
        id, username, elo, best_elo, fantasy_points,
        total_predictions, correct_predictions,
        avatar, frame, active_nick_effect, active_badges,
        CASE
          WHEN total_predictions > 0
          THEN ROUND((correct_predictions::numeric / total_predictions) * 100, 1)
          ELSE 0
        END as win_rate
       FROM users
       WHERE banned = FALSE
       ORDER BY elo DESC, best_elo DESC
       LIMIT $1`,
      [limit]
    );

    // Добавляем позицию и ранг к каждому игроку
    const players = result.rows.map((u, idx) => ({
      ...u,
      position: idx + 1,
      rank: getRank(u.elo),
    }));

    res.json({ ok: true, count: players.length, players });
  } catch (err) {
    console.error('GET /elo/top error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения рейтинга' });
  }
});

// ============================================================
//  GET /api/elo/rank — мой ранг + позиция
// ============================================================
router.get('/rank', authRequired, async (req, res) => {
  try {
    // Получаем мой ELO
    const meResult = await db.query(
      'SELECT id, username, elo, best_elo FROM users WHERE id = $1',
      [req.user.id]
    );
    if (meResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Пользователь не найден' });
    }
    const me = meResult.rows[0];

    // Считаем позицию (сколько игроков с ELO выше меня)
    const posResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE elo > $1 AND banned = FALSE',
      [me.elo]
    );
    const position = parseInt(posResult.rows[0].count) + 1;

    // Общее количество игроков (для перцентиля)
    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE banned = FALSE'
    );
    const total = parseInt(totalResult.rows[0].count);

    const rank = getRank(me.elo);
    const percentile = total > 0 ? Math.round(((total - position + 1) / total) * 100) : 0;

    // Сколько до следующего ранга
    let nextRank = null;
    const currentRankIndex = ELO_RANKS.indexOf(rank);
    if (currentRankIndex < ELO_RANKS.length - 1) {
      const next = ELO_RANKS[currentRankIndex + 1];
      nextRank = {
        name: next.name,
        icon: next.icon,
        min: next.min,
        color: next.color,
        eloNeeded: next.min - me.elo,
      };
    }

    res.json({
      ok: true,
      position,
      total,
      percentile,
      elo: me.elo,
      bestElo: me.best_elo,
      rank,
      nextRank,
    });
  } catch (err) {
    console.error('GET /elo/rank error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения ранга' });
  }
});

// ============================================================
//  GET /api/elo/user/:username — ELO конкретного игрока
// ============================================================
router.get('/user/:username', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        id, username, elo, best_elo, total_predictions, correct_predictions
       FROM users WHERE username = $1 AND banned = FALSE`,
      [req.params.username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Игрок не найден' });
    }

    const user = result.rows[0];

    const posResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE elo > $1 AND banned = FALSE',
      [user.elo]
    );
    const position = parseInt(posResult.rows[0].count) + 1;

    res.json({
      ok: true,
      user: {
        ...user,
        position,
        rank: getRank(user.elo),
      },
    });
  } catch (err) {
    console.error('GET /elo/user/:username error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения ELO' });
  }
});

module.exports = router;