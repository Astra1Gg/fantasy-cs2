// ============================================================
//  УТИЛИТЫ — v12.2
// ============================================================

// Форматирование чисел
function fmt(n) {
  return Math.floor(n).toLocaleString('ru-RU').replace(/,/g, ' ');
}
function fmtSigned(n) {
  return (n >= 0 ? '+' : '−') + Math.abs(Math.floor(n)).toLocaleString('ru-RU');
}

// Время
function now() { return Date.now(); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function weekStr() {
  const d = new Date();
  const firstDay = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
  return d.getFullYear() + '-W' + weekNum;
}
function monthStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function formatTimer(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}д ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function formatTimeSince(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Toast-уведомление
function toast(text, color = '#00d4ff') {
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.borderColor = color;
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ELO — определение ранга
function getEloRank(elo) {
  return ELO_RANKS.find(r => elo >= r.min && elo < r.max) || ELO_RANKS[ELO_RANKS.length - 1];
}

// Пользователи — сохранение/загрузка
function saveUsers() {
  if (!currentUser) return;
  const users = JSON.parse(localStorage.getItem('fs2_users') || '{}');
  users[currentUser] = state;
  localStorage.setItem('fs2_users', JSON.stringify(users));
}
function loadUsers() {
  return JSON.parse(localStorage.getItem('fs2_users') || '{}');
}

// Матчи
function saveMatches() {
  localStorage.setItem('fs2_matches', JSON.stringify(matches));
}
function loadMatches() {
  const s = localStorage.getItem('fs2_matches');
  if (s) { try { return JSON.parse(s); } catch(e) {} }
  return JSON.parse(JSON.stringify(DEFAULT_MATCHES));
}

// Настройки лиг
function saveLeagueSettings() {
  localStorage.setItem('fs2_league_settings', JSON.stringify(leagueSettings));
}
function loadLeagueSettings() {
  const saved = localStorage.getItem('fs2_league_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.daily && parsed.weekly && parsed.monthly) {
        if (!parsed.special) parsed.special = [];
        return parsed;
      }
    } catch(e) {}
  }
  return {
    daily:   { startTime: now(), durationDays: 1,  prizes: [100, 50, 35],      active: true },
    weekly:  { startTime: now(), durationDays: 7,  prizes: [500, 250, 100],    active: true },
    monthly: { startTime: now(), durationDays: 30, prizes: [1500, 1000, 500],  active: true },
    special: [],
  };
}

// Отзывы
function saveReviews() {
  localStorage.setItem('fs2_reviews', JSON.stringify(reviews));
}
function loadReviews() {
  const s = localStorage.getItem('fs2_reviews');
  if (s) { try { return JSON.parse(s); } catch(e) {} }
  return [{
    id: 'r1',
    author: 'admin',
    text: '🎉 Добро пожаловать в Fantasy CS2!\n\nПриветственный бонус 100 🟡 новым игрокам. Делайте прогнозы, поднимайте ELO, забирайте призы. Удачи!',
    createdAt: now() - 86400000 * 3,
    pinned: true,
    isAdmin: true,
    type: 'text'
  }];
}

// Общее сохранение
function saveState() {
  saveUsers();
  saveMatches();
  saveLeagueSettings();
  saveReviews();
}

// Проверки
function isAdmin() {
  return currentUser === ADMIN_USER;
}
function genRefCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function getFingerprint() {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.platform
  ].join('|');
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return 'fp_' + Math.abs(hash).toString(36);
}

// Лиги — проверки
function getLeagueEndTime(type) {
  const s = leagueSettings[type];
  if (!s) return now();
  return s.startTime + s.durationDays * 24 * 3600 * 1000;
}
function isLeagueActive(type) {
  const s = leagueSettings[type];
  if (!s || !s.active) return false;
  return getLeagueEndTime(type) > now();
}

// ============================================================
//  ВАЛИДАТОРЫ ДЛЯ ВЫВОДА
// ============================================================
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

// ============================================================
//  ВЫВОДЫ — расчёты
// ============================================================
function calcWithdrawBonus(w, atTime = null) {
  const t = atTime || now();
  if (w.amount >= WITHDRAW_BONUS_MAX_AMOUNT) return 0;
  const hoursInProc = (t - w.createdAt) / 3600000;
  const overdue = Math.max(0, Math.floor(hoursInProc - WITHDRAW_STANDARD_HOURS));
  return Math.min(WITHDRAW_BONUS_LIMIT, overdue * WITHDRAW_BONUS_PER_HOUR);
}
function getWithdrawStatus(w) {
  const t = now();
  const ageHours = (t - w.createdAt) / 3600000;
  if (w.status === 'paid') return { label: '✅ Выплачено', color: '#10b981' };
  if (w.status === 'rejected') return { label: '❌ Отклонено', color: '#ef4444' };
  if (ageHours > WITHDRAW_AUTO_REJECT_HOURS) return { label: '⚠️ Просрочено', color: '#ef4444' };
  if (ageHours > WITHDRAW_STANDARD_HOURS) return { label: '⏳ Задерживается', color: '#f59e0b' };
  return { label: '⏳ В обработке', color: '#00d4ff' };
}

// Escape HTML (защита от XSS в чате)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
// ============================================================
//  ПРАЗДНИЧНАЯ АНИМАЦИЯ (конфетти + фейерверк)
// ============================================================
function showCelebration() {
  const overlay = document.getElementById('celebration-overlay');
  overlay.classList.add('show');
  setTimeout(() => overlay.classList.remove('show'), 2000);

  const colors = ['#ffd700', '#ff0080', '#00ff88', '#00aaff', '#ff00ff', '#ffffff', '#10b981'];

  // Падающее конфетти
  for (let i = 0; i < 200; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      const size = Math.random() * 12 + 6;
      const startX = Math.random() * window.innerWidth;
      const rotation = Math.random() * 360;
      c.style.cssText = `position:fixed;top:-20px;left:${startX}px;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '0'};pointer-events:none;z-index:10003;transform:rotate(${rotation}deg);box-shadow:0 0 10px currentColor;animation:fall_${i % 3} ${2 + Math.random() * 2}s linear forwards;`;
      const style = document.createElement('style');
      style.textContent = `@keyframes fall_${i % 3} { to { transform: translateY(110vh) rotate(${rotation + 720}deg); opacity: 0; } }`;
      document.head.appendChild(style);
      document.body.appendChild(c);
      setTimeout(() => { c.remove(); style.remove(); }, 5000);
    }, i * 15);
  }

  // Фейерверк из центра
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for (let j = 0; j < 40; j++) {
        const angle = (j / 40) * Math.PI * 2;
        const speed = 5 + Math.random() * 5;
        const p = document.createElement('div');
        const size = Math.random() * 8 + 4;
        p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:50%;pointer-events:none;z-index:10003;box-shadow:0 0 15px currentColor;transition:all 1.5s cubic-bezier(0.1, 0.8, 0.3, 1);`;
        document.body.appendChild(p);
        setTimeout(() => {
          p.style.transform = `translate(${Math.cos(angle) * 300 * speed / 5}px, ${Math.sin(angle) * 300 * speed / 5}px) scale(0)`;
          p.style.opacity = '0';
        }, 20);
        setTimeout(() => p.remove(), 2000);
      }
    }, i * 400);
  }
}

// ============================================================
//  ДОСТИЖЕНИЯ — показ уведомлений и проверки
// ============================================================
function showAchievementToast(ach) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;z-index:9999;background:linear-gradient(145deg,#131826,#0f1420);border:2px solid #10b981;border-radius:16px;padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 10px 40px rgba(16,185,129,0.3);';
  el.innerHTML = `
    <div style="font-size:32px;">${ach.icon}</div>
    <div>
      <div style="font-size:10px;color:#8b95a8;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">🏅 Новое достижение</div>
      <div style="font-size:15px;font-weight:800;color:#10b981;">${ach.name}</div>
      <div style="font-size:11px;color:#8b95a8;margin-top:2px;">${ach.desc}</div>
    </div>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

function checkAchievements() {
  if (!state.achievements) state.achievements = {};
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (state.achievements[ach.id]) continue;
    try {
      if (ach.check(state)) {
        state.achievements[ach.id] = now();
        newlyUnlocked.push(ach);
      }
    } catch(e) {}
  }
  if (newlyUnlocked.length > 0) {
    let delay = 0;
    for (const ach of newlyUnlocked) {
      setTimeout(() => showAchievementToast(ach), delay);
      delay += 4300;
    }
    saveUsers();
  }
}

// ============================================================
//  НАГРАДЫ ЗА ELO-РАНГ
// ============================================================
function checkEloRewards() {
  if (!state.eloRewardsClaimed) state.eloRewardsClaimed = {};
  for (const r of ELO_RANKS) {
    if (state.elo >= r.min && !state.eloRewardsClaimed[r.name]) {
      state.eloRewardsClaimed[r.name] = now();
      if (r.reward) {
        state.fantasyPoints = (state.fantasyPoints || 0) + r.reward.points;
        if (!state.bonuses.pendingCases) state.bonuses.pendingCases = [];
        r.reward.cases.forEach(c => state.bonuses.pendingCases.push(c));
        toast(`🎉 Ранг ${r.icon} ${r.name}! +${r.reward.points} 🟡 и ${r.reward.cases.length} кейсов`, '#ffd700');
        saveUsers();
      }
    }
  }
}

// ============================================================
//  НАГРАДЫ ЗА АКТИВНОСТЬ (недельная, месячная)
// ============================================================
function checkActivityRewards() {
  const currentWeek = weekStr();
  if (state.weeklyRewardClaimed !== currentWeek && !isAdmin()) {
    if ((state.activityActions || 0) >= 20) {
      state.weeklyRewardClaimed = currentWeek;
      state.fantasyPoints = (state.fantasyPoints || 0) + 100;
      state.bonuses.pendingCases = state.bonuses.pendingCases || [];
      state.bonuses.pendingCases.push('small');
      toast('🏆 Топ активности за неделю! +100 🟡 + Малый кейс', '#10b981');
      saveUsers();
    }
  }
  const currentMonth = monthStr();
  if (state.monthlyRewardClaimed !== currentMonth && !isAdmin()) {
    if ((state.activityActions || 0) >= 50) {
      state.monthlyRewardClaimed = currentMonth;
      state.fantasyPoints = (state.fantasyPoints || 0) + 500;
      state.bonuses.pendingCases = state.bonuses.pendingCases || [];
      state.bonuses.pendingCases.push('medium');
      toast('🌟 Топ активности за месяц! +500 🟡 + Средний кейс', '#ffd700');
      saveUsers();
    }
  }
}

// ============================================================
//  АВТО-ПЕРЕХОД МАТЧЕЙ В LIVE
// ============================================================
function checkAutoLiveTransition() {
  let changed = false;
  matches.forEach(m => {
    if (m.status === 'upcoming') {
      const matchTime = new Date(m.date.replace(' ', 'T')).getTime();
      if (matchTime <= now()) {
        m.status = 'live';
        m.scoreA = 0;
        m.scoreB = 0;
        m.liveStats = { killsA: 0, killsB: 0, roundTime: 45, currentRound: 1, mapName: 'Mirage' };
        changed = true;
      }
    }
  });
  if (changed) saveMatches();
}

// ============================================================
//  РЕФЕРАЛЫ — проверка прогресса
// ============================================================
function checkReferralProgress() {
  if (!currentUser || isAdmin()) return;
  const users = loadUsers();
  const me = users[currentUser];
  if (!me || !me.referralTracking) return;
  let changed = false;
  Object.keys(me.referralTracking).forEach(refName => {
    const ref = users[refName];
    if (!ref) return;
    const track = me.referralTracking[refName];
    const refPredictions = (ref.history || []).length;
    const refWithdrawCount = ref.withdrawCount || 0;

    if (!track.fivePredictions && refPredictions >= 5) {
      track.fivePredictions = true;
      me.fantasyPoints = (me.fantasyPoints || 0) + 250;
      track.totalEarned = (track.totalEarned || 50) + 250;
      toast(`🎉 Друг ${refName} сделал 5 прогнозов! +250 🟡`, '#10b981');
      changed = true;
    }
    if (!track.firstWithdraw && refWithdrawCount >= 1) {
      track.firstWithdraw = true;
      me.fantasyPoints = (me.fantasyPoints || 0) + 400;
      track.totalEarned = (track.totalEarned || 0) + 400;
      toast(`🎉 Друг ${refName} сделал первый вывод! +400 🟡`, '#10b981');
      changed = true;
    }
    if (!track.secondWithdraw && refWithdrawCount >= 2) {
      track.secondWithdraw = true;
      me.bonuses.pendingCases = me.bonuses.pendingCases || [];
      me.bonuses.pendingCases.push('medium');
      track.totalEarned = (track.totalEarned || 0) + 500;
      toast(`🎉 Друг ${refName} сделал второй вывод! 💎 Средний кейс`, '#a78bfa');
      changed = true;
    }
    if (!track.thirdWithdraw && refWithdrawCount >= 3) {
      track.thirdWithdraw = true;
      me.bonuses.pendingCases = me.bonuses.pendingCases || [];
      me.bonuses.pendingCases.push('large');
      track.totalEarned = (track.totalEarned || 0) + 1000;
      me.referralStages = me.referralStages || { full: 0 };
      me.referralStages.full = (me.referralStages.full || 0) + 1;
      toast(`🎉 Друг ${refName} сделал третий вывод! 👑 Большой кейс`, '#ffd700');
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem('fs2_users', JSON.stringify(users));
    state = me;
    updateHeader();
  }
}

// ============================================================
//  АВТО-ОТКЛОНЕНИЕ ЗАЯВОК (72 часа)
// ============================================================
function checkAutoRejectWithdrawals() {
  const cutoff = now() - WITHDRAW_AUTO_REJECT_HOURS * 3600000;
  let changed = false;
  (state.withdrawals || []).forEach(w => {
    if (w.status === 'pending' && w.createdAt < cutoff) {
      w.status = 'rejected';
      w.rejectedReason = 'Авто-отклонение: превышено время ожидания';
      w.rejectedAt = now();
      const bonus = calcWithdrawBonus(w);
      state.rubles = (state.rubles || 0) + w.amount + bonus;
      if (!state.notifications) state.notifications = [];
      state.notifications.push({
        id: 'n_' + now(),
        type: 'withdraw_rejected',
        title: '❌ Вывод отклонён',
        text: `Авто-отклонение: превышено время ожидания (${WITHDRAW_AUTO_REJECT_HOURS}ч). Средства возвращены на баланс.`,
        reason: 'Превышено время ожидания обработки',
        createdAt: now(),
        seen: false
      });
      changed = true;
    }
  });
  if (changed) {
    saveUsers();
    toast('⚠️ Просроченные заявки возвращены на баланс', '#f59e0b');
  }
}

// ============================================================
//  ТАЙМЕРЫ И АВТО-ПРОВЕРКИ (запускаются при входе)
// ============================================================
function startAutoLiveCheck() {
  if (window._autoLiveTimer) clearInterval(window._autoLiveTimer);
  window._autoLiveTimer = setInterval(() => {
    if (currentUser) {
      checkAutoLiveTransition();
      checkReferralProgress();
    }
  }, 30000);
}

function startWithdrawTick() {
  if (window._withdrawTick) clearInterval(window._withdrawTick);
  window._withdrawTick = setInterval(() => {
    if (!currentUser) return;
    document.querySelectorAll('[data-withdraw-timer]').forEach(el => {
      const wid = el.dataset.withdrawTimer;
      const w = (state.withdrawals || []).find(x => x.id === wid);
      if (!w) return;
      el.textContent = formatTimeSince(now() - w.createdAt);

      const bonusEl = document.querySelector(`[data-withdraw-bonus="${wid}"]`);
      if (bonusEl && w.status === 'pending') {
        const bonus = calcWithdrawBonus(w);
        bonusEl.textContent = bonus > 0 ? `+${bonus} ₽` : '0 ₽';
      }
      const progressEl = document.querySelector(`[data-withdraw-progress="${wid}"]`);
      if (progressEl && w.status === 'pending') {
        const progress = Math.min(100, ((now() - w.createdAt) / (WITHDRAW_STANDARD_HOURS * 3600000)) * 100);
        progressEl.style.width = progress + '%';
      }
    });
  }, 1000);
}