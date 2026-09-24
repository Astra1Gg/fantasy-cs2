// ============================================================
//  MAIN — точка входа и роутер страниц — v12.2
// ============================================================

// ============================================================
//  РОУТЕР — переключение страниц
// ============================================================
function renderPage(page) {
  // Страховка: если leagueSettings пустой — грузим с диска
  if (!leagueSettings || !leagueSettings.daily || !leagueSettings.weekly || !leagueSettings.monthly) {
    leagueSettings = loadLeagueSettings();
  }

  const content = document.getElementById('content');
  if (!content) return;

  switch (page) {
    case 'matches':  content.innerHTML = renderMatchesPage(); break;
    case 'live':     content.innerHTML = renderLivePage(); break;
    case 'league':   content.innerHTML = renderLeaguePage(); break;
    case 'elo':      content.innerHTML = renderEloPage(); break;
    case 'wheel':    content.innerHTML = renderWheelPage(); break;
    case 'shop':     content.innerHTML = renderShopPage(); break;
    case 'profile':  content.innerHTML = renderProfilePage(); break;
    case 'faq':      content.innerHTML = renderFaqPage(); break;
    case 'reviews':  content.innerHTML = renderReviewsPage(); break;
    case 'admin':    content.innerHTML = renderAdminPage(); break;
    default:         content.innerHTML = renderMatchesPage();
  }

  saveState();

  // Напоминание о колесе (везде, кроме самого колеса)
  if (page !== 'wheel') {
    maybeShowWheelReminder();
  } else {
    const el = document.getElementById('wheel-reminder');
    if (el) el.remove();
  }

  // Обновление чата на страницах, где он есть
  if (page === 'matches' || page === 'live') {
    setTimeout(() => updateAllChats(), 50);
  }
}

// ============================================================
//  БЫСТРЫЕ ПЕРЕХОДЫ
// ============================================================
function goHome() {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.nav-btn[data-page="matches"]');
  if (btn) btn.classList.add('active');
  renderPage('matches');
}

function goToElo() {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.nav-btn[data-page="elo"]');
  if (btn) btn.classList.add('active');
  renderPage('elo');
}

// ============================================================
//  ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
// ============================================================
function closeModal() {
  const el = document.getElementById('modal-bg');
  if (el) el.classList.remove('show');
}

// Закрытие по клику на фон
document.addEventListener('DOMContentLoaded', () => {
  const bg = document.getElementById('modal-bg');
  if (bg) {
    bg.addEventListener('click', e => {
      if (e.target.id === 'modal-bg') closeModal();
    });
  }

  // Закрытие по ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

// ============================================================
//  НАВИГАЦИЯ — обработчик кнопок в шапке
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPage(btn.dataset.page);
    });
  });
});

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================================
window.addEventListener('load', () => {
  // Восстанавливаем последний логин
  const last = localStorage.getItem('fs2_last_user');
  if (last) {
    const el = document.getElementById('login-user');
    if (el) el.value = last;
  }

  // Стартовая капча
  generateCaptcha();

  // Обработка реферальной ссылки ?ref=XXXXXX
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref');
  if (ref) {
    setTimeout(() => {
      const el = document.getElementById('reg-ref');
      if (el) el.value = ref;
      const regTab = document.querySelector('.auth-tab[data-tab="register"]');
      if (regTab) regTab.click();
    }, 100);
  }

  // Авто-обновление шапки раз в 30 сек (на случай смены баланса из другой вкладки)
  setInterval(() => {
    if (currentUser) updateHeader();
  }, 30000);
});

// ============================================================
//  ЗАЩИТА ОТ ДВОЙНОГО КЛИКА (общая утилита)
// ============================================================
(function() {
  let lastClickTime = 0;
  let lastClickTarget = null;

  document.addEventListener('click', e => {
    const t = e.target.closest('button, .pred-btn, .shop-card, .avatar-option');
    if (!t) return;

    const currentTime = Date.now();
    if (t === lastClickTarget && currentTime - lastClickTime < 300) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    lastClickTime = currentTime;
    lastClickTarget = t;
  }, true);
})();

// ============================================================
//  ПРИВЕТСТВИЕ В КОНСОЛИ
// ============================================================
console.log(
  '%c🏆 FANTASY CS2 %cv12.2',
  'background: linear-gradient(90deg, #00d4ff, #7c3aed); color: #fff; padding: 6px 12px; border-radius: 6px; font-weight: 900; font-size: 16px;',
  'color: #8b95a8; font-size: 12px; margin-left: 6px;'
);
console.log('%cПроект собран по модулям. Приятной игры!', 'color: #10b981; font-weight: 700;');