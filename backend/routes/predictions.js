// ============================================================
//  PREDICTIONS ROUTES — прогнозы игроков
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  POST /api/predictions — сделать прогноз
//  Body: { match_id, market, pick, line_value }
//  market: 'winner' | 'total_kills' | '<player>_kills'
// ============================================================
router.post('/', authRequired, async (req, res) => {
  try {
    const { match_id, market, pick, line_value } = req.body;
    const userId = req.user.id;

    if (!match_id || !market || !pick) {
      return res.status(400).json({ ok: false, error: 'match_id, market, pick обязательны' });
    }

    // Получаем матч
    const matchResult = await db.query('SELECT * FROM matches WHERE id = $1', [match_id]);
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Матч не найден' });
    }

    const match = matchResult.rows[0];

    // Прогнозы принимаются только до начала матча
    if (new Date(match.match_date) <= new Date()) {
      return res.status(400).json({ ok: false, error: 'Прогнозы на этот матч закрыты' });
    }

    if (match.status !== 'upcoming') {
      return res.status(400).json({ ok: false, error: 'Матч уже начался или завершён' });
    }

    // Проверка допустимых рынков
    const markets = match.markets || {};
    const validMarkets = ['winner', 'total_kills'];
    if (markets.playerKills) {
      markets.playerKills.forEach(pk => validMarkets.push(`${pk.player}_kills`));
    }

    if (!validMarkets.includes(market)) {
      return res.status(400).json({ ok: false, error: 'Неверный рынок для этого матча' });
    }

    // Валидация pick
    if (market === 'winner') {
      if (![match.team_a, match.team_b].includes(pick)) {
        return res.status(400).json({ ok: false, error: 'pick должен быть одной из команд' });
      }
    } else {
      // over / under
      if (!['over', 'under'].includes(pick)) {
        return res.status(400).json({ ok: false, error: 'pick должен быть over или under' });
      }
    }

    // Проверка, что прогноз ещё не сделан
    const existing = await db.query(
      'SELECT id FROM predictions WHERE user_id = $1 AND match_id = $2 AND market = $3',
      [userId, match_id, market]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ ok: false, error: 'Вы уже сделали прогноз на этот рынок' });
    }

    // Создаём прогноз
    const result = await db.query(
      `INSERT INTO predictions (user_id, match_id, market, pick, line_value)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, match_id, market, pick, line_value || null]
    );

    // Обновляем счётчик прогнозов
    await db.query(
      'UPDATE users SET total_predictions = total_predictions + 1, activity_actions = activity_actions + 1 WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      ok: true,
      message: 'Прогноз принят',
      prediction: result.rows[0],
    });
  } catch (err) {
    console.error('POST /predictions error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка создания прогноза' });
  }
});

// ============================================================
//  GET /api/predictions/my — мои прогнозы
// ============================================================
router.get('/my', authRequired, async (req, res) => {
  try {
    const { status } = req.query; // 'pending' | 'resolved' | undefined

    const params = [req.user.id];
    let where = 'WHERE p.user_id = $1';

    if (status === 'pending') {
      where += ' AND p.is_correct IS NULL';
    } else if (status === 'resolved') {
      where += ' AND p.is_correct IS NOT NULL';
    }

    const result = await db.query(
      `SELECT
        p.*,
        m.team_a, m.team_b, m.match_date, m.status as match_status,
        m.score_a, m.score_b, m.result_winner
       FROM predictions p
       JOIN matches m ON m.id = p.match_id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT 100`,
      params
    );

    res.json({
      ok: true,
      count: result.rows.length,
      predictions: result.rows,
    });
  } catch (err) {
    console.error('GET /predictions/my error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения прогнозов' });
  }
});

// ============================================================
//  GET /api/predictions/match/:matchId — прогнозы на матч (только админ)
// ============================================================
router.get('/match/:matchId', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        p.*,
        u.username
       FROM predictions p
       JOIN users u ON u.id = p.user_id
       WHERE p.match_id = $1
       ORDER BY p.created_at DESC`,
      [req.params.matchId]
    );

    res.json({
      ok: true,
      count: result.rows.length,
      predictions: result.rows,
    });
  } catch (err) {
    console.error('GET /predictions/match/:id error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения прогнозов' });
  }
});

module.exports = router;