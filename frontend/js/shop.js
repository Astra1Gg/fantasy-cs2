// ============================================================
//  МАГАЗИН — v12.2
// ============================================================

// ============================================================
//  СТРАНИЦА МАГАЗИНА
// ============================================================
function renderShopPage() {
  const pts = state.fantasyPoints || 0;

  return `
    <!-- КЕЙСЫ -->
    <div class="panel">
      <div class="panel-title">
        <span>🎁 Кейсы</span>
        <span>🟡 ${fmt(pts)}</span>
      </div>
      <div class="shop-cards-grid">
        <div class="shop-card small" onclick="openCase('small')">
          <div class="shop-card-icon">📦</div>
          <div class="shop-card-title">Малый кейс</div>
          <div class="shop-card-desc">Очки, бустеры, редкий шанс на скин CS2</div>
          <div class="shop-card-price">50 🟡</div>
          <button class="btn-buy" ${pts < 50 ? 'disabled' : ''}>Открыть за 50 🟡</button>
        </div>
        <div class="shop-card medium" onclick="openCase('medium')">
          <div class="shop-card-icon">💎</div>
          <div class="shop-card-title">Средний кейс</div>
          <div class="shop-card-desc">Больше очков и бустеров, шанс на апгрейд кейса</div>
          <div class="shop-card-price">120 🟡</div>
          <button class="btn-buy" ${pts < 120 ? 'disabled' : ''}>Открыть за 120 🟡</button>
        </div>
        <div class="shop-card large" onclick="openCase('large')">
          <div class="shop-card-icon">👑</div>
          <div class="shop-card-title">Большой кейс</div>
          <div class="shop-card-desc">Максимум очков, x5 бустеры, скины CS2</div>
          <div class="shop-card-price">350 🟡</div>
          <button class="btn-buy" ${pts < 350 ? 'disabled' : ''}>Открыть за 350 🟡</button>
        </div>
      </div>
    </div>

    <!-- БУСТЕРЫ -->
    <div class="panel">
      <div class="panel-title">⚡ Бустеры</div>
      <div class="shop-cards-grid">
        ${BOOSTERS.map(b => `
          <div class="shop-card boost" onclick="${pts >= b.points ? `buyBooster('${b.id}')` : ''}">
            <div class="shop-card-icon">${b.icon}</div>
            <div class="shop-card-title">${b.name}</div>
            <div class="shop-card-desc">${b.desc}</div>
            <div class="shop-card-price">${b.points} 🟡</div>
            <button class="btn-buy" ${pts < b.points ? 'disabled' : ''}>${pts < b.points ? `Не хватает ${b.points - pts} 🟡` : 'Купить'}</button>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- СТРАХОВКИ -->
    <div class="panel">
      <div class="panel-title">🛡️ Страховки</div>
      <div class="shop-cards-grid">
        ${INSURANCE.map(ins => `
          <div class="shop-card insurance" onclick="${pts >= ins.points ? `buyInsurance('${ins.id}')` : ''}">
            <div class="shop-card-icon">${ins.icon}</div>
            <div class="shop-card-title">${ins.name}</div>
            <div class="shop-card-desc">${ins.desc}</div>
            <div class="shop-card-price">${ins.points} 🟡</div>
            <button class="btn-buy" ${pts < ins.points ? 'disabled' : ''}>${pts < ins.points ? `Не хватает ${ins.points - pts} 🟡` : 'Купить'}</button>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- КОСМЕТИКА -->
    <div class="panel">
      <div class="panel-title">🎨 Косметика для профиля</div>
      <div class="shop-cards-grid">
        ${COSMETICS.map(c => {
          const owned = (state.cosmetics || []).includes(c.id);
          return `
            <div class="shop-card cosmetic" onclick="${owned || pts < c.points ? '' : `buyCosmetic('${c.id}')`}">
              <div class="shop-card-icon">${c.icon}</div>
              <div class="shop-card-title">${c.name}</div>
              <div class="shop-card-desc">${c.desc}</div>
              <div class="shop-card-price">${c.points} 🟡</div>
              <button class="btn-buy ${owned ? 'owned' : ''}" ${owned || pts < c.points ? 'disabled' : ''}>
                ${owned ? '✓ Уже куплено' : pts < c.points ? `Не хватает ${c.points - pts} 🟡` : 'Купить'}
              </button>
            </div>`;
        }).join('')}
      </div>
    </div>

    <!-- РАМКИ -->
    <div class="panel">
      <div class="panel-title">🖼️ Рамки для аватара</div>
      <div class="shop-cards-grid">
        ${FRAMES.filter(f => !f.free).map(f => {
          const owned = (state.cosmetics || []).includes('frame_' + f.id);
          return `
            <div class="shop-card cosmetic" onclick="${owned || pts < f.cost ? '' : `buyFrame('${f.id}')`}">
              <div class="shop-card-icon">${f.icon}</div>
              <div class="shop-card-title">Рамка «${f.name}»</div>
              <div class="shop-card-desc">Стильная анимированная рамка вокруг аватара</div>
              <div class="shop-card-price">${f.cost} 🟡</div>
              <button class="btn-buy ${owned ? 'owned' : ''}" ${owned || pts < f.cost ? 'disabled' : ''}>
                ${owned ? '✓ Уже куплено' : pts < f.cost ? `Не хватает ${f.cost - pts} 🟡` : 'Купить'}
              </button>
            </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

// ============================================================
//  ПОКУПКА БУСТЕРА
// ============================================================
function buyBooster(id) {
  const b = BOOSTERS.find(x => x.id === id);
  if (!b) return;
  if ((state.fantasyPoints || 0) < b.points) {
    toast('❌ Недостаточно очков', '#ef4444');
    return;
  }
  state.fantasyPoints -= b.points;
  state.bonuses.boosters.push({ value: b.value, usedOn: null, activated: false });
  toast(`✅ ${b.name} куплен!`, '#10b981');
  updateHeader();
  renderPage('shop');
  saveState();
}

// ============================================================
//  ПОКУПКА СТРАХОВКИ
// ============================================================
function buyInsurance(id) {
  const ins = INSURANCE.find(x => x.id === id);
  if (!ins) return;
  if ((state.fantasyPoints || 0) < ins.points) {
    toast('❌ Недостаточно очков', '#ef4444');
    return;
  }
  state.fantasyPoints -= ins.points;
  state.bonuses.insurance.push({ type: ins.type, usedOn: null, activated: false });
  toast(`✅ ${ins.name} куплена!`, '#10b981');
  updateHeader();
  renderPage('shop');
  saveState();
}

// ============================================================
//  ПОКУПКА КОСМЕТИКИ
// ============================================================
function buyCosmetic(id) {
  const c = COSMETICS.find(x => x.id === id);
  if (!c) return;
  if (state.cosmetics?.includes(id)) {
    toast('✅ У вас уже есть эта косметика', '#10b981');
    return;
  }
  if ((state.fantasyPoints || 0) < c.points) {
    toast('❌ Недостаточно очков', '#ef4444');
    return;
  }
  state.fantasyPoints -= c.points;
  state.cosmetics = state.cosmetics || [];
  state.cosmetics.push(id);
  toast(`✅ ${c.name} куплено! Проверьте в профиле → Кастомизация`, '#10b981');
  updateHeader();
  renderPage('shop');
  saveState();
}

// ============================================================
//  ПОКУПКА РАМКИ
// ============================================================
function buyFrame(id) {
  const f = FRAMES.find(x => x.id === id);
  if (!f) return;
  if (state.cosmetics?.includes('frame_' + id)) {
    toast('✅ У вас уже есть эта рамка', '#10b981');
    return;
  }
  if ((state.fantasyPoints || 0) < f.cost) {
    toast('❌ Недостаточно очков', '#ef4444');
    return;
  }
  state.fantasyPoints -= f.cost;
  state.cosmetics = state.cosmetics || [];
  state.cosmetics.push('frame_' + id);
  toast(`✅ Рамка «${f.name}» куплена! Примените в профиле`, '#10b981');
  updateHeader();
  renderPage('shop');
  saveState();
}
// ============================================================
//  ОТКРЫТИЕ КЕЙСА — запуск рулетки
// ============================================================
function openCase(type) {
  const prices = { small: 50, medium: 120, large: 350 };
  const price = prices[type];
  if ((state.fantasyPoints || 0) < price) {
    toast('❌ Недостаточно очков', '#ef4444');
    return;
  }

  state.fantasyPoints -= price;
  state.casesOpened = (state.casesOpened || 0) + 1;
  state.activityActions = (state.activityActions || 0) + 1;

  // Выбираем приз заранее
  const prize = pickCasePrize(type);

  // Показываем рулетку → по завершении применяем приз
  showCaseRoulette(type, prize, () => {
    applyCasePrize(prize);
    updateHeader();
    renderPage('shop');
    checkAchievements();
    checkReferralProgress();
    saveState();
  });
}

// ============================================================
//  ПОСТРОЕНИЕ ЛЕНТЫ РУЛЕТКИ
// ============================================================
function buildRouletteItems(caseType, winPrize) {
  const items = [];
  const totalItems = 55;
  const winIdx = 42;

  for (let i = 0; i < totalItems; i++) {
    if (i === winIdx) {
      items.push(winPrize);
    } else {
      items.push(pickCasePrize(caseType));
    }
  }
  return { items, winIdx };
}

// ============================================================
//  ПОКАЗ РУЛЕТКИ (анимация прокрутки)
// ============================================================
function showCaseRoulette(caseType, winPrize, onComplete) {
  const overlay = document.getElementById('case-roulette-overlay');
  const track = document.getElementById('case-roulette-track');
  const title = document.getElementById('case-roulette-title');
  const status = document.getElementById('case-roulette-status');

  const caseNames = { small: 'МАЛЫЙ КЕЙС', medium: 'СРЕДНИЙ КЕЙС', large: 'БОЛЬШОЙ КЕЙС' };
  title.textContent = '🎁 ' + caseNames[caseType];
  status.textContent = '⏳ Прокрутка...';

  const { items, winIdx } = buildRouletteItems(caseType, winPrize);
  const rarityClass = { common: 'common', rare: 'rare', epic: 'epic', legendary: 'legendary' };

  // Заполняем ленту
  track.innerHTML = items.map(it => `
    <div class="case-roulette-item ${rarityClass[it.rarity] || 'common'}">
      <div class="case-roulette-item-icon">${it.icon}</div>
      <div class="case-roulette-item-name">${it.name}${it.amount ? ' ×' + it.amount : ''}</div>
    </div>
  `).join('');

  overlay.classList.add('show');

  // Вычисляем смещение
  const itemWidth = 148;
  const trackContainerWidth = document.querySelector('.case-roulette-window').offsetWidth;
  const centerOffset = trackContainerWidth / 2 - 70;
  const targetTranslate = -(winIdx * itemWidth) + centerOffset;

  // Сброс и запуск
  track.style.transition = 'none';
  track.style.transform = `translateX(0)`;
  void track.offsetWidth;

  const randomOffset = (Math.random() - 0.5) * 40;
  track.style.transition = 'transform 7s cubic-bezier(0.15, 0.7, 0.15, 1)';
  track.style.transform = `translateX(${targetTranslate + randomOffset}px)`;

  // Обратный отсчёт
  let timeLeft = 7;
  const statusInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) status.textContent = `⏳ ${timeLeft}...`;
    else status.textContent = '✨ Открываем...';
  }, 1000);

  // Показ результата
  setTimeout(() => {
    clearInterval(statusInterval);
    overlay.classList.remove('show');

    const reveal = document.getElementById('case-prize-reveal');
    const revealBox = document.getElementById('case-prize-reveal-box');
    const rarityLabels = { common: 'Обычное', rare: 'Редкое', epic: 'Эпическое', legendary: 'ЛЕГЕНДАРНОЕ' };
    const rarityColors = { common: '#88ddff', rare: '#a78bfa', epic: '#ffd700', legendary: '#ffd700' };

    revealBox.innerHTML = `
      <div class="case-prize-icon" style="color:${rarityColors[winPrize.rarity]};">${winPrize.icon}</div>
      <div class="case-prize-title" style="color:${rarityColors[winPrize.rarity]};">${winPrize.name}${winPrize.amount ? ' × ' + winPrize.amount : ''}</div>
      <div class="case-prize-rarity" style="background:${rarityColors[winPrize.rarity]};color:${winPrize.rarity === 'common' || winPrize.rarity === 'rare' ? '#0a0e1a' : '#1a0a2e'};">${rarityLabels[winPrize.rarity]}</div>
      <button class="btn btn-primary" style="width:100%;min-height:48px;" onclick="closeCaseReveal()">🎉 Забрать</button>
    `;
    reveal.classList.add('show');

    // Конфетти для epic/legendary
    if (winPrize.rarity === 'epic' || winPrize.rarity === 'legendary') {
      const count = winPrize.rarity === 'legendary' ? 120 : 60;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const c = document.createElement('div');
          const colors = ['#ffd700', '#ff0080', '#00ff88', '#00aaff'];
          const size = Math.random() * 10 + 5;
          c.style.cssText = `position:fixed;top:-20px;left:${Math.random()*100}vw;width:${size}px;height:${size}px;background:${colors[i%4]};border-radius:${Math.random()>0.5?'50%':'0'};pointer-events:none;z-index:10001;animation:confettiFall ${2+Math.random()*2}s linear forwards`;
          document.body.appendChild(c);
          setTimeout(() => c.remove(), 5000);
        }, i * 20);
      }
    }

    window._caseOnComplete = onComplete;
  }, 7100);
}

// ============================================================
//  ЗАКРЫТИЕ ЭКРАНА ПРИЗА
// ============================================================
function closeCaseReveal() {
  document.getElementById('case-prize-reveal').classList.remove('show');
  if (window._caseOnComplete) {
    window._caseOnComplete();
    window._caseOnComplete = null;
  }
}

// Стиль для конфетти (один раз на страницу)
if (!document.getElementById('confetti-style')) {
  const s = document.createElement('style');
  s.id = 'confetti-style';
  s.textContent = '@keyframes confettiFall { to { transform: translateY(110vh) rotate(900deg); opacity: 0; } }';
  document.head.appendChild(s);
}