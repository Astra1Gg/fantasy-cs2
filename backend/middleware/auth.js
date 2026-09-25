// ============================================================
//  MIDDLEWARE — проверка JWT
// ============================================================
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

// Обязательная авторизация
async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, error: 'Требуется авторизация' });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET);

    const result = await db.query(
      'SELECT id, username, email, telegram_id, elo, fantasy_points, rubles, is_admin, banned, avatar, frame, cosmetics, inventory, bonuses, active_badges, active_nick_effect FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    if (user.banned) {
      return res.status(403).json({ ok: false, error: 'Аккаунт заблокирован' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, error: 'Токен истёк' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ ok: false, error: 'Неверный токен' });
    }
    console.error('authRequired error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка авторизации' });
  }
}

// Только админ
function adminRequired(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ ok: false, error: 'Требуются права администратора' });
  }
  next();
}

// Опциональная авторизация (если токен есть — кладём юзера, если нет — пропускаем)
async function authOptional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await db.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
    next();
  } catch (err) {
    next();
  }
}

module.exports = { authRequired, adminRequired, authOptional };