// ============================================================
//  MATCHES ROUTES — CRUD матчей
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired, adminRequired, authOptional } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  УТИЛИТЫ
// ============================================================
function validateMatch(data) {
  const errors = [];

  if (!data.team_a || data.team_a.trim().length < 2) errors.push('team_a — минимум 2 символа');
  if (!data.team_b || data.team_b.trim().length < 2) errors.push('team_b — минимум 2 символа');
  if (!data.match_date) errors.push('match_date обязателен');

  const matchDate = new Date(data.match_date);
  if (isNaN(matchDate.getTime())) errors.push('match_date — неверный формат');

  if (data.best_of && ![1, 3, 5].includes(parseInt(data.best_of))) {
    errors.push('best_of — только 1, 3 или 5');
  }

  return errors;
}

// ============================================================
//  GET /api/matches — список матчей
//  ?status=upcoming|live|finished
//  ?limit=20
//  ?offset=0
// ============================================================
router.get('/', authOptional, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const totalResult = await db.query(`SELECT COUNT(*) FROM matches ${where}`, params);
    const total = parseInt(totalResult.rows[0].count);

    params.push(Math.min(parseInt(limit) || 50, 100));
    params.push(parseInt(offset) || 0);

    const result = await db.query(
      `SELECT * FROM matches ${where}
       ORDER BY match_date DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      ok: true,
      total,
      count: result.rows.length,
      matches: result.rows,
    });
  } catch (err) {
    console.error('GET /matches error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения матчей' });
  }
});

// ============================================================
//  GET /api/matches/:id — один матч
// ============================================================
router.get('/:id', authOptional, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM matches WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Матч не найден' });
    }
    res.json({ ok: true, match: result.rows[0] });
  } catch (err) {
    console.error('GET /matches/:id error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения матча' });
  }
});

// ============================================================
//  POST /api/matches — создать матч (только админ)
// ============================================================
router.post('/', authRequired, adminRequired, async (req, res) => {
  try {
    const { team_a, team_b, match_date, best_of, markets, twitch_url, kick_url } = req.body;

    const errors = validateMatch({ team_a, team_b, match_date, best_of });
    if (errors.length > 0) {
      return res.status(400).json({ ok: false, error: errors.join('; ') });
    }

    const result = await db.query(
      `INSERT INTO matches (team_a, team_b, match_date, best_of, markets, twitch_url, kick_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'upcoming')
       RETURNING *`,
      [
        team_a.trim(),
        team_b.trim(),
        new Date(match_date),
        best_of || 3,
        JSON.stringify(markets || { matchWinner: true }),
        twitch_url || null,
        kick_url || null,
      ]
    );

    res.status(201).json({
      ok: true,
      message: 'Матч создан',
      match: result.rows[0],
    });
  } catch (err) {
    console.error('POST /matches error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка создания матча' });
  }
});

// ============================================================
//  PUT /api/matches/:id — обновить матч (только админ)
// ============================================================
router.put('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const { team_a, team_b, match_date, best_of, markets, twitch_url, kick_url, status } = req.body;

    const existing = await db.query('SELECT * FROM matches WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Матч не найден' });
    }

    const result = await db.query(
      `UPDATE matches SET
        team_a = COALESCE($1, team_a),
        team_b = COALESCE($2, team_b),
        match_date = COALESCE($3, match_date),
        best_of = COALESCE($4, best_of),
        markets = COALESCE($5, markets),
        twitch_url = COALESCE($6, twitch_url),
        kick_url = COALESCE($7, kick_url),
        status = COALESCE($8, status)
       WHERE id = $9
       RETURNING *`,
      [
        team_a || null,
        team_b || null,
        match_date ? new Date(match_date) : null,
        best_of || null,
        markets ? JSON.stringify(markets) : null,
        twitch_url !== undefined ? twitch_url : null,
        kick_url !== undefined ? kick_url : null,
        status || null,
        req.params.id,
      ]
    );

    res.json({ ok: true, message: 'Матч обновлён', match: result.rows[0] });
  } catch (err) {
    console.error('PUT /matches/:id error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка обновления матча' });
  }
});

// ============================================================
//  DELETE /api/matches/:id — удалить матч (только админ)
// ============================================================
router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM matches WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Матч не найден' });
    }
    res.json({ ok: true, message: 'Матч удалён', id: result.rows[0].id });
  } catch (err) {
    console.error('DELETE /matches/:id error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка удаления матча' });
  }
});

module.exports = router;