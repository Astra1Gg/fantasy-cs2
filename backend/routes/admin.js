// ============================================================
//  ADMIN ROUTES — админка
// ============================================================
const express = require('express');
const db = require('../db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const POINTS_CORRECT = 100;
const POINTS_WRONG = -150;
const STREAK_BONUS = { 3: 50, 5: 150, 10: 500 };
const ELO_WIN_FAVORITE = 10;
const ELO_WIN_UNDERDOG = 25;
const ELO_LOSE_FAVORITE = -15;
const ELO_LOSE_UNDERDOG = -10;
const ELO_START = 1000;

const WITHDRAW_STANDARD_HOURS = 12;
const WITHDRAW_BONUS_PER_HOUR = 5;
const WITHDRAW_BONUS_LIMIT = 100;
const WITHDRAW_BONUS_MAX_AMOUNT = 500;

// ============================================================
//  УТИЛИТЫ
// ============================================================
function calcWithdrawBonus(amount, createdAt, now = Date.now()) {
  if (amount >= WITHDRAW_BONUS_MAX_AMOUNT) return 0;
  const hoursInProc = (now - new Date(createdAt).getTime()) / 3600000;
  const overdue = Math.max(0, Math.floor(hoursInProc - WITHDRAW_STANDARD_HOURS));
  return Math.min(WITHDRAW_BONUS_LIMIT, overdue * WITHDRAW_BONUS_PER_HOUR);
}

// ============================================================
//  POST /api/admin/accrue — начислить игроку
//  Body: { target, type, amount }
//  target: username | '__all__'
//  type: points | rubles | case_small | case_medium | case_large
//        | booster10 | booster20 | booster30 | insurance | vip
// ============================================================
router.post('/accrue', authRequired, adminRequired, async (req, res) => {
  try {
    const { target, type, amount = 1 } = req.body;

    if (!target || !type) {
      return res.status(400).json({ ok: false, error: 'target и type обязательны' });
    }

    const users = await db.query('SELECT id, username, bonuses, cosmetics FROM users WHERE banned = FALSE');
    const targets = target === '__all__'
      ? users.rows
      : users.rows.filter(u => u.username === target);

    if (targets.length === 0) {
      return res.status(404).json({ ok: false, error: 'Игрок не найден' });
    }

    let updated = 0;

    for (const u of targets) {
      let sql = '';
      let params = [];

      switch (type) {
        case 'points':
          sql = 'UPDATE users SET fantasy_points = fantasy_points + $1 WHERE id = $2';
          params = [amount, u.id];
          break;

        case 'rubles':
          sql = 'UPDATE users SET rubles = rubles + $1 WHERE id = $2';
          params = [amount, u.id];
          break;

        case 'case_small':
        case 'case_medium':
        case 'case_large': {
          const caseType = type.replace('case_', '');
          const bonuses = u.bonuses || { boosters: [], insurance: [], pendingCases: [] };
          if (!bonuses.pendingCases) bonuses.pendingCases = [];
          for (let i = 0; i < amount; i++) bonuses.pendingCases.push(caseType);
          sql = 'UPDATE users SET bonuses = $1::jsonb WHERE id = $2';
          params = [JSON.stringify(bonuses), u.id];
          break;
        }

        case 'booster10':
        case 'booster20':
        case 'booster30': {
          const value = parseInt(type.replace('booster', ''));
          const bonuses = u.bonuses || { boosters: [], insurance: [], pendingCases: [] };
          if (!bonuses.boosters) bonuses.boosters = [];
          for (let i = 0; i < amount; i++) {
            bonuses.boosters.push({ value, usedOn: null, activated: false });
          }
          sql = 'UPDATE users SET bonuses = $1::jsonb WHERE id = $2';
          params = [JSON.stringify(bonuses), u.id];
          break;
        }

        case 'insurance': {
          const bonuses = u.bonuses || { boosters: [], insurance: [], pendingCases: [] };
          if (!bonuses.insurance) bonuses.insurance = [];
          for (let i = 0; i < amount; i++) {
            bonuses.insurance.push({ type: 'regular', usedOn: null, activated: false });
          }
          sql = 'UPDATE users SET bonuses = $1::jsonb WHERE id = $2';
          params = [JSON.stringify(bonuses), u.id];
          break;
        }

        case 'vip': {
          const cosmetics = u.cosmetics || [];
          if (!cosmetics.includes('vip')) cosmetics.push('vip');
          sql = 'UPDATE users SET cosmetics = $1::jsonb WHERE id = $2';
          params = [JSON.stringify(cosmetics), u.id];
          break;
        }

        default:
          return res.status(400).json({ ok: false, error: 'Неверный тип начисления' });
      }

      await db.query(sql, params);
      updated++;
    }

    res.json({
      ok: true,
      message: `Начислено: ${type} × ${amount} — ${updated} игрок(ов)`,
      updated,
    });
  } catch (err) {
    console.error('POST /admin/accrue error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка начисления' });
  }
});

// ============================================================
//  GET /api/admin/withdrawals — очередь заявок
// ============================================================
router.get('/withdrawals', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        w.*,
        u.username
       FROM withdrawals w
       JOIN users u ON u.id = w.user_id
       ORDER BY
         CASE WHEN w.status = 'pending' THEN 0 ELSE 1 END,
         w.created_at DESC
       LIMIT 200`
    );

    const now = Date.now();
    const items = result.rows.map(w => {
      const bonus = w.status === 'pending' ? calcWithdrawBonus(w.amount, w.created_at, now) : w.bonus;
      return { ...w, current_bonus: bonus };
    });

    const pending = items.filter(w => w.status === 'pending');
    const processed = items.filter(w => w.status !== 'pending');

    res.json({
      ok: true,
      pending,
      processed,
      stats: {
        pendingCount: pending.length,
        pendingSum: pending.reduce((s, w) => s + w.amount, 0),
        paidCount: processed.filter(w => w.status === 'paid').length,
        paidSum: processed.filter(w => w.status === 'paid').reduce((s, w) => s + w.amount, 0),
      },
    });
  } catch (err) {
    console.error('GET /admin/withdrawals error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения заявок' });
  }
});

// ============================================================
//  POST /api/admin/withdrawals/:id/pay — выплатить
//  Body: { screenshot_url }
// ============================================================
router.post('/withdrawals/:id/pay', authRequired, adminRequired, async (req, res) => {
  try {
    const { screenshot_url } = req.body;
    const withdrawalId = req.params.id;

    // Получаем заявку
    const wResult = await db.query('SELECT * FROM withdrawals WHERE id = $1', [withdrawalId]);
    if (wResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Заявка не найдена' });
    }
    const w = wResult.rows[0];

    if (w.status !== 'pending') {
      return res.status(409).json({ ok: false, error: 'Заявка уже обработана' });
    }

    const bonus = calcWithdrawBonus(w.amount, w.created_at);

    // Обновляем заявку
    await db.query(
      `UPDATE withdrawals
       SET status = 'paid',
           paid_at = NOW(),
           bonus = $1,
           screenshot_url = $2
       WHERE id = $3`,
      [bonus, screenshot_url || null, withdrawalId]
    );

    // Начисляем бонус игроку (если был)
    if (bonus > 0) {
      await db.query(
        'UPDATE users SET rubles = rubles + $1 WHERE id = $2',
        [bonus, w.user_id]
      );
    }

    // Уведомление игроку
    await db.query(
      `INSERT INTO notifications (user_id, type, title, text, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        w.user_id,
        'withdraw_paid',
        '✅ Вывод выплачен!',
        `Сумма: ${w.amount} ₽${bonus > 0 ? ` + бонус за задержку ${bonus} ₽` : ''}`,
      ]
    );

    res.json({
      ok: true,
      message: `Выплачено ${w.amount} ₽${bonus > 0 ? ` (+${bonus} ₽ бонус)` : ''}`,
      bonus,
    });
  } catch (err) {
    console.error('POST /admin/withdrawals/:id/pay error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка выплаты' });
  }
});

// ============================================================
//  POST /api/admin/withdrawals/:id/reject — отклонить
//  Body: { reason }
// ============================================================
router.post('/withdrawals/:id/reject', authRequired, adminRequired, async (req, res) => {
  try {
    const { reason } = req.body;
    const withdrawalId = req.params.id;

    if (!reason || reason.length < 5) {
      return res.status(400).json({ ok: false, error: 'Укажите причину (мин. 5 символов)' });
    }

    const wResult = await db.query('SELECT * FROM withdrawals WHERE id = $1', [withdrawalId]);
    if (wResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Заявка не найдена' });
    }
    const w = wResult.rows[0];

    if (w.status !== 'pending') {
      return res.status(409).json({ ok: false, error: 'Заявка уже обработана' });
    }

    const bonus = calcWithdrawBonus(w.amount, w.created_at);
    const refundAmount = w.amount + bonus;

    // Обновляем заявку
    await db.query(
      `UPDATE withdrawals
       SET status = 'rejected',
           rejected_at = NOW(),
           rejected_reason = $1,
           bonus = $2
       WHERE id = $3`,
      [reason, bonus, withdrawalId]
    );

    // Возвращаем средства
    await db.query(
      'UPDATE users SET rubles = rubles + $1 WHERE id = $2',
      [refundAmount, w.user_id]
    );

    // Уведомление
    await db.query(
      `INSERT INTO notifications (user_id, type, title, text, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        w.user_id,
        'withdraw_rejected',
        '❌ Вывод отклонён',
        `Заявка на ${w.amount} ₽ отклонена. Средства возвращены на баланс.`,
        reason,
      ]
    );

    res.json({
      ok: true,
      message: `Отклонено, возвращено ${refundAmount} ₽`,
      refundAmount,
      bonus,
    });
  } catch (err) {
    console.error('POST /admin/withdrawals/:id/reject error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка отклонения' });
  }
});

// ============================================================
//  GET /api/admin/players — список игроков
// ============================================================
router.get('/players', authRequired, adminRequired, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        id, username, email, elo, best_elo, fantasy_points, rubles,
        total_predictions, correct_predictions, cases_opened,
        banned, ban_reason, is_admin, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 500`
    );

    res.json({ ok: true, count: result.rows.length, players: result.rows });
  } catch (err) {
    console.error('GET /admin/players error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка получения игроков' });
  }
});

// ============================================================
//  POST /api/admin/players/:username/ban — забанить/разбанить
//  Body: { reason? }
// ============================================================
router.post('/players/:username/ban', authRequired, adminRequired, async (req, res) => {
  try {
    const { username } = req.params;
    const { reason } = req.body;

    if (username === 'admin') {
      return res.status(400).json({ ok: false, error: 'Нельзя забанить админа' });
    }

    const userResult = await db.query(
      'SELECT id, banned FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Игрок не найден' });
    }

    const user = userResult.rows[0];
    const newBanned = !user.banned;

    await db.query(
      'UPDATE users SET banned = $1, ban_reason = $2 WHERE id = $3',
      [newBanned, newBanned ? (reason || 'Нарушение правил') : null, user.id]
    );

    res.json({
      ok: true,
      message: newBanned ? `🚫 ${username} забанен` : `✅ ${username} разбанен`,
      banned: newBanned,
    });
  } catch (err) {
    console.error('POST /admin/players/:username/ban error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка бана' });
  }
});

// ============================================================
//  POST /api/admin/matches/:id/finish — завершить матч + пересчёт
//  Body: { scoreA, scoreB, winner, totalKills, playerKills }
// ============================================================
router.post('/matches/:id/finish', authRequired, adminRequired, async (req, res) => {
  try {
    const matchId = req.params.id;
    const { scoreA, scoreB, winner, totalKills, playerKills } = req.body;

    // Проверяем матч
    const matchResult = await db.query('SELECT * FROM matches WHERE id = $1', [matchId]);
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Матч не найден' });
    }
    const match = matchResult.rows[0];

    if (match.status === 'finished') {
      return res.status(409).json({ ok: false, error: 'Матч уже завершён' });
    }

    // Обновляем матч
    await db.query(
      `UPDATE matches
       SET status = 'finished',
           score_a = $1,
           score_b = $2,
           result_winner = $3,
           result_total_kills = $4,
           result_player_kills = $5::jsonb
       WHERE id = $6`,
      [scoreA || 0, scoreB || 0, winner, totalKills || 0, JSON.stringify(playerKills || {}), matchId]
    );

    // Пересчитываем прогнозы
    const predictions = await db.query(
      'SELECT * FROM predictions WHERE match_id = $1 AND is_correct IS NULL',
      [matchId]
    );

    let resolved = 0;

    for (const pred of predictions.rows) {
      let isCorrect = false;
      let points = 0;

      const market = pred.market;
      const pick = pred.pick;

      if (market === 'winner') {
        isCorrect = pick === winner;
      } else if (market === 'total_kills') {
        const line = pred.line_value;
        isCorrect = (pick === 'over' && totalKills > line) ||
                    (pick === 'under' && totalKills < line);
      } else if (market.endsWith('_kills')) {
        const player = market.replace('_kills', '');
        const actual = (playerKills || {})[player];
        const line = pred.line_value;
        if (actual !== undefined && line) {
          isCorrect = (pick === 'over' && actual > line) ||
                      (pick === 'under' && actual < line);
        }
      }

      points = isCorrect ? POINTS_CORRECT : POINTS_WRONG;

      await db.query(
        `UPDATE predictions
         SET is_correct = $1,
             points_awarded = $2,
             resolved_at = NOW()
         WHERE id = $3`,
        [isCorrect, points, pred.id]
      );

      // Начисляем игроку
      await db.query(
        `UPDATE users
         SET fantasy_points = fantasy_points + $1,
             correct_predictions = correct_predictions + $2,
             activity_actions = activity_actions + 1
         WHERE id = $3`,
        [points, isCorrect ? 1 : 0, pred.user_id]
      );

      // Обновляем очки в лигах
      const activeLeagues = await db.query(
        'SELECT id FROM leagues WHERE active = TRUE'
      );
      for (const league of activeLeagues.rows) {
        await db.query(
          `INSERT INTO league_points (user_id, league_id, points, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (user_id, league_id)
           DO UPDATE SET points = league_points.points + $3, updated_at = NOW()`,
          [pred.user_id, league.id, points]
        );
      }

      resolved++;
    }

    res.json({
      ok: true,
      message: `Матч завершён, обработано прогнозов: ${resolved}`,
      resolved,
    });
  } catch (err) {
    console.error('POST /admin/matches/:id/finish error:', err);
    res.status(500).json({ ok: false, error: 'Ошибка завершения матча' });
  }
});

module.exports = router;