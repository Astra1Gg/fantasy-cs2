// ============================================================
//  API — обёртка над fetch для работы с backend
//  v12.5 / Сессия 1 Этапа 4
// ============================================================

// ------------------------------------------------------------
//  КОНФИГ
// ------------------------------------------------------------
const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'fs2_token';

// ------------------------------------------------------------
//  ТОКЕН
// ------------------------------------------------------------
function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ------------------------------------------------------------
//  БАЗОВЫЙ ВЫЗОВ
//  apiCall('/api/auth/login', 'POST', { username, password })
//  → { ok, ...data } или { ok: false, error }
// ------------------------------------------------------------
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(API_URL + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
  } catch (err) {
    console.error('apiCall network error:', endpoint, err);
    return { ok: false, error: 'Нет связи с сервером. Проверьте интернет.' };
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    return { ok: false, error: 'Сервер вернул некорректный ответ (не JSON)' };
  }

  // 401 — токен истёк или невалиден → разлогин
  if (res.status === 401) {
    clearToken();
    if (data.error === 'Токен истёк' || data.error === 'Неверный токен') {
      if (typeof logout === 'function' && currentUser) {
        toast('⏰ Сессия истекла, войдите заново', '#f59e0b');
        setTimeout(() => logout(), 500);
      }
    }
  }

  return data;
}

// ------------------------------------------------------------
//  МАППЕР: user из API (snake_case) → state на фронте (camelCase)
// ------------------------------------------------------------
function mapUserFromApi(apiUser) {
  if (!apiUser) return null;

  // Нормализация last_active_day: '2026-09-30T21:00:00.000Z' → '2026-09-30'
  let lastActiveDay = apiUser.last_active_day;
  if (lastActiveDay && typeof lastActiveDay === 'string' && lastActiveDay.includes('T')) {
    lastActiveDay = new Date(lastActiveDay).toISOString().slice(0, 10);
  }

  // metadata — куда складываем всё, чего нет в схеме
  const meta = apiUser.metadata || {};

  // Нормализация bonuses (добавляем недостающие массивы)
  const bonuses = apiUser.bonuses || {};
  if (!bonuses.boosters) bonuses.boosters = [];
  if (!bonuses.insurance) bonuses.insurance = [];
  if (!bonuses.pendingCases) bonuses.pendingCases = [];

  return {
    // Основное
    user: apiUser.username,
    id: String(apiUser.id),         // bigint приходит строкой из pg, оставляем строкой
    email: apiUser.email,
    tgId: apiUser.telegram_id,
    fingerprint: apiUser.fingerprint,
    refCode: apiUser.ref_code,
    referredBy: apiUser.referred_by,

    // Игровые
    elo: apiUser.elo,
    bestElo: apiUser.best_elo,
    bestEloReached: apiUser.best_elo,
    fantasyPoints: apiUser.fantasy_points,
    rubles: apiUser.rubles,
    streak: apiUser.streak,
    bestStreak: apiUser.best_streak,
    killsStreak: apiUser.kills_streak,
    underdogWins: apiUser.underdog_wins,
    dailyStreak: apiUser.daily_streak,
    totalPredictions: apiUser.total_predictions,
    correctPredictions: apiUser.correct_predictions,
    casesOpened: apiUser.cases_opened,
    totalSpins: apiUser.total_spins,
    activityActions: apiUser.activity_actions,
    chatMessages: apiUser.chat_messages,
    withdrawCount: apiUser.withdraw_count,
    prizesCount: apiUser.prizes_count,

    // Косметика
    avatar: apiUser.avatar || 'default',
    frame: apiUser.frame || 'none',
    activeNickEffect: apiUser.active_nick_effect,
    activeBadges: apiUser.active_badges || {},
    cosmetics: apiUser.cosmetics || [],
    inventory: apiUser.inventory || [],

    // Бонусы
    bonuses,

    // Флаги
    verified: apiUser.verified,
    banned: apiUser.banned,
    isAdmin: apiUser.is_admin,

    // Даты
    lastActiveDay,
    createdAt: apiUser.created_at ? new Date(apiUser.created_at).getTime() : Date.now(),
    lastWheelSpin: apiUser.last_wheel_spin
      ? new Date(apiUser.last_wheel_spin).getTime()
      : null,

    // Из metadata (поля, которых нет в схеме)
    // Если там ничего нет — ставим безопасные дефолты
    lowEloReached: meta.lowEloReached || false,
    wheelReminderClosed: meta.wheelReminderClosed || false,
    eloRewardsClaimed: meta.eloRewardsClaimed || {},
    weeklyRewardClaimed: meta.weeklyRewardClaimed || null,
    monthlyRewardClaimed: meta.monthlyRewardClaimed || null,
    referralStages: meta.referralStages || { full: 0 },
    referralTracking: meta.referralTracking || {},
    referrals: meta.referrals || [],
    rubHistory: meta.rubHistory || [],
    notifications: meta.notifications || [],
    achievements: meta.achievements || {},
    lastActionTimes: meta.lastActionTimes || [],

    // Заглушки для полей, которые обычно приходят из БД отдельными ручками
    // (predictions, history, withdrawals, leagues) — заполним в enterGame
    predictions: {},
    history: [],
    withdrawals: [],
    leagues: { daily: { points: 0 }, weekly: { points: 0 }, monthly: { points: 0 } },
    specialLeagues: {},
  };
}

// ------------------------------------------------------------
//  МАППЕР: state (camelCase) → API (snake_case)
//  Используется для PATCH /api/profile/me
//  Отправляем ТОЛЬКО то, что разрешено менять
// ------------------------------------------------------------
function mapUserToApi(state) {
  const meta = {
    lowEloReached: state.lowEloReached,
    wheelReminderClosed: state.wheelReminderClosed,
    eloRewardsClaimed: state.eloRewardsClaimed,
    weeklyRewardClaimed: state.weeklyRewardClaimed,
    monthlyRewardClaimed: state.monthlyRewardClaimed,
    referralStages: state.referralStages,
    referralTracking: state.referralTracking,
    referrals: state.referrals,
    rubHistory: state.rubHistory,
    notifications: state.notifications,
    achievements: state.achievements,
    lastActionTimes: state.lastActionTimes,
  };

  return {
    avatar: state.avatar,
    frame: state.frame,
    active_nick_effect: state.activeNickEffect,
    active_badges: state.activeBadges,
    metadata: meta,
  };
}

// ------------------------------------------------------------
//  АВТО-ЛОГИН ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
//  Вызывается из main.js. Если токен есть — тянем /api/auth/me
//  и вызываем enterGame. Если нет — показываем auth-screen.
// ------------------------------------------------------------
async function tryAutoLogin() {
  const token = getToken();
  if (!token) return false;

  const res = await apiCall('/api/auth/me', 'GET');
  if (!res.ok || !res.user) {
    clearToken();
    return false;
  }

  // Превращаем API-юзера в state
  const userState = mapUserFromApi(res.user);

  // Догружаем остальные данные
  await loadAllGameData(userState);

  // Входим в игру
  enterGame(res.user.username, userState);
  return true;
}

// ------------------------------------------------------------
//  ЗАГРУЗКА ВСЕХ ДАННЫХ ИГРЫ
//  Заполняет: matches, reviews, chatMessages, leagues, predictions, withdrawals
// ------------------------------------------------------------
async function loadAllGameData(userState) {
  // Матчи
  const matchesRes = await apiCall('/api/matches?limit=100');
  if (matchesRes.ok && matchesRes.matches) {
    // Адаптируем поля match из API (snake_case) → фронт (camelCase)
    matches = matchesRes.matches.map(mapMatchFromApi);
  }

  // Отзывы
  const reviewsRes = await apiCall('/api/reviews');
  if (reviewsRes.ok && reviewsRes.reviews) {
    reviews = reviewsRes.reviews.map(r => ({
      id: r.id,
      author: r.author,
      text: r.text,
      image: r.image,
      isAdmin: r.is_admin,
      pinned: r.pinned,
      createdAt: new Date(r.created_at).getTime(),
      type: 'text',
    }));
  }

  // Сообщения чата
  const chatRes = await apiCall('/api/chat/messages?limit=200');
  if (chatRes.ok && chatRes.messages) {
    chatMessages = chatRes.messages.map(m => ({
      id: m.id,
      text: m.text,
      author: m.author,
      createdAt: new Date(m.created_at).getTime(),
      avatar: m.avatar,
      frame: m.frame,
      activeNickEffect: m.active_nick_effect,
      activeBadges: m.active_badges,
      cosmetics: m.cosmetics,
    }));
  }

  // Прогнозы игрока
  const predsRes = await apiCall('/api/predictions/my');
  if (predsRes.ok && predsRes.predictions) {
    const predictions = {};
    const history = [];
    for (const p of predsRes.predictions) {
      const m = matches.find(x => String(x.id) === String(p.match_id));
      const rec = {
        matchId: p.match_id,
        market: p.market,
        pick: p.pick,
        lineValue: p.line_value,
        isCorrect: p.is_correct,
        pointsAwarded: p.points_awarded,
        createdAt: new Date(p.created_at).getTime(),
        resolvedAt: p.resolved_at ? new Date(p.resolved_at).getTime() : null,
        teamA: m ? m.teamA : '',
        teamB: m ? m.teamB : '',
      };
      const key = `${p.match_id}_${p.market}`;
      predictions[key] = rec;
      if (p.is_correct !== null) history.push(rec);
    }
    userState.predictions = predictions;
    userState.history = history;
  }

  // Выводы игрока
  const wRes = await apiCall('/api/withdrawals/my');
  if (wRes.ok) {
    const all = [...(wRes.active || []), ...(wRes.history || [])];
    userState.withdrawals = all.map(mapWithdrawalFromApi);
  }

  // Мои очки в лигах
  const leagueRes = await apiCall('/api/leagues/my');
  if (leagueRes.ok && leagueRes.leagues) {
    for (const l of leagueRes.leagues) {
      if (l.type && userState.leagues[l.type]) {
        userState.leagues[l.type] = {
          points: parseInt(l.points) || 0,
          position: parseInt(l.position) || 0,
        };
      }
    }
  }
}

// ------------------------------------------------------------
//  МАППЕРЫ ДЛЯ СВЯЗАННЫХ СУЩНОСТЕЙ
// ------------------------------------------------------------

function mapMatchFromApi(m) {
  return {
    id: m.id,
    teamA: m.team_a,
    teamB: m.team_b,
    date: m.match_date
      ? new Date(m.match_date).toISOString().slice(0, 16).replace('T', ' ')
      : '',
    status: m.status,
    scoreA: m.score_a,
    scoreB: m.score_b,
    bestOf: m.best_of,
    markets: m.markets || {},
    resultWinner: m.result_winner,
    resultTotalKills: m.result_total_kills,
    resultPlayerKills: m.result_player_kills,
    twitch: m.twitch_url || '',
    kick: m.kick_url || '',
    createdAt: m.created_at ? new Date(m.created_at).getTime() : null,
  };
}

function mapWithdrawalFromApi(w) {
  return {
    id: w.id,
    number: w.number,
    amount: w.amount,
    method: w.method,
    requisites: w.requisites,
    requisitesDisplay: w.requisites_display,
    status: w.status,
    bonus: w.bonus || 0,
    screenshotUrl: w.screenshot_url,
    rejectedReason: w.rejected_reason,
    createdAt: new Date(w.created_at).getTime(),
    paidAt: w.paid_at ? new Date(w.paid_at).getTime() : null,
    rejectedAt: w.rejected_at ? new Date(w.rejected_at).getTime() : null,
  };
}

// ------------------------------------------------------------
//  ЭКСПОРТ В window (на случай, если где-то нужно явно)
// ------------------------------------------------------------
window.API_URL = API_URL;
window.apiCall = apiCall;
window.mapUserFromApi = mapUserFromApi;
window.mapUserToApi = mapUserToApi;
window.tryAutoLogin = tryAutoLogin;
window.loadAllGameData = loadAllGameData;
window.saveToken = saveToken;
window.getToken = getToken;
window.clearToken = clearToken;