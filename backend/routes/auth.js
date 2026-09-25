// ============================================================
//  AUTH ROUTES — регистрация, логин, /me
// ============================================================
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 10;

// ============================================================
//  УТИЛИТЫ
// ============================================================
function validateUsername(username) {
  if (!username || username.length < 3) return 'Логин — минимум 3 символа';
  if (username.length > 20) return 'Логин — максимум 20 символов';
  if (!/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/.test(username)) return 'Логин: только буквы, цифры и _';
  return null;
}

function validatePassword(password) {
  if (!password || password.length < 6) return 'Пароль — минимум 6 символов';
  if (password.length > 100) return 'Пароль — максимум 100 символов';
  return null;
}

function generateRefCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Убираем пароль из ответа
function sanitizeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

// ============================================================
//  POST /api/auth/register — регистрация
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { username, password, refCode, fingerprint, telegramId } = req.body;

    // Валидация
    const usernameErr = validateUsername(username);
    if (usernameErr) return res.status(400).json({ ok: false, error: usernameErr });

    const passwordErr = validatePassword(password);
    if (passwordErr) return res.status(400).json({ ok: false, error: passwordErr });

    // Проверка, что логин свободен
    const existing = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ ok: false, error: 'Пользователь с таким логином уже существует' });
    }

    // Проверка fingerprint (1 устройство = 1 аккаунт)
    if (fingerprint) {
      const fpCheck = await db.query(
        'SELECT id, username FROM users WHERE fingerprint = $1 AND is_admin = FALSE',
        [fingerprint]
      );
      if (fpCheck.rows.length > 0) {
        return res.status(409).json({ ok: false, error: 'С этого устройства уже зарегистрирован аккаунт' });
      }
    }

    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Проверяем реферальный код
    let referredBy = null;
    if (refCode) {
      const refUser = await db.query(
        'SELECT username FROM users WHERE ref_code = $1 AND fingerprint != $2',
        [refCode.toUpperCase(), fingerprint || '']
      );
      if (refUser.rows.length > 0) {
        referredBy = refUser.rows[0].username;
      }
    }

    // Создаём юзера
    const myRefCode = generateRefCode();
    const insertResult = await db.query(
      `INSERT INTO users (
        username, password_hash, ref_code, referred_by, fingerprint, telegram_id,
        fantasy_points, elo, verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [username, passwordHash, myRefCode, referredBy, fingerprint || null, telegramId || null, 100, 1000, !!telegramId]
    );

    const newUser = insertResult.rows[0];

    // Если приглашён — начисляем 50 очков реферу
    if (referredBy) {
      await db.query(
        'UPDATE users SET fantasy_points = fantasy_points + 50 WHERE username = $1',
        [referredBy]
      );
    }

    const token = generateToken(newUser.id);

    res.status(201).json({
      ok: true,
      message: 'Аккаунт создан',
      token,
      user: sanitizeUser(newUser),
    });

  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка регистрации' });
  }
});

// ============================================================
//  POST /api/auth/login — вход
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Введите логин и пароль' });
    }

    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Неверный логин или пароль' });
    }

    const user = result.rows[0];

    if (user.banned) {
      return res.status(403).json({ ok: false, error: 'Аккаунт заблокирован' });
    }

    // Админ — старая логика с плейсхолдером, надо пропустить
    // (пароль будет хэширован позже, пока — временная проверка)
    let passwordMatch = false;
    if (user.is_admin && user.password_hash.includes('placeholder')) {
      // TODO: убрать после первого хэширования админского пароля
      passwordMatch = (password === 'admin123');
    } else {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    }

    if (!passwordMatch) {
      return res.status(401).json({ ok: false, error: 'Неверный логин или пароль' });
    }

    // Обновляем last_active_day
    await db.query(
      'UPDATE users SET last_active_day = CURRENT_DATE WHERE id = $1',
      [user.id]
    );

    const token = generateToken(user.id);

    res.json({
      ok: true,
      message: 'Вход выполнен',
      token,
      user: sanitizeUser(user),
    });

  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка входа' });
  }
});

// ============================================================
//  GET /api/auth/me — текущий пользователь
// ============================================================
router.get('/me', authRequired, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Пользователь не найден' });
    }
    res.json({ ok: true, user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения профиля' });
  }
});

module.exports = router;