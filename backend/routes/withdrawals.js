// ============================================================
//  WITHDRAWALS ROUTES — выводы средств
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const WITHDRAW_LEVELS = [
  { min: 10,  nextMin: 200, title: '🎉 Первый вывод!',      message: 'Минимум 10 ₽ — проверка, что реквизиты рабочие. Следующий вывод будет от 200 ₽.' },
  { min: 200, nextMin: 500, title: '💼 Второй вывод',       message: 'После него стандартный минимум — 500 ₽. Это защита от дробления заявок.' },
  { min: 500, nextMin: 500, title: '💼 Стандартный вывод',  message: 'Минимум 500 ₽. Обработка в течение 12 часов.' },
];

const WITHDRAW_STANDARD_HOURS = 12;
const WITHDRAW_BONUS_PER_HOUR = 5;
const WITHDRAW_BONUS_LIMIT = 100;
const WITHDRAW_BONUS_MAX_AMOUNT = 500;

const CARD_BINS = {
  '2202': 'Т-Банк', '2200': 'Сбербанк', '2201': 'Сбербанк', '2203': 'Альфа-Банк',
  '2204': 'ВТБ', '4276': 'Сбербанк', '4279': 'Сбербанк', '4817': 'Сбербанк',
  '5486': 'Сбербанк', '5336': 'Т-Банк', '5536': 'Т-Банк', '4154': 'Альфа-Банк',
  '4167': 'ВТБ', '4272': 'ВТБ', '4890': 'ВТБ', '5213': 'Газпромбанк',
  '5157': 'Райффайзен', '4627': 'Открытие', '4165': 'Росбанк', '4377': 'Россельхозбанк',
  '4779': 'Совкомбанк', '4469': 'Почта Банк', '4149': 'Росбанк',
};

// ============================================================
//  УТИЛИТЫ
// ============================================================
function getLevelInfo(withdrawCount) {
  if (withdrawCount === 0) return WITHDRAW_LEVELS[0];
  if (withdrawCount === 1) return WITHDRAW_LEVELS[1];
  return WITHDRAW_LEVELS[2];
}

function calcWithdrawBonus(amount, createdAt, now = Date.now()) {
  if (amount >= WITHDRAW_BONUS_MAX_AMOUNT) return 0;
  const hoursInProc = (now - new Date(createdAt).getTime()) / 3600000;
  const overdue = Math.max(0, Math.floor(hoursInProc - WITHDRAW_STANDARD_HOURS));
  return Math.min(WITHDRAW_BONUS_LIMIT, overdue * WITHDRAW_BONUS_PER_HOUR);
}

function detectCardBank(cardNumber) {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 4) return null;
  return CARD_BINS[clean.substring(0, 4)] || null;
}

function validateCardNumber(num) {
  const clean = num.replace(/\D/g, '');
  return clean.length === 16 || clean.length === 18;
}

function validatePhone(phone) {
  const clean = phone.replace(/\D/g, '');
  return clean.length === 11 && clean.startsWith('7');
}

function validateYooMoney(num) {
  const clean = num.replace(/\D/g, '');
  return clean.length >= 15 && clean.length <= 16 && clean.startsWith('41001');
}

function getWithdrawStatus(w) {
  const ageHours = (Date.now() - new Date(w.created_at).getTime()) / 3600000;
  if (w.status === 'paid') return { label: '✅ Выплачено', color: '#10b981' };
  if (w.status === 'rejected') return { label: '❌ Отклонено', color: '#ef4444' };
  if (ageHours > 72) return { label: '⚠️ Просрочено', color: '#ef4444' };
  if (ageHours > WITHDRAW_STANDARD_HOURS) return { label: '⏳ Задерживается', color: '#f59e0b' };
  return { label: '⏳ В обработке', color: '#00d4ff' };
}

// ============================================================
//  GET /api/withdrawals/levels — уровни вывода
// ============================================================
router.get('/levels', authRequired, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT withdraw_count, rubles FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0];
    const levelInfo = getLevelInfo(user.withdraw_count || 0);

    res.json({
      ok: true,
      level: levelInfo,
      currentBalance: user.rubles,
      withdrawCount: user.withdraw_count,
      canWithdraw: user.rubles >= levelInfo.min,
      missing: Math.max(0, levelInfo.min - user.rubles),
    });
  } catch (err) {
    console.error('GET /withdrawals/levels error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения уровней' });
  }
});

// ============================================================
//  GET /api/withdrawals/my — мои заявки
// ============================================================
router.get('/my', authRequired, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM withdrawals
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    const now = Date.now();
    const withdrawals = result.rows.map(w => {
      const bonus = w.status === 'pending' ? calcWithdrawBonus(w.amount, w.created_at, now) : w.bonus;
      return {
        ...w,
        current_bonus: bonus,
        status_display: getWithdrawStatus(w),
        standard_hours: WITHDRAW_STANDARD_HOURS,
      };
    });

    const active = withdrawals.filter(w => w.status === 'pending');
    const history = withdrawals.filter(w => w.status !== 'pending');

    res.json({
      ok: true,
      active,
      history,
      totalWithdrawn: history
        .filter(w => w.status === 'paid')
        .reduce((s, w) => s + w.amount, 0),
    });
  } catch (err) {
    console.error('GET /withdrawals/my error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения заявок' });
  }
});

// ============================================================
//  POST /api/withdrawals/create — создать заявку
//  Body: { amount, method, requisites, requisitesDisplay }
// ============================================================
router.post('/create', authRequired, async (req, res) => {
  try {
    const { amount, method, requisites, requisitesDisplay } = req.body;
    const userId = req.user.id;

    // Валидация суммы
    if (!amount || amount <= 0) {
      return res.status(400).json({ ok: false, error: 'Неверная сумма' });
    }

    // Получаем юзера
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Проверка, что нет активной заявки
    const activeCheck = await db.query(
      'SELECT id FROM withdrawals WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );
    if (activeCheck.rows.length > 0) {
      return res.status(409).json({ ok: false, error: 'У вас уже есть активная заявка на вывод' });
    }

    // Проверка минимума
    const levelInfo = getLevelInfo(user.withdraw_count || 0);
    if (amount < levelInfo.min) {
      return res.status(400).json({ ok: false, error: `Минимум для ${user.withdraw_count + 1}-го вывода: ${levelInfo.min} ₽` });
    }

    // Проверка баланса
    if (user.rubles < amount) {
      return res.status(400).json({ ok: false, error: 'Недостаточно средств' });
    }

    // Валидация реквизитов в зависимости от метода
    if (!method || !requisites) {
      return res.status(400).json({ ok: false, error: 'Укажите метод и реквизиты' });
    }

    // Создаём заявку
    const result = await db.query(
      `INSERT INTO withdrawals
        (user_id, number, amount, method, requisites, requisites_display, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, (user.withdraw_count || 0) + 1, amount, method, requisites, requisitesDisplay || requisites]
    );

    // Списываем с баланса
    await db.query(
      'UPDATE users SET rubles = rubles - $1, withdraw_count = withdraw_count + 1 WHERE id = $2',
      [amount, userId]
    );

    res.status(201).json({
      ok: true,
      message: 'Заявка создана',
      withdrawal: result.rows[0],
    });
  } catch (err) {
    console.error('POST /withdrawals/create error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка создания заявки' });
  }
});

// ============================================================
//  GET /api/withdrawals/status/:id — статус заявки
// ============================================================
router.get('/status/:id', authRequired, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM withdrawals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Заявка не найдена' });
    }

    const w = result.rows[0];
    const bonus = w.status === 'pending' ? calcWithdrawBonus(w.amount, w.created_at) : w.bonus;

    res.json({
      ok: true,
      withdrawal: {
        ...w,
        current_bonus: bonus,
        status_display: getWithdrawStatus(w),
        standard_hours: WITHDRAW_STANDARD_HOURS,
      },
    });
  } catch (err) {
    console.error('GET /withdrawals/status/:id error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения статуса' });
  }
});

module.exports = router;