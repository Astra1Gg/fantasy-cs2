// ============================================================
//  MAIN — точка входа и роутер страниц — v12.5 (Session 1 Stage 4)
// ============================================================

// ============================================================
//  РОУТЕР — переключение страниц
// ============================================================
function renderPage(page) {
  if (!leagueSettings || !leagueSettings.daily || !leagueSettings.weekly || !leagueSettings.monthly) {
    leagueSettings = loadLeagueSettings();
  }

  const content = document.getElementById('content');
  if (!content) return;

  try {
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
  } catch (err) {
    console.error('renderPage error on page=' + page + ':', err);
    content.innerHTML = '<div style="padding:40px;text-align:center;color:#ef4444;">⚠️ Ошибка загрузки страницы: ' + page + '<br><small style="color:#8b95a8;">Проверьте Console</small></div>';
  }

  saveState();

  if (page !== 'wheel') {
    try { maybeShowWheelReminder(); } catch(e) {}
  } else {
    const el = document.getElementById('wheel-reminder');
    if (el) el.remove();
  }

  if (page === 'matches' || page === 'live') {
    setTimeout(() => { try { updateAllChats(); } catch(e) {} }, 50);
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

document.addEventListener('DOMContentLoaded', () => {
  const bg = document.getElementById('modal-bg');
  if (bg) {
    bg.addEventListener('click', e => {
      if (e.target.id === 'modal-bg') closeModal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

// ============================================================
//  НАВИГАЦИЯ
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
window.addEventListener('load', async () => {
  const authScreen = document.getElementById('auth-screen');

  // Если есть токен — прячем auth до ответа tryAutoLogin (чтобы не мигало)
  if (getToken() && authScreen) {
    authScreen.style.visibility = 'hidden';
  }

  // 1. Авто-логин
  let autoLoginOk = false;
  try {
    autoLoginOk = await tryAutoLogin();
  } catch (err) {
    console.error('tryAutoLogin error:', err);
  }

  if (autoLoginOk) {
    if (authScreen) authScreen.style.visibility = '';
    return;
  }

  // 2. Показываем auth-screen
  if (authScreen) authScreen.style.visibility = '';

  const last = localStorage.getItem('fs2_last_user');
  if (last) {
    const el = document.getElementById('login-user');
    if (el) el.value = last;
  }

  generateCaptcha();

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

  setInterval(() => {
    if (currentUser) updateHeader();
  }, 30000);
});

// ============================================================
//  ЗАЩИТА ОТ ДВОЙНОГО КЛИКА
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
//  ПРИВЕТСТВИЕ
// ============================================================
console.log(
  '%c🏆 FANTASY CS2 %cv12.5',
  'background: linear-gradient(90deg, #00d4ff, #7c3aed); color: #fff; padding: 6px 12px; border-radius: 6px; font-weight: 900; font-size: 16px;',
  'color: #8b95a8; font-size: 12px; margin-left: 6px;'
);
console.log('%cПроект собран по модулям. Приятной игры!', 'color: #10b981; font-weight: 700;');