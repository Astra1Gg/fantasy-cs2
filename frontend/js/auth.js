// ============================================================
//  АВТОРИЗАЦИЯ — v12.5 (Session 1 Stage 4)
// ============================================================

// ============================================================
//  ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК (Вход / Регистрация)
// ============================================================
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    document.getElementById('login-form').classList.toggle('hidden', !isLogin);
    document.getElementById('register-form').classList.toggle('hidden', isLogin);
    document.getElementById('auth-err').textContent = '';
    document.getElementById('reg-step1').classList.remove('hidden');
    document.getElementById('reg-step2').classList.add('hidden');
    if (!isLogin) generateCaptcha();
  });
});

// ============================================================
//  КАПЧА
// ============================================================
function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let result;
  if (op === '+') result = a + b;
  else if (op === '-') result = Math.max(a, b) - Math.min(a, b);
  else result = a * b;

  const question = op === '-'
    ? `Сколько будет ${Math.max(a, b)} − ${Math.min(a, b)}?`
    : `Сколько будет ${a} ${op} ${b}?`;

  const el = document.getElementById('captcha-q');
  if (el) el.textContent = question;
  captchaAnswer = result;
}

// ============================================================
//  РЕГИСТРАЦИЯ — шаг 1 (валидация + TG-верификация)
// ============================================================
function startTGVerify() {
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const captchaInput = parseInt(document.getElementById('captcha-a').value);
  const errEl = document.getElementById('auth-err');

  if (!user || !pass) { errEl.textContent = '⚠️ Заполните логин и пароль'; return; }
  if (user.length < 3) { errEl.textContent = '⚠️ Логин — минимум 3 символа'; return; }
  if (user.length > 20) { errEl.textContent = '⚠️ Логин — максимум 20 символов'; return; }
  if (!/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/.test(user)) { errEl.textContent = '⚠️ Логин: только буквы, цифры и _'; return; }
  if (pass.length < 6) { errEl.textContent = '⚠️ Пароль — минимум 6 символов'; return; }
  if (captchaInput !== captchaAnswer) {
    errEl.textContent = '⚠️ Неверный ответ на капчу. Попробуйте снова.';
    generateCaptcha();
    document.getElementById('captcha-a').value = '';
    return;
  }
  if (user === ADMIN_USER) { errEl.textContent = '⚠️ Этот логин занят. Выберите другой.'; return; }

  pendingRegister = {
    user, pass, fp: getFingerprint(),
    refCode: document.getElementById('reg-ref').value.trim().toUpperCase(),
    code: Math.floor(100000 + Math.random() * 900000).toString()
  };

  document.getElementById('tg-code').textContent = pendingRegister.code;
  document.getElementById('reg-step1').classList.add('hidden');
  document.getElementById('reg-step2').classList.remove('hidden');
  errEl.textContent = '';
}

function backToStep1() {
  document.getElementById('reg-step1').classList.remove('hidden');
  document.getElementById('reg-step2').classList.add('hidden');
  pendingRegister = null;
  document.getElementById('auth-err').textContent = '';
}

// ============================================================
//  РЕГИСТРАЦИЯ — шаг 2 (финал, через API)
// ============================================================
async function finishRegister() {
  if (!pendingRegister) return;
  const input = document.getElementById('reg-tgcode').value.trim();
  const errEl = document.getElementById('auth-err');

  if (!/^\d{6}$/.test(input)) {
    errEl.style.color = '#ef4444';
    errEl.textContent = '⚠️ Введите 6 цифр — код, который прислал бот.';
    return;
  }

  errEl.style.color = '#00d4ff';
  errEl.textContent = '⏳ Создаём аккаунт...';

  const res = await apiCall('/api/auth/register', 'POST', {
    username: pendingRegister.user,
    password: pendingRegister.pass,
    refCode: pendingRegister.refCode || null,
    fingerprint: pendingRegister.fp,
    telegramId: 'tg_' + input,
  });

  if (!res.ok) {
    errEl.style.color = '#ef4444';
    errEl.textContent = '⚠️ ' + (res.error || 'Ошибка регистрации');
    return;
  }

  saveToken(res.token);
  const userState = mapUserFromApi(res.user);
  await loadAllGameData(userState);

  toast('✅ Аккаунт создан! Добро пожаловать!', '#10b981');
  pendingRegister = null;
  errEl.textContent = '';
  enterGame(res.user.username, userState);
}

// ============================================================
//  ВХОД (через API)
// ============================================================
async function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('auth-err');

  if (!user || !pass) { errEl.textContent = '⚠️ Введите логин и пароль'; return; }

  errEl.style.color = '#00d4ff';
  errEl.textContent = '⏳ Проверяем...';

  const res = await apiCall('/api/auth/login', 'POST', { username: user, password: pass });

  if (!res.ok) {
    errEl.style.color = '#ef4444';
    errEl.textContent = '⚠️ ' + (res.error || 'Ошибка входа');
    return;
  }

  saveToken(res.token);

  const userState = mapUserFromApi(res.user);
  await loadAllGameData(userState);

  errEl.textContent = '';
  toast('✅ Привет, ' + user + '!', '#10b981');
  enterGame(res.user.username, userState);
}

// ============================================================
//  ВХОД В ИГРУ
// ============================================================
function enterGame(user, userState) {
  currentUser = user;
  localStorage.setItem('fs2_last_user', user);

  state = migrateUser(userState);
  leagueSettings = loadLeagueSettings();

  // Ежедневный вход — бонус
  const today = todayStr();
  if (state.lastActiveDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.lastActiveDay === yesterday) {
      state.dailyStreak = (state.dailyStreak || 0) + 1;
    } else {
      state.dailyStreak = 1;
    }
    state.lastActiveDay = today;
    state.fantasyPoints = (state.fantasyPoints || 0) + 5;
    state.activityActions = (state.activityActions || 0) + 1;
    apiCall('/api/profile/me', 'PATCH', mapUserToApi(state)).catch(() => {});
  }

  // UI
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  document.getElementById('header-admin').classList.toggle('hidden', !isAdmin());
  document.getElementById('admin-tab').classList.toggle('hidden', !isAdmin());

  updateHeader();
  renderPage('matches');

  // Проверки при входе
  checkAchievements();
  checkEloRewards();
  // checkActivityRewards();   // временно отключено — вернём в Сессии 3
  checkAutoLiveTransition();
  checkAutoRejectWithdrawals();
  // checkReferralProgress();  // временно отключено — нужен список всех юзеров
  checkUnseenNotifications();

  maybeShowWheelReminder();
  startLeagueTimer();
  startAutoLiveCheck();
  startWithdrawTick();
}

// ============================================================
//  МИГРАЦИЯ — гарантируем наличие ВСЕХ полей
// ============================================================
function migrateUser(u) {
  if (!u) u = {};
  if (u.elo === undefined) u.elo = ELO_START;
  if (u.bestElo === undefined) u.bestElo = u.elo || ELO_START;
  if (u.bestEloReached === undefined) u.bestEloReached = u.bestElo || ELO_START;
  if (u.fantasyPoints === undefined) u.fantasyPoints = 0;
  if (u.rubles === undefined) u.rubles = 0;
  if (u.streak === undefined) u.streak = 0;
  if (u.bestStreak === undefined) u.bestStreak = 0;
  if (u.killsStreak === undefined) u.killsStreak = 0;
  if (u.underdogWins === undefined) u.underdogWins = 0;
  if (u.dailyStreak === undefined) u.dailyStreak = 1;
  if (u.lastActiveDay === undefined) u.lastActiveDay = todayStr();
  if (u.lowEloReached === undefined) u.lowEloReached = false;
  if (u.totalPredictions === undefined) u.totalPredictions = 0;
  if (u.correctPredictions === undefined) u.correctPredictions = 0;
  if (u.casesOpened === undefined) u.casesOpened = 0;
  if (u.totalSpins === undefined) u.totalSpins = 0;
  if (u.activityActions === undefined) u.activityActions = 0;
  if (u.chatMessages === undefined) u.chatMessages = 0;
  if (u.withdrawCount === undefined) u.withdrawCount = 0;
  if (u.prizesCount === undefined) u.prizesCount = 0;

  // Косметика
  if (!u.avatar) u.avatar = 'default';
  if (!u.frame) u.frame = 'none';
  if (u.activeNickEffect === undefined) u.activeNickEffect = null;
  if (u.activeFrameEffect === undefined) u.activeFrameEffect = 'none';
  if (!u.activeBadges) u.activeBadges = {};
  if (!u.cosmetics) u.cosmetics = [];
  if (!u.inventory) u.inventory = [];

  // Бонусы
  if (!u.bonuses) u.bonuses = {};
  if (!u.bonuses.boosters) u.bonuses.boosters = [];
  if (!u.bonuses.insurance) u.bonuses.insurance = [];
  if (!u.bonuses.pendingCases) u.bonuses.pendingCases = [];

  // Флаги
  if (u.verified === undefined) u.verified = false;
  if (u.banned === undefined) u.banned = false;
  if (u.isAdmin === undefined) u.isAdmin = false;

  // Рефералы
  if (!u.refCode) u.refCode = genRefCode();
  if (u.referredBy === undefined) u.referredBy = null;
  if (!u.referrals) u.referrals = [];
  if (!u.referralTracking) u.referralTracking = {};
  if (!u.referralStages) u.referralStages = { full: 0 };

  // Прогнозы
  if (!u.predictions) u.predictions = {};
  if (!u.history) u.history = [];

  // Выводы
  if (!u.withdrawals) u.withdrawals = [];
  if (!u.rubHistory) u.rubHistory = [];

  // Лиги — ВАЖНО: не должно быть undefined внутри
  if (!u.leagues) u.leagues = {};
  if (!u.leagues.daily)   u.leagues.daily   = { points: 0 };
  if (!u.leagues.weekly)  u.leagues.weekly  = { points: 0 };
  if (!u.leagues.monthly) u.leagues.monthly = { points: 0 };
  if (u.leagues.daily.points === undefined)   u.leagues.daily.points = 0;
  if (u.leagues.weekly.points === undefined)  u.leagues.weekly.points = 0;
  if (u.leagues.monthly.points === undefined) u.leagues.monthly.points = 0;
  if (!u.specialLeagues) u.specialLeagues = {};

  // Достижения и прочее — ВСЁ должно быть объектом, не undefined
  if (!u.achievements) u.achievements = {};
  if (!u.eloRewardsClaimed) u.eloRewardsClaimed = {};
  if (!u.notifications) u.notifications = [];
  if (!u.lastActionTimes) u.lastActionTimes = [];

  // Время колеса
  if (u.lastWheelSpin === undefined) u.lastWheelSpin = null;
  if (u.wheelReminderClosed === undefined) u.wheelReminderClosed = false;
  if (u.weeklyRewardClaimed === undefined) u.weeklyRewardClaimed = null;
  if (u.monthlyRewardClaimed === undefined) u.monthlyRewardClaimed = null;
  if (u.createdAt === undefined) u.createdAt = Date.now();

  return u;
}

// ============================================================
//  ВЫХОД
// ============================================================
function logout() {
  if (currentUser && state && state.user) {
    apiCall('/api/profile/me', 'PATCH', mapUserToApi(state)).catch(() => {});
  }

  clearToken();
  currentUser = null;
  state = {};
  matches = [];
  chatMessages = [];
  reviews = [];

  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('main-screen').classList.add('hidden');
  toast('👋 До встречи!', '#8b95a8');
}

// ============================================================
//  ОБНОВЛЕНИЕ ШАПКИ
// ============================================================
function updateHeader() {
  if (!state || !state.user) return;
  document.getElementById('header-username').textContent = state.user;

  const rank = getEloRank(state.elo || ELO_START);
  document.getElementById('header-elo-icon').textContent = rank.icon;
  document.getElementById('header-elo-icon').style.filter = `drop-shadow(0 0 10px ${rank.color})`;
  document.getElementById('header-elo-value').textContent = state.elo || ELO_START;
  document.getElementById('header-elo-value').style.color = rank.color;

  document.getElementById('header-points').textContent = fmt(state.fantasyPoints || 0);

  const d = (state.leagues && state.leagues.daily   && state.leagues.daily.points)   || 0;
  const w = (state.leagues && state.leagues.weekly  && state.leagues.weekly.points)  || 0;
  const m = (state.leagues && state.leagues.monthly && state.leagues.monthly.points) || 0;
  document.getElementById('tt-daily').textContent   = fmtSigned(d);
  document.getElementById('tt-weekly').textContent  = fmtSigned(w);
  document.getElementById('tt-monthly').textContent = fmtSigned(m);

  const rubPill = document.getElementById('header-rub-pill');
  if ((state.rubles || 0) > 0) {
    rubPill.classList.remove('hidden');
    document.getElementById('header-rub').textContent = fmt(state.rubles);
  } else {
    rubPill.classList.add('hidden');
  }

  const streakEl = document.getElementById('header-streak');
  if ((state.streak || 0) >= 2) {
    streakEl.classList.remove('hidden');
    streakEl.textContent = `🔥 Стрик ${state.streak}`;
  } else {
    streakEl.classList.add('hidden');
  }
}

// ============================================================
//  УВЕДОМЛЕНИЯ (о выплате / отказе)
// ============================================================
function checkUnseenNotifications() {
  if (!state.notifications || state.notifications.length === 0) return;
  const unseen = state.notifications.filter(n => !n.seen);
  unseen.forEach(n => {
    setTimeout(() => {
      if (n.type === 'withdraw_paid') {
        showCelebration();
        setTimeout(() => showPaidNotification(n), 500);
      } else if (n.type === 'withdraw_rejected') {
        showRejectedNotification(n);
      }
      n.seen = true;
    }, 1000);
  });
  saveState();
}

function showPaidNotification(n) {
  document.getElementById('modal').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:80px;margin-bottom:14px;animation: bounceIn 0.8s ease;">🎉</div>
      <div style="font-size:24px;font-weight:900;background:linear-gradient(90deg,#ffd700,#ff0080,#00d4ff);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation: shimmer 2s linear infinite;margin-bottom:12px;">ВЫВОД ВЫПЛАЧЕН!</div>
      <div style="font-size:14px;line-height:1.7;color:#b0b8c8;margin-bottom:18px;">${n.text}</div>
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(0,212,255,0.1));border:2px solid #10b981;border-radius:16px;padding:20px;margin-bottom:18px;">
        <div style="font-size:48px;margin-bottom:8px;">💸</div>
        <div style="font-size:16px;font-weight:800;color:#10b981;">Деньги отправлены!</div>
        <div style="font-size:12px;color:#8b95a8;margin-top:8px;">Проверьте баланс по реквизитам</div>
      </div>
      <button class="btn btn-primary" style="width:100%;min-height:50px;font-size:15px;" onclick="closeModal()">Отлично!</button>
    </div>
    <style>
      @keyframes bounceIn { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
    </style>`;
  document.getElementById('modal-bg').classList.add('show');
}

function showRejectedNotification(n) {
  document.getElementById('modal').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:64px;margin-bottom:14px;">❌</div>
      <div style="font-size:20px;font-weight:800;color:#ef4444;margin-bottom:12px;">Вывод отклонён</div>
      <div style="font-size:14px;line-height:1.7;color:#b0b8c8;margin-bottom:18px;">${n.text}</div>
      ${n.reason ? `<div style="background:rgba(239,68,68,0.1);border:2px solid #ef4444;border-radius:14px;padding:16px;margin-bottom:18px;text-align:left;">
        <div style="font-size:11px;color:#8b95a8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Причина отказа:</div>
        <div style="font-size:15px;font-weight:700;color:#ff8888;">${n.reason}</div>
      </div>` : ''}
      <div style="background:rgba(0,212,255,0.08);border:1px solid #00d4ff;border-radius:12px;padding:12px;font-size:12px;color:#00d4ff;margin-bottom:14px;">💰 Средства возвращены на баланс</div>
      <button class="btn btn-primary" style="width:100%;min-height:48px;" onclick="closeModal()">Понятно</button>
    </div>`;
  document.getElementById('modal-bg').classList.add('show');
}

// ============================================================
//  ВХОД/РЕГИСТРАЦИЯ ПО ENTER
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  ['login-user', 'login-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); doLogin(); }
      });
    }
  });

  ['reg-user', 'reg-pass', 'reg-ref', 'captcha-a'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); startTGVerify(); }
      });
    }
  });

  const tgCodeEl = document.getElementById('reg-tgcode');
  if (tgCodeEl) {
    tgCodeEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); finishRegister(); }
    });
  }
});