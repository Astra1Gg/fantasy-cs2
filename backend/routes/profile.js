// ============================================================
//  PROFILE ROUTES — профиль, косметика, значки
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  АВАТАРЫ, РАМКИ, ЗНАЧКИ — цены и id (синхронизировано с config.js фронта)
// ============================================================
const AVATARS = [
  'av1', 'av2', 'av3', 'av4', 'av5', 'av6', 'av7', 'av8',
  'av9', 'av10', 'av11', 'av12', 'av13', 'av14', 'av15', 'av16',
];
const AVATAR_COST = 30;

const FRAMES = [
  { id: 'gold',     cost: 100 },
  { id: 'fire',     cost: 150 },
  { id: 'vip',      cost: 180 },
  { id: 'electric', cost: 200 },
  { id: 'crystal',  cost: 250 },
  { id: 'rainbow',  cost: 350 },
  { id: 'void',     cost: 500 },
];

const COSMETICS = [
  { id: 'nick',           points: 80,  category: 'nick' },
  { id: 'vip',            points: 200, category: 'vip' },
  { id: 'crown',          points: 300, category: 'crown' },
  { id: 'animnick',       points: 400, category: 'nick_effect' },
  { id: 'fire_effect',    points: 450, category: 'nick_effect' },
  { id: 'electric',       points: 500, category: 'nick_effect' },
  { id: 'crystal_effect', points: 550, category: 'nick_effect' },
  { id: 'rainbow_effect', points: 700, category: 'nick_effect' },
  { id: 'badge_hunter',   points: 350, category: 'badge' },
  { id: 'badge_king',     points: 800, category: 'badge' },
];

// ============================================================
//  GET /api/profile/me — мой полный профиль
// ============================================================
router.get('/me', authRequired, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        id, username, email, telegram_id, ref_code, referred_by,
        elo, best_elo, fantasy_points, rubles, streak, best_streak,
        kills_streak, underdog_wins, daily_streak,
        total_predictions, correct_predictions, cases_opened, total_spins,
        activity_actions, chat_messages, withdraw_count, prizes_count,
        avatar, frame, active_nick_effect, active_badges, cosmetics, inventory,
        bonuses, verified, banned, is_admin, last_active_day, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Пользователь не найден' });
    }

    res.json({ ok: true, profile: result.rows[0] });
  } catch (err) {
    console.error('GET /profile/me error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения профиля' });
  }
});

// ============================================================
//  GET /api/profile/:username — публичный профиль другого игрока
// ============================================================
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const result = await db.query(
      `SELECT
        id, username, elo, best_elo, fantasy_points,
        total_predictions, correct_predictions, cases_opened,
        avatar, frame, active_nick_effect, active_badges,
        created_at
       FROM users WHERE username = $1 AND banned = FALSE`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Игрок не найден' });
    }

    res.json({ ok: true, profile: result.rows[0] });
  } catch (err) {
    console.error('GET /profile/:username error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения профиля' });
  }
});

// ============================================================
//  PATCH /api/profile/me — обновить косметику (avatar, frame, эффекты, значки)
//  Body: { avatar?, frame?, activeNickEffect?, activeBadges? }
// ============================================================
router.patch('/me', authRequired, async (req, res) => {
  try {
    const { avatar, frame, activeNickEffect, activeBadges } = req.body;
    const userId = req.user.id;

    // Получаем текущий профиль
    const current = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = current.rows[0];
    const cosmetics = user.cosmetics || [];

    const updates = [];
    const params = [];
    let paramIdx = 1;

    // Аватар — проверяем, что он есть в списке купленных
    if (avatar !== undefined) {
      if (!cosmetics.includes('av_' + avatar) && avatar !== 'default') {
        return res.status(403).json({ ok: false, error: 'Аватар не куплен' });
      }
      updates.push(`avatar = $${paramIdx++}`);
      params.push(avatar);
    }

    // Рамка — аналогично
    if (frame !== undefined) {
      if (frame !== 'none' && !cosmetics.includes('frame_' + frame)) {
        return res.status(403).json({ ok: false, error: 'Рамка не куплена' });
      }
      updates.push(`frame = $${paramIdx++}`);
      params.push(frame);
    }

    // Эффект ника — проверяем, что он есть
    if (activeNickEffect !== undefined) {
      if (activeNickEffect !== null && !cosmetics.includes(activeNickEffect)) {
        return res.status(403).json({ ok: false, error: 'Эффект не куплен' });
      }
      updates.push(`active_nick_effect = $${paramIdx++}`);
      params.push(activeNickEffect);
    }

    // Значки — объект { vip: true, crown: false, ... }
    if (activeBadges !== undefined) {
      // Валидация: только известные значки, и они должны быть куплены
      const validBadgeIds = ['vip', 'crown', 'badge_hunter', 'badge_king'];
      const filtered = {};

      for (const [key, val] of Object.entries(activeBadges)) {
        if (!validBadgeIds.includes(key)) continue;
        if (!cosmetics.includes(key)) continue;
        filtered[key] = !!val;
      }

      updates.push(`active_badges = $${paramIdx++}`);
      params.push(JSON.stringify(filtered));
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'Нет изменений' });
    }

    params.push(userId);
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING
        id, username, avatar, frame, active_nick_effect, active_badges, cosmetics`,
      params
    );

    res.json({ ok: true, message: 'Профиль обновлён', profile: result.rows[0] });
  } catch (err) {
    console.error('PATCH /profile/me error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка обновления профиля' });
  }
});

// ============================================================
//  POST /api/profile/buy-avatar — купить аватар
//  Body: { avatar: 'av1' }
// ============================================================
router.post('/buy-avatar', authRequired, async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user.id;

    if (!avatar || !AVATARS.includes(avatar)) {
      return res.status(400).json({ ok: false, error: 'Неверный id аватара' });
    }

    const current = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = current.rows[0];
    const cosmetics = user.cosmetics || [];

    if (cosmetics.includes('av_' + avatar)) {
      return res.status(409).json({ ok: false, error: 'Аватар уже куплен' });
    }

    if (user.fantasy_points < AVATAR_COST) {
      return res.status(400).json({ ok: false, error: `Нужно ${AVATAR_COST} очков` });
    }

    // Транзакция: списываем очки + добавляем в cosmetics + ставим активным
    cosmetics.push('av_' + avatar);
    const result = await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points - $1,
           cosmetics = $2::jsonb,
           avatar = $3
       WHERE id = $4
       RETURNING id, fantasy_points, cosmetics, avatar`,
      [AVATAR_COST, JSON.stringify(cosmetics), avatar, userId]
    );

    res.json({
      ok: true,
      message: 'Аватар куплен!',
      profile: result.rows[0],
    });
  } catch (err) {
    console.error('POST /profile/buy-avatar error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка покупки аватара' });
  }
});

// ============================================================
//  POST /api/profile/buy-frame — купить рамку
//  Body: { frame: 'gold' }
// ============================================================
router.post('/buy-frame', authRequired, async (req, res) => {
  try {
    const { frame } = req.body;
    const userId = req.user.id;

    const frameData = FRAMES.find(f => f.id === frame);
    if (!frameData) {
      return res.status(400).json({ ok: false, error: 'Неверный id рамки' });
    }

    const current = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = current.rows[0];
    const cosmetics = user.cosmetics || [];

    if (cosmetics.includes('frame_' + frame)) {
      return res.status(409).json({ ok: false, error: 'Рамка уже куплена' });
    }

    if (user.fantasy_points < frameData.cost) {
      return res.status(400).json({ ok: false, error: `Нужно ${frameData.cost} очков` });
    }

    cosmetics.push('frame_' + frame);
    const result = await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points - $1,
           cosmetics = $2::jsonb,
           frame = $3
       WHERE id = $4
       RETURNING id, fantasy_points, cosmetics, frame`,
      [frameData.cost, JSON.stringify(cosmetics), frame, userId]
    );

    res.json({
      ok: true,
      message: 'Рамка куплена!',
      profile: result.rows[0],
    });
  } catch (err) {
    console.error('POST /profile/buy-frame error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка покупки рамки' });
  }
});

// ============================================================
//  POST /api/profile/buy-cosmetic — купить косметику (значок, эффект ника)
//  Body: { cosmeticId: 'vip' }
// ============================================================
router.post('/buy-cosmetic', authRequired, async (req, res) => {
  try {
    const { cosmeticId } = req.body;
    const userId = req.user.id;

    const cosmetic = COSMETICS.find(c => c.id === cosmeticId);
    if (!cosmetic) {
      return res.status(400).json({ ok: false, error: 'Неверный id косметики' });
    }

    const current = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = current.rows[0];
    const cosmetics = user.cosmetics || [];

    if (cosmetics.includes(cosmeticId)) {
      return res.status(409).json({ ok: false, error: 'Уже куплено' });
    }

    if (user.fantasy_points < cosmetic.points) {
      return res.status(400).json({ ok: false, error: `Нужно ${cosmetic.points} очков` });
    }

    cosmetics.push(cosmeticId);
    const result = await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points - $1,
           cosmetics = $2::jsonb
       WHERE id = $3
       RETURNING id, fantasy_points, cosmetics`,
      [cosmetic.points, JSON.stringify(cosmetics), userId]
    );

    res.json({
      ok: true,
      message: 'Косметика куплена!',
      profile: result.rows[0],
    });
  } catch (err) {
    console.error('POST /profile/buy-cosmetic error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка покупки' });
  }
});

module.exports = router;