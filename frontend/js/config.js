// ============================================================
//  КОНСТАНТЫ FANTASY CS2 — v12.2
// ============================================================

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';  // ⚠️ Временно, потом переедет на сервер
const POINTS_CORRECT = 100;
const POINTS_WRONG = -150;
const MINUTES_BEFORE_MATCH = 1;
const STREAK_BONUS = { 3: 50, 5: 150, 10: 500 };
const ELO_START = 1000;
const ELO_WIN_FAVORITE = 10;
const ELO_WIN_UNDERDOG = 25;
const ELO_LOSE_FAVORITE = -15;
const ELO_LOSE_UNDERDOG = -10;
const WITHDRAW_STANDARD_HOURS = 12;
const WITHDRAW_BONUS_PER_HOUR = 5;
const WITHDRAW_BONUS_LIMIT = 100;
const WITHDRAW_BONUS_MAX_AMOUNT = 500;
const WITHDRAW_AUTO_REJECT_HOURS = 72;

// ============================================================
//  БАНКИ (определение по номеру карты)
// ============================================================
const CARD_BINS = {
  '2202': { name: 'Т-Банк', emoji: '🟡' }, '2200': { name: 'Сбербанк', emoji: '🟢' },
  '2201': { name: 'Сбербанк', emoji: '🟢' }, '2203': { name: 'Альфа-Банк', emoji: '🔴' },
  '2204': { name: 'ВТБ', emoji: '🔵' }, '4276': { name: 'Сбербанк', emoji: '🟢' },
  '4279': { name: 'Сбербанк', emoji: '🟢' }, '4817': { name: 'Сбербанк', emoji: '🟢' },
  '5486': { name: 'Сбербанк', emoji: '🟢' }, '5336': { name: 'Т-Банк', emoji: '🟡' },
  '5536': { name: 'Т-Банк', emoji: '🟡' }, '4154': { name: 'Альфа-Банк', emoji: '🔴' },
  '4167': { name: 'ВТБ', emoji: '🔵' }, '4272': { name: 'ВТБ', emoji: '🔵' },
  '4890': { name: 'ВТБ', emoji: '🔵' }, '5213': { name: 'Газпромбанк', emoji: '🔷' },
  '5157': { name: 'Райффайзен', emoji: '🟨' }, '4627': { name: 'Открытие', emoji: '🟦' },
  '4165': { name: 'Росбанк', emoji: '🟣' }, '4377': { name: 'Россельхозбанк', emoji: '🟩' },
  '4779': { name: 'Совкомбанк', emoji: '🟠' }, '4469': { name: 'Почта Банк', emoji: '📮' },
  '4149': { name: 'Росбанк', emoji: '🟣' },
};

// ============================================================
//  РАНГИ ELO — с живыми описаниями
// ============================================================
const ELO_RANKS = [
  { name: 'Bronze',   icon: '🥉', min: 0,    max: 900,   color: '#cd7f32', reward: { points: 100,  cases: ['small'] } },
  { name: 'Silver',   icon: '🥈', min: 900,  max: 1200,  color: '#c0c0c0', reward: { points: 200,  cases: ['small', 'small'] } },
  { name: 'Gold',     icon: '🥇', min: 1200, max: 1500,  color: '#ffd700', reward: { points: 400,  cases: ['small', 'small', 'medium'] } },
  { name: 'Platinum', icon: '💎', min: 1500, max: 1900,  color: '#88ddff', reward: { points: 700,  cases: ['medium', 'medium'] } },
  { name: 'Diamond',  icon: '👑', min: 1900, max: 2300,  color: '#a78bfa', reward: { points: 1200, cases: ['medium', 'medium', 'large'] } },
  { name: 'Legend',   icon: '⚡', min: 2300, max: 99999, color: '#ff44ff', reward: { points: 3000, cases: ['large', 'large', 'large'] } },
];

// ============================================================
//  АВАТАРЫ
// ============================================================
const AVATARS = [
  { id: 'default', icon: '👤', name: 'Стандарт', free: true },
  { id: 'av1',  icon: '🐱', name: 'Кот' }, { id: 'av2',  icon: '🐺', name: 'Волк' },
  { id: 'av3',  icon: '🦁', name: 'Лев' },  { id: 'av4',  icon: '🐉', name: 'Дракон' },
  { id: 'av5',  icon: '🦅', name: 'Орёл' }, { id: 'av6',  icon: '👻', name: 'Призрак' },
  { id: 'av7',  icon: '🤖', name: 'Робот' },{ id: 'av8',  icon: '👽', name: 'Инопланетянин' },
  { id: 'av9',  icon: '🐲', name: 'Змей' }, { id: 'av10', icon: '🦊', name: 'Лис' },
  { id: 'av11', icon: '🐻', name: 'Медведь' },{ id: 'av12', icon: '⚡', name: 'Молния' },
  { id: 'av13', icon: '🎯', name: 'Мишень' },{ id: 'av14', icon: '🔥', name: 'Огонь' },
  { id: 'av15', icon: '💀', name: 'Череп' },{ id: 'av16', icon: '😎', name: 'Крутой' },
];

// ============================================================
//  РАМКИ АВАТАРА
// ============================================================
const FRAMES = [
  { id: 'none',     name: 'Без рамки',  icon: '⬜', free: true, cost: 0 },
  { id: 'gold',     name: 'Золото',     icon: '🟨', cost: 100 },
  { id: 'fire',     name: 'Огонь',      icon: '🔥', cost: 150 },
  { id: 'vip',      name: 'VIP',        icon: '💎', cost: 180 },
  { id: 'electric', name: 'Электро',    icon: '⚡', cost: 200 },
  { id: 'crystal',  name: 'Кристалл',   icon: '🔷', cost: 250 },
  { id: 'rainbow',  name: 'Радуга',     icon: '🌈', cost: 350 },
  { id: 'void',     name: 'Пустота',    icon: '🌑', cost: 500 },
];

// ============================================================
//  БУСТЕРЫ — с понятными описаниями
// ============================================================
const BOOSTERS = [
  { id: 'boost10', name: 'Бустер +10%', icon: '🎯', points: 50,  value: 10, desc: 'Увеличит награду за следующий удачный прогноз на 10%. Если не угадаете — сгорит.' },
  { id: 'boost20', name: 'Бустер +20%', icon: '🎯', points: 120, value: 20, desc: 'Увеличит награду за следующий удачный прогноз на 20%. Окупается, если прогноз верный.' },
  { id: 'boost30', name: 'Бустер +30%', icon: '🎯', points: 250, value: 30, desc: 'Максимальный бустер. +30% к награде за удачный прогноз. Для тех, кто уверен в анализе.' },
];

// ============================================================
//  СТРАХОВКИ
// ============================================================
const INSURANCE = [
  { id: 'ins_regular', name: 'Страховка', icon: '🛡️', points: 180, type: 'regular', desc: 'Защищает от штрафа -150 за одну ошибку. Прогноз не угадали — минуса не будет.' },
  { id: 'ins_premium', name: 'Премиум-страховка', icon: '💎', points: 400, type: 'premium', desc: 'Двойная защита: не снимается штраф за ошибку И не сгорает серия побед. Для тех, кто на волне.' },
];
// ============================================================
//  ДОСТИЖЕНИЯ — с человеческими описаниями
// ============================================================
const ACHIEVEMENTS = [
  // --- ОБУЧЕНИЕ (common) ---
  { id: 'first_pred',  icon: '🎯', name: 'Первый шаг',           rarity: 'common',    desc: 'Сделайте самый первый прогноз. Дальше будет интереснее.', check: (s) => (s.history || []).length >= 1 || Object.keys(s.predictions || {}).length >= 1 },
  { id: 'first_win',   icon: '✅', name: 'Есть попадание!',      rarity: 'common',    desc: 'Угадайте исход хотя бы одного матча.', check: (s) => (s.history || []).filter(h => h.correct).length >= 1 },
  { id: 'first_loss',  icon: '💔', name: 'Первый промах',        rarity: 'common',    desc: 'Иногда ошибаются все. Главное — не сдаваться.', check: (s) => (s.history || []).filter(h => !h.correct).length >= 1 },
  { id: 'pred_5',      icon: '📝', name: 'Практикант',           rarity: 'common',    desc: 'Сделайте 5 прогнозов. Начинаете входить во вкус.', check: (s) => (s.history || []).length >= 5 },
  { id: 'pred_10',     icon: '📋', name: 'Уверенный новичок',    rarity: 'common',    desc: '10 прогнозов — уже не случайный гость.', check: (s) => (s.history || []).length >= 10 },
  { id: 'win_3',       icon: '🥉', name: 'Три в ряд',            rarity: 'common',    desc: 'Угадайте 3 прогноза подряд.', check: (s) => (s.bestStreak || 0) >= 3 },
  { id: 'win_5',       icon: '🔥', name: 'Разогрев',             rarity: 'common',    desc: '5 попаданий подряд. Вы точно знаете CS2.', check: (s) => (s.bestStreak || 0) >= 5 },
  { id: 'acc_50',      icon: '📊', name: 'Полтинник',            rarity: 'common',    desc: 'Держите точность 50% после 10 прогнозов.', check: (s) => (s.history || []).length >= 10 && (s.history.filter(h => h.correct).length / s.history.length) >= 0.5 },
  { id: 'pred_kills',  icon: '🔫', name: 'Снайпер',              rarity: 'common',    desc: 'Угадайте kills конкретного игрока (больше/меньше).', check: (s) => (s.history || []).some(h => h.market && h.market.endsWith('_kills') && h.correct) },
  { id: 'pred_total',  icon: '📈', name: 'Статистик',            rarity: 'common',    desc: 'Угадайте тотал убийств в матче.', check: (s) => (s.history || []).some(h => h.market === 'total_kills' && h.correct) },
  { id: 'pred_winner', icon: '🏆', name: 'Провидец',             rarity: 'common',    desc: 'Угадайте победителя матча. Классика!', check: (s) => (s.history || []).some(h => h.market === 'winner' && h.correct) },
  { id: 'day_1',       icon: '🌅', name: 'Ранняя пташка',        rarity: 'common',    desc: 'Зашли в игру в первый же день после регистрации.', check: (s) => s.createdAt && (Date.now() - s.createdAt) < 24 * 3600 * 1000 },
  { id: 'streak_reset',icon: '🔄', name: 'Второе дыхание',       rarity: 'common',    desc: 'Вернулись в игру после серии неудач — и снова в деле.', check: (s) => (s.bestStreak || 0) >= 5 && (s.history || []).some(h => !h.correct) },
  { id: 'elo_1100',    icon: '📈', name: 'Выше среднего',        rarity: 'common',    desc: 'Достигните 1100 ELO. Вы уже лучше новичка.', check: (s) => (s.elo || ELO_START) >= 1100 },
  { id: 'elo_1200',    icon: '⭐', name: 'Серебро',              rarity: 'common',    desc: '1200 ELO — вы в Silver-лиге.', check: (s) => (s.elo || ELO_START) >= 1200 },
  { id: 'first_spin',  icon: '🎡', name: 'Первый спин',          rarity: 'common',    desc: 'Крутаните Колесо Фортуны хотя бы раз.', check: (s) => (s.totalSpins || 0) >= 1 },
  { id: 'referral_1',  icon: '🤝', name: 'Первый друг',          rarity: 'common',    desc: 'Пригласите друга по реферальной ссылке.', check: (s) => (s.referrals || []).length >= 1 },
  { id: 'chat_first',  icon: '💬', name: 'В эфире',              rarity: 'common',    desc: 'Напишите первое сообщение в чат.', check: (s) => (s.chatMessages || 0) >= 1 },

  // --- ОПЫТ (rare) ---
  { id: 'pred_25',     icon: '📚', name: 'Аналитик',             rarity: 'rare',      desc: '25 прогнозов — уже серьёзный подход.', check: (s) => (s.history || []).length >= 25 },
  { id: 'pred_50',     icon: '🎓', name: 'Специалист',           rarity: 'rare',      desc: '50 прогнозов. Вы в топе активных.', check: (s) => (s.history || []).length >= 50 },
  { id: 'win_10',      icon: '🔥', name: 'На волне',             rarity: 'rare',      desc: '10 попаданий подряд. Это уже не везение.', check: (s) => (s.bestStreak || 0) >= 10 },
  { id: 'acc_60',      icon: '📊', name: 'Хороший глаз',         rarity: 'rare',      desc: '60% точности при 20+ прогнозах.', check: (s) => (s.history || []).length >= 20 && (s.history.filter(h => h.correct).length / s.history.length) >= 0.6 },
  { id: 'acc_70',      icon: '🎯', name: 'Снайпер точности',     rarity: 'rare',      desc: '70% точности при 20+ прогнозах. Впечатляет.', check: (s) => (s.history || []).length >= 20 && (s.history.filter(h => h.correct).length / s.history.length) >= 0.7 },
  { id: 'elo_1500',    icon: '🥇', name: 'Золото',               rarity: 'rare',      desc: '1500 ELO — вы в Gold-лиге.', check: (s) => (s.elo || ELO_START) >= 1500 },
  { id: 'elo_1700',    icon: '🥇', name: 'Уверенное золото',     rarity: 'rare',      desc: '1700 ELO — топ Gold-игроков.', check: (s) => (s.elo || ELO_START) >= 1700 },
  { id: 'top_10',      icon: '🏅', name: 'Топ-10',               rarity: 'rare',      desc: 'Войдите в топ-10 любой лиги.', check: (s) => s.hadTop10 },
  { id: 'prize_win',   icon: '💰', name: 'Первый приз',          rarity: 'rare',      desc: 'Получите первый приз в лиге. Начало большого пути.', check: (s) => (s.prizesCount || 0) >= 1 },
  { id: 'kills_streak_3', icon: '🔫', name: 'Мастер kills',      rarity: 'rare',      desc: '3 прогноза на kills подряд оказались верными.', check: (s) => (s.killsStreak || 0) >= 3 },
  { id: 'underdog',    icon: '⚡', name: 'Риск-игрок',           rarity: 'rare',      desc: 'Угадайте андердога (команду, на которую мало кто ставил).', check: (s) => (s.underdogWins || 0) >= 1 },
  { id: 'comeback',    icon: '🚀', name: 'Камбэк',               rarity: 'rare',      desc: 'Упали ниже 1000 ELO — и вернулись к 1200. Уважение.', check: (s) => (s.lowEloReached && (s.elo || ELO_START) >= 1200) },
  { id: 'daily_5',     icon: '📅', name: 'Постоянство',          rarity: 'rare',      desc: 'Заходите 5 дней подряд. Не бросаете на полпути.', check: (s) => (s.dailyStreak || 0) >= 5 },
  { id: 'pred_all_markets', icon: '📊', name: 'Универсал',       rarity: 'rare',      desc: 'Угадали прогнозы по всем типам рынков.', check: (s) => ['winner','total_kills'].every(m => (s.history || []).some(h => h.market === m && h.correct)) && (s.history || []).some(h => h.market.endsWith('_kills') && h.correct) },
  { id: 'acc_75_50pred', icon: '🎖️', name: 'Эксперт',           rarity: 'rare',      desc: '75% точности при 50+ прогнозах. Огонь!', check: (s) => (s.history || []).length >= 50 && (s.history.filter(h => h.correct).length / s.history.length) >= 0.75 },
  { id: 'first_case',  icon: '📦', name: 'Первый кейс',          rarity: 'rare',      desc: 'Откройте первый кейс из магазина.', check: (s) => (s.casesOpened || 0) >= 1 },
  { id: 'spins_30',    icon: '🎡', name: 'Крутила',              rarity: 'rare',      desc: '30 спинов на Колесе Фортуны. Настойчивость!', check: (s) => (s.totalSpins || 0) >= 30 },
  { id: 'referral_5',  icon: '👥', name: 'Лидер мнений',         rarity: 'rare',      desc: 'Пригласите 5 друзей. Вы — двигатель проекта.', check: (s) => (s.referrals || []).length >= 5 },
  { id: 'chat_100',    icon: '💬', name: 'Душа компании',        rarity: 'rare',      desc: '100 сообщений в чате. Без вас было бы тихо.', check: (s) => (s.chatMessages || 0) >= 100 },

  // --- МАСТЕРСТВО (epic) ---
  { id: 'pred_100',    icon: '💯', name: 'Сотня',                rarity: 'epic',      desc: '100 прогнозов. С вами уже считаются.', check: (s) => (s.history || []).length >= 100 },
  { id: 'pred_200',    icon: '🌟', name: 'Легенда прогнозов',    rarity: 'epic',      desc: '200 прогнозов. Ваш опыт бесценен.', check: (s) => (s.history || []).length >= 200 },
  { id: 'win_15',      icon: '🔥', name: 'Непобедимый',          rarity: 'epic',      desc: '15 попаданий подряд. Читер? Нет — мастер.', check: (s) => (s.bestStreak || 0) >= 15 },
  { id: 'win_20',      icon: '👑', name: 'По ощущениям — читер', rarity: 'epic',      desc: '20 попаданий подряд. С такой серией уже страшно.', check: (s) => (s.bestStreak || 0) >= 20 },
  { id: 'acc_80_100pred', icon: '🎯', name: 'Аналитик-машина',   rarity: 'epic',      desc: '80% точности при 100+ прогнозах. Промолчу от уважения.', check: (s) => (s.history || []).length >= 100 && (s.history.filter(h => h.correct).length / s.history.length) >= 0.8 },
  { id: 'elo_1900',    icon: '💎', name: 'Платина',              rarity: 'epic',      desc: '1900 ELO — вы в элите.', check: (s) => (s.elo || ELO_START) >= 1900 },
  { id: 'elo_2100',    icon: '💎', name: 'Бриллиант',            rarity: 'epic',      desc: '2100 ELO. Осталось только Legend.', check: (s) => (s.elo || ELO_START) >= 2100 },
  { id: 'top_1',       icon: '👑', name: 'Первое место',         rarity: 'epic',      desc: 'Займите 1-е место в любой лиге. Вы — номер один.', check: (s) => s.hadTop1 },
  { id: 'prizes_5',    icon: '💰', name: 'Профессионал',         rarity: 'epic',      desc: '5 призовых мест. Превращаете анализ в заработок.', check: (s) => (s.prizesCount || 0) >= 5 },
  { id: 'referral_full', icon: '🌟', name: 'Наставник',          rarity: 'epic',      desc: 'Провели друга через всю воронку — от регистрации до 3-го вывода.', check: (s) => (s.referralStages?.full || 0) >= 1 },

  // --- ЛЕГЕНДА (legendary) ---
  { id: 'legend_2300', icon: '⚡', name: 'ЛЕГЕНДА',              rarity: 'legendary', desc: '2300 ELO. Вы — живая легенда проекта. Восхищаемся.', check: (s) => (s.elo || ELO_START) >= 2300 },
];
// ============================================================
//  МАТЧИ (по умолчанию — если в localStorage пусто)
// ============================================================
const DEFAULT_MATCHES = [
  { id: 'm1', teamA: 'Falcons', teamB: 'Vitality', date: '2026-09-23 18:00', status: 'upcoming', scoreA: null, scoreB: null, bestOf: 3,
    markets: { matchWinner: true, playerKills: [{ player: 'm0NESY', line: 50 }, { player: 'ZywOo', line: 50 }], totalKills: { line: 200 } },
    twitch: 'https://twitch.tv/esl_csgo', kick: '' },
  { id: 'm2', teamA: 'Spirit', teamB: 'NAVI', date: '2026-09-23 20:00', status: 'upcoming', scoreA: null, scoreB: null, bestOf: 3,
    markets: { matchWinner: true, playerKills: [{ player: 'donk', line: 55 }, { player: 'sh1ro', line: 50 }], totalKills: { line: 210 } },
    twitch: '', kick: 'https://kick.com/esl' },
];

// ============================================================
//  КОСМЕТИКА — с живыми описаниями
// ============================================================
const COSMETICS = [
  { id: 'nick',           name: 'Смена ника',           icon: '✏️', points: 80,  category: 'nick',        desc: 'Поменяйте никнейм на любой. Старый ник освобождается.' },
  { id: 'vip',            name: 'VIP-значок',           icon: '⭐', points: 200, category: 'vip',         desc: 'Золотая звёздочка ⭐ рядом с ником в чате и профиле. Все видят, что вы не новичок.' },
  { id: 'crown',          name: 'Корона',               icon: '👑', points: 300, category: 'crown',       desc: 'Корона 👑 в чате. Мини-статус: показать, что вы тут главный.' },
  { id: 'animnick',       name: 'Анимированный ник',    icon: '🌟', points: 400, category: 'nick_effect', desc: 'Ник переливается всеми цветами радуги. Заметно сразу.' },
  { id: 'fire_effect',    name: 'Огненный ник',         icon: '🔥', points: 450, category: 'nick_effect', desc: 'Ник горит оранжевым огнём. Для горячих игроков на серии.' },
  { id: 'electric',       name: 'Электрический ник',    icon: '⚡', points: 500, category: 'nick_effect', desc: 'Ник искрится голубыми молниями. Технологично и стильно.' },
  { id: 'crystal_effect', name: 'Кристальный ник',      icon: '🔷', points: 550, category: 'nick_effect', desc: 'Ник переливается кристальным светом. Холодно и красиво.' },
  { id: 'rainbow_effect', name: 'Радужный ник',         icon: '🌈', points: 700, category: 'nick_effect', desc: 'Полная радуга на нике. Максимум пафоса и веселья.' },
  { id: 'badge_hunter',   name: 'Значок Охотника',      icon: '🎯', points: 350, category: 'badge',       desc: 'Особый значок 🎯 в чате. Для тех, кто любит точные прогнозы.' },
  { id: 'badge_king',     name: 'Значок Короля',        icon: '♛', points: 800, category: 'badge',       desc: 'Редкий королевский значок ♛. Выделяет вас среди VIP-ов.' },
];

// ============================================================
//  СКИНЫ CS2 — выпадают из кейсов, копятся в инвентаре
// ============================================================
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
//  КОЛЕСО ФОРТУНЫ — призы с понятными описаниями
// ============================================================
const WHEEL_PRIZES = [
  { id: 'nothing', icon: '💨', name: 'Пусто',           chance: 35,   color: '#4a5568', text: 'Пусто' },
  { id: 'p2',      icon: '🟡', name: '+2 очка',         chance: 15,   color: '#88ddff', text: '+2' },
  { id: 'p4',      icon: '🟡', name: '+4 очка',         chance: 12,   color: '#00d4ff', text: '+4' },
  { id: 'p6',      icon: '🟡', name: '+6 очков',        chance: 10,   color: '#0099cc', text: '+6' },
  { id: 'p8',      icon: '🟡', name: '+8 очков',        chance: 8,    color: '#10b981', text: '+8' },
  { id: 'p10',     icon: '🟡', name: '+10 очков',       chance: 7,    color: '#7c3aed', text: '+10' },
  { id: 'boost10', icon: '🎯', name: 'Бустер +10%',     chance: 6,    color: '#a78bfa', text: '+10%' },
  { id: 'boost20', icon: '🎯', name: 'Бустер +20%',     chance: 3,    color: '#8b5cf6', text: '+20%' },
  { id: 'boost30', icon: '🎯', name: 'Бустер +30%',     chance: 1.5,  color: '#7c3aed', text: '+30%' },
  { id: 'insur',   icon: '🛡️', name: 'Страховка',       chance: 1,    color: '#ec4899', text: '🛡️' },
  { id: 'case1',   icon: '📦', name: 'Малый кейс',      chance: 0.8,  color: '#f59e0b', text: '📦' },
  { id: 'case2',   icon: '🎁', name: 'Средний кейс',    chance: 0.5,  color: '#ff6b00', text: '🎁' },
  { id: 'case3',   icon: '👑', name: 'Большой кейс',    chance: 0.2,  color: '#ffd700', text: '👑' },
];

// ============================================================
//  FAQ — с нормальными, живыми ответами
// ============================================================
const FAQ_ITEMS = [
  {
    q: '🎮 Что такое Fantasy CS2?',
    a: 'Это площадка, где вы <strong>угадываете исходы матчей CS2</strong> и зарабатываете на аналитике. Никаких букмекеров: только прогнозы на победителя, на kills игроков и на тотал. Угадали — получили очки, ELO и реальные призовые.'
  },
  {
    q: '🎯 Как делать прогнозы?',
    a: 'Откройте раздел «<strong>Матчи</strong>» — увидите предстоящие игры. У каждого матча несколько рынков:<br>• 🏆 <strong>Победитель</strong> — кто выиграет<br>• 🔫 <strong>Kills игрока</strong> — больше/меньше указанной линии<br>• 📊 <strong>Тотал</strong> — общее число убийств<br>Прогнозы принимаются до начала матча (последняя минута — закрыто).'
  },
  {
    q: '🟡 Что такое фэнтези-очки?',
    a: 'Это внутренняя валюта проекта. За каждое действие (прогноз, победа, чат, спин) вы получаете очки. Тратить их можно в <strong>Магазине</strong>: на бустеры, страховки, кейсы и косметику для профиля.'
  },
  {
    q: '🏅 Что такое ELO и зачем он нужен?',
    a: 'ELO — это <strong>постоянный рейтинг мастерства</strong>. Он не сбрасывается. Угадали — ELO растёт, ошиблись — падает. Чем выше ELO, тем выше ранг: Bronze → Silver → Gold → Platinum → Diamond → Legend. <br>За каждый новый ранг — <strong>жирная награда</strong>: очки и кейсы.'
  },
  {
    q: '🏆 Как работают лиги?',
    a: 'Три параллельные лиги: <br>📅 <strong>Ежедневная</strong> — призы 100/50/35 ₽<br>📆 <strong>Недельная</strong> — 500/250/100 ₽<br>🗓️ <strong>Месячная</strong> — 1500/1000/500 ₽<br>Очки из всех прогнозов идут во все три лиги одновременно. Чем выше место — тем больше приз.'
  },
  {
    q: '📺 Где смотреть матчи?',
    a: 'В разделе «<strong>Live</strong>» — встроенный плеер Twitch или Kick. Просто выберите матч, который идёт прямо сейчас, и смотрите не выходя из проекта.'
  },
  {
    q: '🎁 Что такое кейсы и что из них падает?',
    a: 'Кейсы — это сундуки с призами. Открываете — получаете случайный приз:<br>🟡 Очки<br>🎯 Бустеры (+10/+20/+30%)<br>🛡️ Страховки<br>🔫 Скины CS2 (редко)<br>📦 Другие кейсы (апгрейд)<br>Чем дороже кейс — тем жирнее призы.'
  },
  {
    q: '🎡 Как работает Колесо Фортуны?',
    a: 'Каждый день вам доступен <strong>один бесплатный спин</strong>. Крутите — получайте очки, бустеры, страховки и кейсы. Шансы честные: чем ценнее приз, тем он реже. Спин обновляется раз в сутки по МСК.'
  },
  {
    q: '🛡️ Что такое бустер и страховка?',
    a: '<strong>Бустер (🎯)</strong> — увеличивает награду за следующий удачный прогноз. Например, бустер +30% превратит 100 очков в 130. Если прогноз не зайдёт — бустер сгорит.<br><br><strong>Страховка (🛡️)</strong> — защищает от штрафа -150 за ошибку. Прогноз не угадали — минуса не будет. Премиум-страховка дополнительно сохраняет вашу серию побед.'
  },
  {
    q: '🤝 Как пригласить друга и что за это?',
    a: 'В профиле → «<strong>Друзья</strong>» найдите свой реферальный код. Друг вводит его при регистрации — вы получаете награду за каждый этап:<br>🟢 Регистрация → <strong>+50 очков</strong><br>🔵 5 прогнозов → <strong>+250 очков</strong><br>🟣 Первый вывод → <strong>+400 очков</strong><br>💎 Второй вывод → <strong>Средний кейс</strong><br>👑 Третий вывод → <strong>Большой кейс</strong><br>Итого с одного друга — до <strong>700 очков + 2 кейса</strong>.'
  },
  {
    q: '💰 Как выводятся деньги?',
    a: 'Три уровня вывода — защита от ботов и мультиакков:<br>🥇 <strong>1-й вывод</strong> — от 10 ₽<br>🥈 <strong>2-й вывод</strong> — от 200 ₽<br>🥉 <strong>3-й и далее</strong> — от 500 ₽<br><br>Способы: СБП, банковская карта, ЮMoney. Комиссия — 0 ₽. Стандартный срок — 12 часов. Если админ задержит дольше — начисляется <strong>+5 ₽/час</strong> бонуса (до 100 ₽).'
  },
  {
    q: '🛡️ Это безопасно?',
    a: 'Да. Мы используем:<br>• Telegram-верификацию (1 аккаунт = 1 Telegram)<br>• Fingerprint устройства (защита от мультиаккаунтов)<br>• Капчу при регистрации<br>• Лимиты на вывод (от 10 ₽ только первый раз)<br>Все операции проходят через защищённый сервер — подделать баланс через браузер нельзя.'
  },
  {
    q: '🚫 Что запрещено?',
    a: 'Строго запрещено:<br>• Мультиаккаунты с одного устройства<br>• Использование ботов и скриптов<br>• Попытки взлома и накрутки<br>• Оскорбления в чате<br><br>За нарушение — бан без права восстановления и обнуление баланса.'
  },
  {
    q: '📞 Куда писать, если что-то не работает?',
    a: 'Поддержка: <strong>@FantasyCS2Support</strong> в Telegram. Отвечаем в течение 24 часов. Если проблема с выводом — приложите номер заявки и скриншот, разберёмся быстрее.'
  }
];

// ============================================================
//  ГЛОБАЛЬНОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ
//  (переменные, которые используются во всех модулях)
// ============================================================

// Текущий игрок и его данные
let currentUser = null;
let state = {};

// Данные приложения
let matches = [];
let chatMessages = [];
let reviews = [];
let leagueSettings = {};

// UI-состояние (какая вкладка открыта)
let profileTab = 'main';
let currentLeagueTab = 'daily';
let currentLiveStream = {};
let adminTab = 'withdrawals';
let reviewsTab = 'payouts';

// Авторизация
let captchaAnswer = 0;
let pendingRegister = null;