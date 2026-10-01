// ============================================================
//  REVIEWS ROUTES — отзывы + реальные выплаты
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired, adminRequired, authOptional } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  GET /api/reviews — список текстовых отзывов
// ============================================================
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        id, author_name as author, text, image_url as image,
        is_admin, pinned, created_at
       FROM reviews
       WHERE type = 'text'
       ORDER BY pinned DESC, created_at DESC
       LIMIT 100`
    );

    res.json({
      ok: true,
      count: result.rows.length,
      reviews: result.rows,
    });
  } catch (err) {
    console.error('GET /reviews error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения отзывов' });
  }
});

// ============================================================
//  GET /api/reviews/payouts — реальные выплаты (со скриншотами)
// ============================================================
router.get('/payouts', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        w.id,
        w.amount,
        w.bonus,
        w.method,
        w.screenshot_url,
        w.paid_at,
        u.username as player_name
       FROM withdrawals w
       JOIN users u ON u.id = w.user_id
       WHERE w.status = 'paid' AND w.screenshot_url IS NOT NULL
       ORDER BY w.paid_at DESC
       LIMIT 100`
    );

    res.json({
      ok: true,
      count: result.rows.length,
      payouts: result.rows,
    });
  } catch (err) {
    console.error('GET /reviews/payouts error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения выплат' });
  }
});

// ============================================================
//  POST /api/reviews — создать отзыв
//  Body: { text, image? }
//  Admin может создать статью с isArticle=true
// ============================================================
router.post('/', authRequired, async (req, res) => {
  try {
    const { text, image, isArticle } = req.body;
    const userId = req.user.id;

    if (!text || text.length < 5) {
      return res.status(400).json({ ok: false, error: 'Минимум 5 символов' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ ok: false, error: 'Максимум 2000 символов' });
    }

    const isAdminArticle = !!isArticle && req.user.is_admin;

    const result = await db.query(
      `INSERT INTO reviews (user_id, author_name, type, text, image_url, is_admin)
       VALUES ($1, $2, 'text', $3, $4, $5)
       RETURNING id, author_name as author, text, image_url as image, is_admin, pinned, created_at`,
      [userId, req.user.username, text, image || null, isAdminArticle]
    );

    res.status(201).json({
      ok: true,
      message: isAdminArticle ? '📝 Статья опубликована!' : '✅ Отзыв опубликован!',
      review: result.rows[0],
    });
  } catch (err) {
    console.error('POST /reviews error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка создания отзыва' });
  }
});

// ============================================================
//  POST /api/reviews/:id/pin — закрепить/открепить (admin)
// ============================================================
router.post('/:id/pin', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE reviews SET pinned = NOT pinned WHERE id = $1 RETURNING id, pinned',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Отзыв не найден' });
    }

    res.json({
      ok: true,
      message: result.rows[0].pinned ? '📌 Закреплено' : '📍 Откреплено',
      review: result.rows[0],
    });
  } catch (err) {
    console.error('POST /reviews/:id/pin error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка закрепления' });
  }
});

// ============================================================
//  DELETE /api/reviews/:id — удалить (admin)
// ============================================================
router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Отзыв не найден' });
    }

    res.json({ ok: true, message: '🗑️ Отзыв удалён', id: result.rows[0].id });
  } catch (err) {
    console.error('DELETE /reviews/:id error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка удаления' });
  }
});

module.exports = router;