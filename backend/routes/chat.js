// ============================================================
//  CHAT ROUTES — общий чат (REST, без WebSocket пока)
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  GET /api/chat/messages — последние 200 сообщений
// ============================================================
router.get('/messages', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);

    const result = await db.query(
      `SELECT
        m.id,
        m.text,
        m.created_at,
        u.username as author,
        u.avatar,
        u.frame,
        u.active_nick_effect,
        u.active_badges,
        u.cosmetics
       FROM chat_messages m
       JOIN users u ON u.id = m.user_id
       ORDER BY m.created_at DESC
       LIMIT $1`,
      [limit]
    );

    // Разворачиваем в хронологический порядок (старые сверху)
    const messages = result.rows.reverse();

    res.json({
      ok: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error('GET /chat/messages error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения сообщений' });
  }
});

// ============================================================
//  POST /api/chat/messages — отправить сообщение
//  Body: { text }
// ============================================================
router.post('/messages', authRequired, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Пустое сообщение' });
    }
    if (text.length > 200) {
      return res.status(400).json({ ok: false, error: 'Максимум 200 символов' });
    }

    // Антифлуд — 3 секунды
    const lastMsg = await db.query(
      `SELECT created_at FROM chat_messages
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (lastMsg.rows.length > 0) {
      const lastTime = new Date(lastMsg.rows[0].created_at).getTime();
      const diff = Date.now() - lastTime;
      if (diff < 3000) {
        const wait = Math.ceil((3000 - diff) / 1000);
        return res.status(429).json({
          ok: false,
          error: `Подождите ${wait} сек. перед следующим сообщением`,
          wait,
        });
      }
    }

    // Создаём сообщение
    const result = await db.query(
      `INSERT INTO chat_messages (user_id, text)
       VALUES ($1, $2)
       RETURNING id, text, created_at`,
      [userId, text.trim()]
    );

    // Начисляем +1 очко и +1 к активности
    await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points + 1,
           chat_messages = chat_messages + 1,
           activity_actions = activity_actions + 1
       WHERE id = $1`,
      [userId]
    );

    res.status(201).json({
      ok: true,
      message: result.rows[0],
      reward: { points: 1 },
    });
  } catch (err) {
    console.error('POST /chat/messages error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка отправки' });
  }
});

// ============================================================
//  DELETE /api/chat/messages/:id — удалить (admin)
// ============================================================
router.delete('/messages/:id', authRequired, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ ok: false, error: 'Только админ' });
    }

    const result = await db.query(
      'DELETE FROM chat_messages WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Сообщение не найдено' });
    }

    res.json({ ok: true, message: 'Сообщение удалено' });
  } catch (err) {
    console.error('DELETE /chat/messages/:id error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка удаления' });
  }
});

module.exports = router;