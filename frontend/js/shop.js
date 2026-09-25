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
  state.bonuses.boosters.push({ value: b.value, usedOn: null, activated: false });
  state.fantasyPoints -= b.points;
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
  state.bonuses.insurance.push({ type: ins.type, usedOn: null, activated: false });
  state.fantasyPoints -= ins.points;
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
//  ТАБЛИЦЫ ПРИЗОВ КЕЙСОВ (без "Пусто")
// ============================================================
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

// ============================================================
//  ВЫБОР ПРИЗА ПО ВЕСАМ
// ============================================================
function pickCasePrize(caseType) {
  const table = CASE_TABLES[caseType];
  if (!table) return { type: 'points', icon: '🟡', name: '+10 очков', rarity: 'common', amount: 10 };

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
//  ПРИМЕНЕНИЕ ПРИЗА
// ============================================================
function applyCasePrize(prize) {
  if (!prize) return;
  const count = prize.count || 1;

  switch (prize.type) {
    case 'points':
      state.fantasyPoints = (state.fantasyPoints || 0) + prize.amount;
      toast(`🟡 +${prize.amount} очков`, '#ffd700');
      break;

    case 'booster':
      state.bonuses = state.bonuses || {};
      state.bonuses.boosters = state.bonuses.boosters || [];
      for (let i = 0; i < count; i++) {
        state.bonuses.boosters.push({ value: prize.value, usedOn: null, activated: false });
      }
      toast(`🎯 Бустер +${prize.value}%${count > 1 ? ' ×' + count : ''} в инвентаре`, '#10b981');
      break;

    case 'insurance':
      state.bonuses = state.bonuses || {};
      state.bonuses.insurance = state.bonuses.insurance || [];
      for (let i = 0; i < count; i++) {
        state.bonuses.insurance.push({ type: prize.insType || 'regular', usedOn: null, activated: false });
      }
      toast(`🛡️ ${prize.insType === 'premium' ? 'Премиум-страховка' : 'Страховка'}${count > 1 ? ' ×' + count : ''} в инвентаре`, '#a78bfa');
      break;

    case 'case':
      state.bonuses = state.bonuses || {};
      state.bonuses.pendingCases = state.bonuses.pendingCases || [];
      for (let i = 0; i < count; i++) {
        state.bonuses.pendingCases.push(prize.caseType);
      }
      toast(`📦 ${prize.name} в инвентаре! Откройте в профиле.`, '#a78bfa');
      break;

    case 'skin':
      state.inventory = state.inventory || [];
      if (prize.skin) {
        state.inventory.push({ ...prize.skin, obtainedAt: now() });
        toast(`🔫 ВЫПАЛ СКИН: ${prize.skin.name}!`, '#ffd700');
      }
      break;
  }
}

// ============================================================
//  ОТКРЫТИЕ КЕЙСА — сначала превью со списком призов
// ============================================================
function openCase(type) {
  const prices = { small: 50, medium: 120, large: 350 };
  const price = prices[type];

  // Показываем превью модалку
  showCasePreview(type, price);
}

// ============================================================
//  ПРЕВЬЮ КЕЙСА — список возможных призов, без шансов
// ============================================================
function showCasePreview(type, price) {
  const caseNames = { small: '📦 Малый кейс', medium: '💎 Средний кейс', large: '👑 Большой кейс' };
  const table = CASE_TABLES[type] || [];
  const rarityLabels = { common: 'Обычное', rare: 'Редкое', epic: 'Эпическое', legendary: 'ЛЕГЕНДАРНОЕ' };
  const rarityColors = { common: '#88ddff', rare: '#a78bfa', epic: '#ffd700', legendary: '#ffd700' };

  // Собираем уникальные призы — схлопываем одинаковые по названию
  const uniquePrizes = {};
  table.forEach(row => {
    const p = row.prize;
    let name = p.name;
    let icon = p.icon;

    // Для скинов — показываем все возможные из пула
    if (p.type === 'skin') {
      const pool = CASE_SKINS[p.skinRarity] || [];
      pool.forEach(skin => {
        const key = skin.id;
        if (!uniquePrizes[key]) {
          uniquePrizes[key] = { name: skin.name, icon: skin.icon, rarity: p.rarity };
        }
      });
      return;
    }

    if (!uniquePrizes[name]) {
      uniquePrizes[name] = { name, icon, rarity: p.rarity };
    }
  });

  const prizesArray = Object.values(uniquePrizes);

  // Сортируем по редкости: legendary → epic → rare → common
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  prizesArray.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  const modal = document.getElementById('modal-bg');
  const modalBox = document.getElementById('modal');

  modalBox.innerHTML = `
    <h2 style="text-align:center;margin-bottom:6px;">${caseNames[type]}</h2>
    <div style="text-align:center;font-size:13px;color:#8b95a8;margin-bottom:18px;">
      Цена: <strong style="color:#ffd700;">${price} 🟡</strong>
    </div>

    <div style="font-size:12px;color:#8b95a8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">
      Возможные призы
    </div>

    <div style="display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow-y:auto;margin-bottom:18px;">
      ${prizesArray.map(p => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#0f1420;border-left:3px solid ${rarityColors[p.rarity]};border-radius:8px;">
          <div style="font-size:22px;flex-shrink:0;">${p.icon}</div>
          <div style="flex:1;font-size:13px;font-weight:600;">${p.name}</div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:${rarityColors[p.rarity]};font-weight:800;">${rarityLabels[p.rarity]}</div>
        </div>
      `).join('')}
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Отмена</button>
      <button class="btn btn-gold" style="flex:1;" onclick="confirmOpenCase('${type}', ${price})">
        Открыть за ${price} 🟡
      </button>
    </div>
  `;

  modal.classList.add('show');
}

// ============================================================
//  ПОДТВЕРЖДЕНИЕ ОТКРЫТИЯ — списываем очки, крутим рулетку
// ============================================================
function confirmOpenCase(type, price) {
  if ((state.fantasyPoints || 0) < price) {
    closeModal();
    toast('❌ Недостаточно очков', '#ef4444');
    return;
  }

  state.fantasyPoints -= price;
  state.casesOpened = (state.casesOpened || 0) + 1;
  state.activityActions = (state.activityActions || 0) + 1;

  const prize = pickCasePrize(type);

  closeModal();

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
//  ОТКРЫТИЕ ОТЛОЖЕННОГО КЕЙСА (из инвентаря профиля)
// ============================================================
function openPendingCase(idx) {
  if (!state.bonuses || !state.bonuses.pendingCases) return;
  const type = state.bonuses.pendingCases[idx];
  if (!type) return;

  state.bonuses.pendingCases.splice(idx, 1);
  saveState();

  const prize = pickCasePrize(type);
  state.casesOpened = (state.casesOpened || 0) + 1;
  state.activityActions = (state.activityActions || 0) + 1;

  showCaseRoulette(type, prize, () => {
    applyCasePrize(prize);
    updateHeader();
    renderPage('profile');
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

  track.innerHTML = items.map(it => `
    <div class="case-roulette-item ${rarityClass[it.rarity] || 'common'}">
      <div class="case-roulette-item-icon">${it.icon}</div>
      <div class="case-roulette-item-name">${it.name}</div>
    </div>
  `).join('');

  overlay.classList.add('show');

  const itemWidth = 148;
  const trackContainerWidth = document.querySelector('.case-roulette-window').offsetWidth;
  const centerOffset = trackContainerWidth / 2 - 70;
  const targetTranslate = -(winIdx * itemWidth) + centerOffset;

  track.style.transition = 'none';
  track.style.transform = `translateX(0)`;
  void track.offsetWidth;

  const randomOffset = (Math.random() - 0.5) * 40;
  track.style.transition = 'transform 7s cubic-bezier(0.15, 0.7, 0.15, 1)';
  track.style.transform = `translateX(${targetTranslate + randomOffset}px)`;

  let timeLeft = 7;
  const statusInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) status.textContent = `⏳ ${timeLeft}...`;
    else status.textContent = '✨ Открываем...';
  }, 1000);

  setTimeout(() => {
    clearInterval(statusInterval);
    overlay.classList.remove('show');

    const reveal = document.getElementById('case-prize-reveal');
    const revealBox = document.getElementById('case-prize-reveal-box');
    const rarityLabels = { common: 'Обычное', rare: 'Редкое', epic: 'Эпическое', legendary: 'ЛЕГЕНДАРНОЕ' };
    const rarityColors = { common: '#88ddff', rare: '#a78bfa', epic: '#ffd700', legendary: '#ffd700' };

    revealBox.innerHTML = `
      <div class="case-prize-icon" style="color:${rarityColors[winPrize.rarity]};">${winPrize.icon}</div>
      <div class="case-prize-title" style="color:${rarityColors[winPrize.rarity]};">${winPrize.name}</div>
      <div class="case-prize-rarity" style="background:${rarityColors[winPrize.rarity]};color:${winPrize.rarity === 'common' || winPrize.rarity === 'rare' ? '#0a0e1a' : '#1a0a2e'};">${rarityLabels[winPrize.rarity]}</div>
      <button class="btn btn-primary" style="width:100%;min-height:48px;" onclick="closeCaseReveal()">🎉 Забрать</button>
    `;
    reveal.classList.add('show');

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