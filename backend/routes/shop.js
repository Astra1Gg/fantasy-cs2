// ============================================================
//  SHOP ROUTES — магазин, покупки, кейсы
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  КОНСТАНТЫ МАГАЗИНА (синхронизировано с config.js фронта)
// ============================================================
const BOOSTERS = [
  { id: 'boost10', name: 'Бустер +10%', icon: '🎯', points: 50,  value: 10 },
  { id: 'boost20', name: 'Бустер +20%', icon: '🎯', points: 120, value: 20 },
  { id: 'boost30', name: 'Бустер +30%', icon: '🎯', points: 250, value: 30 },
];

const INSURANCE = [
  { id: 'ins_regular', name: 'Страховка', icon: '🛡️', points: 180, type: 'regular' },
  { id: 'ins_premium', name: 'Премиум-страховка', icon: '💎', points: 400, type: 'premium' },
];

const CASE_PRICES = { small: 50, medium: 120, large: 350 };

// CASE_TABLES — синхронизировано с shop.js фронта
const CASE_TABLES = {
  small: [
    { chance: 25,   prize: { type: 'points',    icon: '🟡', name: '+20 очков',      rarity: 'common',    amount: 20 } },
    { chance: 23,   prize: { type: 'points',    icon: '🟡', name: '+40 очков',      rarity: 'common',    amount: 40 } },
    { chance: 19,   prize: { type: 'points',    icon: '🟡', name: '+70 очков',      rarity: 'rare',      amount: 70 } },
    { chance: 13,   prize: { type: 'booster',   icon: '🎯', name: 'Бустер +10%',    rarity: 'rare',      value: 10, count: 1 } },
    { chance: 7,    prize: { type: 'booster',   icon: '🎯', name: 'Бустер +10% ×2', rarity: 'epic',      value: 10, count: 2 } },
    { chance: 9,    prize: { type: 'insurance', icon: '🛡️', name: 'Страховка',      rarity: 'rare',      insType: 'regular', count: 1 } },
    { chance: 4,    prize: { type: 'insurance', icon: '🛡️', name: 'Страховка ×2',   rarity: 'epic',      insType: 'regular', count: 2 } },
    { chance: 0.2,  prize: { type: 'skin',      icon: '🔫', name: 'Скин (common)',  rarity: 'legendary', skinRarity: 'common' } },
  ],
  medium: [
    { chance: 22,   prize: { type: 'points',    icon: '🟡', name: '+50 очков',        rarity: 'common',    amount: 50 } },
    { chance: 20.5, prize: { type: 'points',    icon: '🟡', name: '+100 очков',       rarity: 'common',    amount: 100 } },
    { chance: 17,   prize: { type: 'points',    icon: '🟡', name: '+180 очков',       rarity: 'rare',      amount: 180 } },
    { chance: 10,   prize: { type: 'booster',   icon: '🎯', name: 'Бустер +20%',      rarity: 'rare',      value: 20, count: 1 } },
    { chance: 7,    prize: { type: 'booster',   icon: '🎯', name: 'Бустер +20% ×2',   rarity: 'epic',      value: 20, count: 2 } },
    { chance: 5,    prize: { type: 'booster',   icon: '🎯', name: 'Бустер +30%',      rarity: 'epic',      value: 30, count: 1 } },
    { chance: 3,    prize: { type: 'booster',   icon: '🎯', name: 'Бустер +30% ×2',   rarity: 'legendary', value: 30, count: 2 } },
    { chance: 6.5,  prize: { type: 'insurance', icon: '🛡️', name: 'Страховка ×2',     rarity: 'epic',      insType: 'regular', count: 2 } },
    { chance: 4,    prize: { type: 'insurance', icon: '🛡️', name: 'Страховка ×3',     rarity: 'epic',      insType: 'regular', count: 3 } },
    { chance: 4.5,  prize: { type: 'case',      icon: '📦', name: 'Малый кейс',       rarity: 'epic',      caseType: 'small' } },
    { chance: 0.5,  prize: { type: 'skin',      icon: '🔫', name: 'Скин (rare)',      rarity: 'legendary', skinRarity: 'rare' } },
  ],
  large: [
    { chance: 18,   prize: { type: 'points',    icon: '🟡', name: '+150 очков',          rarity: 'common',    amount: 150 } },
    { chance: 16,   prize: { type: 'points',    icon: '🟡', name: '+300 очков',          rarity: 'common',    amount: 300 } },
    { chance: 12,   prize: { type: 'points',    icon: '🟡', name: '+500 очков',          rarity: 'rare',      amount: 500 } },
    { chance: 6,    prize: { type: 'points',    icon: '🟡', name: '+800 очков',          rarity: 'epic',      amount: 800 } },
    { chance: 8,    prize: { type: 'booster',   icon: '🎯', name: 'Бустер +30% ×2',     rarity: 'epic',      value: 30, count: 2 } },
    { chance: 6,    prize: { type: 'booster',   icon: '🎯', name: 'Бустер +30% ×3',     rarity: 'epic',      value: 30, count: 3 } },
    { chance: 3,    prize: { type: 'booster',   icon: '🎯', name: 'Бустер +30% ×5',     rarity: 'legendary', value: 30, count: 5 } },
    { chance: 6,    prize: { type: 'insurance', icon: '💎', name: 'Премиум-страховка ×2', rarity: 'epic',    insType: 'premium', count: 2 } },
    { chance: 4,    prize: { type: 'insurance', icon: '💎', name: 'Премиум-страховка ×3', rarity: 'epic',    insType: 'premium', count: 3 } },
    { chance: 6,    prize: { type: 'case',      icon: '💎', name: 'Средний кейс ×2',    rarity: 'epic',      caseType: 'medium', count: 2 } },
    { chance: 3,    prize: { type: 'case',      icon: '👑', name: 'Большой кейс',       rarity: 'legendary', caseType: 'large', count: 1 } },
    { chance: 2,    prize: { type: 'skin',      icon: '🔫', name: 'Скин (epic)',        rarity: 'legendary', skinRarity: 'epic' } },
  ],
};

// CASE_SKINS — синхронизировано с config.js фронта
const CASE_SKINS = {
  common: [
    { id: 'skin_ak_slate',        name: 'AK-47 | Slate',              icon: '⬛', rarity: 'common', price: 60 },
    { id: 'skin_m4_guardian',     name: 'M4A1-S | Guardian',          icon: '🟦', rarity: 'common', price: 75 },
    { id: 'skin_awp_worm',        name: 'AWP | Worm God',             icon: '🟩', rarity: 'common', price: 90 },
    { id: 'skin_glock_weasel',    name: 'Glock-18 | Weasel',          icon: '🟨', rarity: 'common', price: 70 },
    { id: 'skin_usp_blueprint',   name: 'USP-S | Blueprint',          icon: '🔵', rarity: 'common', price: 85 },
  ],
  rare: [
    { id: 'skin_ak_redline',      name: 'AK-47 | Redline',            icon: '🔴', rarity: 'rare',   price: 350 },
    { id: 'skin_m4_cyrex',        name: 'M4A1-S | Cyrex',             icon: '🟥', rarity: 'rare',   price: 400 },
    { id: 'skin_awp_asiimov',     name: 'AWP | Asiimov',              icon: '🟠', rarity: 'rare',   price: 600 },
    { id: 'skin_deagle_code_red', name: 'Desert Eagle | Code Red',    icon: '🟥', rarity: 'rare',   price: 450 },
    { id: 'skin_ak_asiimov',      name: 'AK-47 | Asiimov',            icon: '🟧', rarity: 'rare',   price: 700 },
  ],
  epic: [
    { id: 'skin_awp_hyperbeast',  name: 'AWP | Hyper Beast',          icon: '🐉', rarity: 'epic',   price: 900 },
    { id: 'skin_ak_fire_serpent', name: 'AK-47 | Fire Serpent',       icon: '🔥', rarity: 'epic',   price: 1300 },
    { id: 'skin_m4_howl',         name: 'M4A4 | Howl',                icon: '🐺', rarity: 'epic',   price: 2000 },
    { id: 'skin_awp_medusa',      name: 'AWP | Medusa',               icon: '🐍', rarity: 'epic',   price: 1800 },
    { id: 'skin_ak_wild_lotus',   name: 'AK-47 | Wild Lotus',         icon: '🌸', rarity: 'epic',   price: 2000 },
  ],
};

// ============================================================
//  УТИЛИТЫ
// ============================================================
function pickCasePrize(caseType) {
  const table = CASE_TABLES[caseType];
  if (!table) return null;

  const total = table.reduce((s, row) => s + row.chance, 0);
  let roll = Math.random() * total;

  for (const row of table) {
    roll -= row.chance;
    if (roll <= 0) {
      const p = { ...row.prize };
      if (p.type === 'skin') {
        const pool = CASE_SKINS[p.skinRarity] || [];
        const skin = pool[Math.floor(Math.random() * pool.length)];
        p.skin = skin;
        p.name = skin.name;
        p.icon = skin.icon;
      }
      return p;
    }
  }
  return { ...table[0].prize };
}

// ============================================================
//  GET /api/shop/items — список всех товаров
// ============================================================
router.get('/items', async (req, res) => {
  try {
    res.json({
      ok: true,
      boosters: BOOSTERS,
      insurance: INSURANCE,
      cases: [
        { id: 'small',  name: 'Малый кейс',   icon: '📦', points: CASE_PRICES.small },
        { id: 'medium', name: 'Средний кейс', icon: '💎', points: CASE_PRICES.medium },
        { id: 'large',  name: 'Большой кейс', icon: '👑', points: CASE_PRICES.large },
      ],
    });
  } catch (err) {
    console.error('GET /shop/items error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения товаров' });
  }
});

// ============================================================
//  POST /api/shop/buy-booster — купить бустер
// ============================================================
router.post('/buy-booster', authRequired, async (req, res) => {
  try {
    const { boosterId } = req.body;
    const booster = BOOSTERS.find(b => b.id === boosterId);
    if (!booster) {
      return res.status(400).json({ ok: false, error: 'Неверный id бустера' });
    }

    const userResult = await db.query('SELECT fantasy_points, bonuses FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if (user.fantasy_points < booster.points) {
      return res.status(400).json({ ok: false, error: `Нужно ${booster.points} очков` });
    }

    const bonuses = user.bonuses || { boosters: [], insurance: [], pendingCases: [] };
    if (!bonuses.boosters) bonuses.boosters = [];
    bonuses.boosters.push({ value: booster.value, usedOn: null, activated: false });

    const result = await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points - $1,
           bonuses = $2::jsonb
       WHERE id = $3
       RETURNING id, fantasy_points, bonuses`,
      [booster.points, JSON.stringify(bonuses), req.user.id]
    );

    res.json({
      ok: true,
      message: `${booster.name} куплен!`,
      profile: result.rows[0],
    });
  } catch (err) {
    console.error('POST /shop/buy-booster error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка покупки бустера' });
  }
});

// ============================================================
//  POST /api/shop/buy-insurance — купить страховку
// ============================================================
router.post('/buy-insurance', authRequired, async (req, res) => {
  try {
    const { insuranceId } = req.body;
    const insurance = INSURANCE.find(i => i.id === insuranceId);
    if (!insurance) {
      return res.status(400).json({ ok: false, error: 'Неверный id страховки' });
    }

    const userResult = await db.query('SELECT fantasy_points, bonuses FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if (user.fantasy_points < insurance.points) {
      return res.status(400).json({ ok: false, error: `Нужно ${insurance.points} очков` });
    }

    const bonuses = user.bonuses || { boosters: [], insurance: [], pendingCases: [] };
    if (!bonuses.insurance) bonuses.insurance = [];
    bonuses.insurance.push({ type: insurance.type, usedOn: null, activated: false });

    const result = await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points - $1,
           bonuses = $2::jsonb
       WHERE id = $3
       RETURNING id, fantasy_points, bonuses`,
      [insurance.points, JSON.stringify(bonuses), req.user.id]
    );

    res.json({
      ok: true,
      message: `${insurance.name} куплена!`,
      profile: result.rows[0],
    });
  } catch (err) {
    console.error('POST /shop/buy-insurance error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка покупки страховки' });
  }
});

// ============================================================
//  POST /api/shop/open-case — открыть кейс
// ============================================================
router.post('/open-case', authRequired, async (req, res) => {
  try {
    const { caseType } = req.body;
    const price = CASE_PRICES[caseType];
    if (!price) {
      return res.status(400).json({ ok: false, error: 'Неверный тип кейса' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if (user.fantasy_points < price) {
      return res.status(400).json({ ok: false, error: `Нужно ${price} очков` });
    }

    const prize = pickCasePrize(caseType);
    if (!prize) {
      return res.status(500).json({ ok: false, error: 'Ошибка генерации приза' });
    }

    // Применяем приз к состоянию игрока
    const updates = {
      fantasy_points_delta: -price,
      bonuses: user.bonuses || { boosters: [], insurance: [], pendingCases: [] },
      inventory: user.inventory || [],
      cases_opened_delta: 1,
      activity_actions_delta: 1,
    };

    const count = prize.count || 1;

    switch (prize.type) {
      case 'points':
        updates.fantasy_points_delta += prize.amount;
        break;

      case 'booster':
        if (!updates.bonuses.boosters) updates.bonuses.boosters = [];
        for (let i = 0; i < count; i++) {
          updates.bonuses.boosters.push({ value: prize.value, usedOn: null, activated: false });
        }
        break;

      case 'insurance':
        if (!updates.bonuses.insurance) updates.bonuses.insurance = [];
        for (let i = 0; i < count; i++) {
          updates.bonuses.insurance.push({ type: prize.insType || 'regular', usedOn: null, activated: false });
        }
        break;

      case 'case':
        if (!updates.bonuses.pendingCases) updates.bonuses.pendingCases = [];
        for (let i = 0; i < count; i++) {
          updates.bonuses.pendingCases.push(prize.caseType);
        }
        break;

      case 'skin':
        if (prize.skin) {
          updates.inventory.push({ ...prize.skin, obtainedAt: new Date().toISOString() });
        }
        break;
    }

    const result = await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points + $1,
           bonuses = $2::jsonb,
           inventory = $3::jsonb,
           cases_opened = cases_opened + $4,
           activity_actions = activity_actions + $5
       WHERE id = $6
       RETURNING id, fantasy_points, bonuses, inventory, cases_opened`,
      [
        updates.fantasy_points_delta,
        JSON.stringify(updates.bonuses),
        JSON.stringify(updates.inventory),
        updates.cases_opened_delta,
        updates.activity_actions_delta,
        req.user.id,
      ]
    );

    res.json({
      ok: true,
      message: 'Кейс открыт',
      prize,
      profile: result.rows[0],
    });
  } catch (err) {
    console.error('POST /shop/open-case error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка открытия кейса' });
  }
});

// ============================================================
//  POST /api/shop/open-pending-case — открыть отложенный кейс
// ============================================================
router.post('/open-pending-case', authRequired, async (req, res) => {
  try {
    const { index } = req.body;

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    const bonuses = user.bonuses || { boosters: [], insurance: [], pendingCases: [] };
    if (!bonuses.pendingCases || bonuses.pendingCases.length === 0) {
      return res.status(400).json({ ok: false, error: 'Нет отложенных кейсов' });
    }

    if (index < 0 || index >= bonuses.pendingCases.length) {
      return res.status(400).json({ ok: false, error: 'Неверный индекс' });
    }

    const caseType = bonuses.pendingCases[index];
    const prize = pickCasePrize(caseType);
    if (!prize) {
      return res.status(500).json({ ok: false, error: 'Ошибка генерации приза' });
    }

    // Удаляем из очереди
    bonuses.pendingCases.splice(index, 1);

    // Применяем приз
    const inventory = user.inventory || [];
    const count = prize.count || 1;

    switch (prize.type) {
      case 'points':
        bonuses.pendingPoints = (bonuses.pendingPoints || 0) + prize.amount;
        break;
      case 'booster':
        if (!bonuses.boosters) bonuses.boosters = [];
        for (let i = 0; i < count; i++) {
          bonuses.boosters.push({ value: prize.value, usedOn: null, activated: false });
        }
        break;
      case 'insurance':
        if (!bonuses.insurance) bonuses.insurance = [];
        for (let i = 0; i < count; i++) {
          bonuses.insurance.push({ type: prize.insType || 'regular', usedOn: null, activated: false });
        }
        break;
      case 'case':
        for (let i = 0; i < count; i++) {
          bonuses.pendingCases.push(prize.caseType);
        }
        break;
      case 'skin':
        if (prize.skin) {
          inventory.push({ ...prize.skin, obtainedAt: new Date().toISOString() });
        }
        break;
    }

    // Если выпали очки — добавляем отдельно
    const pointsFromPrize = prize.type === 'points' ? prize.amount : 0;

    const result = await db.query(
      `UPDATE users
       SET fantasy_points = fantasy_points + $1,
           bonuses = $2::jsonb,
           inventory = $3::jsonb,
           cases_opened = cases_opened + 1,
           activity_actions = activity_actions + 1
       WHERE id = $4
       RETURNING id, fantasy_points, bonuses, inventory, cases_opened`,
      [
        pointsFromPrize,
        JSON.stringify(bonuses),
        JSON.stringify(inventory),
        req.user.id,
      ]
    );

    res.json({
      ok: true,
      message: 'Кейс открыт',
      prize,
      profile: result.rows[0],
    });
  } catch (err) {
    console.error('POST /shop/open-pending-case error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка открытия кейса' });
  }
});

module.exports = router;