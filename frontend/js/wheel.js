// ============================================================
//  КОЛЕСО ФОРТУНЫ — v12.2
// ============================================================

// ============================================================
//  РЕНДЕР СТРАНИЦЫ КОЛЕСА
// ============================================================
function renderWheelPage() {
  const canSpin = state.lastWheelSpin !== todayStr();
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const anglePerSegment = 360 / WHEEL_PRIZES.length;

  let paths = '';
  WHEEL_PRIZES.forEach((p, i) => {
    const startAngle = i * anglePerSegment - 90;
    const endAngle = (i + 1) * anglePerSegment - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z" fill="${p.color}" stroke="#1a0a2e" stroke-width="2"/>`;

    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const textR = r * 0.7;
    const tx = cx + textR * Math.cos(midRad);
    const ty = cy + textR * Math.sin(midRad);
    paths += `<text x="${tx}" y="${ty}" fill="#fff" font-size="14" font-weight="900" text-anchor="middle" dominant-baseline="middle" transform="rotate(${midAngle + 90} ${tx} ${ty})">${p.text}</text>`;
  });

  const lastSpinText = canSpin
    ? '🎁 Спин доступен — жми кнопку!'
    : `⏳ Следующий спин — завтра`;

  return `<div class="panel">
    <div class="panel-title">
      <span>🎡 Колесо Фортуны</span>
      <span style="color:${canSpin ? '#10b981' : '#8b95a8'};">${canSpin ? '✅ Доступен' : '⏳ Использован'}</span>
    </div>

    <div style="text-align:center;">
      <div class="wheel-wrapper">
        <div class="wheel-pointer"></div>
        <svg class="wheel-svg" id="wheel-svg" viewBox="0 0 ${size} ${size}">
          <circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="#1a0a2e" stroke="#ffd700" stroke-width="4"/>
          ${paths}
        </svg>
        <button class="wheel-center-btn" id="wheel-center-btn" ${canSpin ? '' : 'disabled'} onclick="spinWheel()">🎁</button>
      </div>
      <div style="color:#8b95a8;font-size:13px;margin-top:12px;">${lastSpinText}</div>

      <div class="wheel-result-box hidden" id="wheel-result-box"></div>

      <div class="wheel-legend">
        ${WHEEL_PRIZES.map(p => `
          <div class="legend-item">
            <div class="legend-color" style="background:${p.color};"></div>
            <div class="legend-name">${p.icon} ${p.name}</div>
            <div class="legend-chance">${p.chance}%</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

// ============================================================
//  НАПОМИНАНИЕ О КОЛЕСЕ
// ============================================================
function maybeShowWheelReminder() {
  const old = document.getElementById('wheel-reminder');
  if (old) old.remove();

  if (state.lastWheelSpin === todayStr() || state.wheelReminderClosed) return;

  const el = document.createElement('div');
  el.className = 'wheel-reminder';
  el.id = 'wheel-reminder';
  el.innerHTML = `
    <button class="wheel-reminder-close" onclick="closeWheelReminder()">✕</button>
    <div class="wheel-reminder-title">🎡 Колесо ждёт!</div>
    <div class="wheel-reminder-text">Бесплатный спин доступен. Крутаните — получите призы.</div>
    <button class="wheel-reminder-btn" onclick="goToWheel()">КРУТИТЬ</button>
  `;
  document.body.appendChild(el);
}

function closeWheelReminder() {
  const el = document.getElementById('wheel-reminder');
  if (el) el.remove();
  state.wheelReminderClosed = true;
  saveState();
  toast('💡 Колесо в разделе «Колесо»', '#f59e0b');
}

function goToWheel() {
  const el = document.getElementById('wheel-reminder');
  if (el) el.remove();
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.nav-btn[data-page="wheel"]').classList.add('active');
  renderPage('wheel');
}
// ============================================================
//  СПИН КОЛЕСА
// ============================================================
let isSpinning = false;

function spinWheel() {
  if (isSpinning) return;
  if (state.lastWheelSpin === todayStr()) {
    toast('⏳ Вы уже крутили сегодня. Возвращайтесь завтра!', '#f59e0b');
    return;
  }

  isSpinning = true;
  const btn = document.getElementById('wheel-center-btn');
  if (btn) btn.disabled = true;

  // Выбираем приз
  const prize = pickWheelPrize();
  const idx = WHEEL_PRIZES.indexOf(prize);
  const segmentAngle = 360 / WHEEL_PRIZES.length;

  // Целевой угол: 6 полных оборотов + позиция так, чтобы приз оказался под указателем
  const targetRotation = 360 * 6 + (360 - idx * segmentAngle - segmentAngle / 2);

  const svg = document.getElementById('wheel-svg');
  if (!svg) return;

  // Сброс и запуск анимации
  svg.style.transition = 'none';
  svg.style.transform = 'rotate(0deg)';
  void svg.offsetWidth;
  svg.style.transition = 'transform 5.5s cubic-bezier(0.15, 0.7, 0.15, 1)';
  svg.style.transform = `rotate(${targetRotation}deg)`;

  setTimeout(() => {
    applyWheelPrize(prize);
    isSpinning = false;
  }, 5600);
}

// ============================================================
//  ВЫБОР ПРИЗА ПО ШАНСАМ
// ============================================================
function pickWheelPrize() {
  const total = WHEEL_PRIZES.reduce((s, p) => s + p.chance, 0);
  let r = Math.random() * total;
  for (const p of WHEEL_PRIZES) {
    r -= p.chance;
    if (r <= 0) return p;
  }
  return WHEEL_PRIZES[0];
}

// ============================================================
//  ПРИМЕНЕНИЕ ПРИЗА
// ============================================================
function applyWheelPrize(prize) {
  state.lastWheelSpin = todayStr();
  state.totalSpins = (state.totalSpins || 0) + 1;
  state.activityActions = (state.activityActions || 0) + 1;

  let resultText = '';
  let resultIcon = '';
  let resultClass = 'win';

  switch (prize.id) {
    case 'nothing':
      resultText = 'Пусто. Не повезло — попробуйте завтра!';
      resultIcon = '💨';
      resultClass = '';
      break;

    case 'p2':
    case 'p4':
    case 'p6':
    case 'p8':
    case 'p10': {
      const amount = parseInt(prize.id.slice(1));
      state.fantasyPoints = (state.fantasyPoints || 0) + amount;
      resultText = `+${amount} 🟡 на баланс!`;
      resultIcon = '🟡';
      break;
    }

    case 'boost10':
    case 'boost20':
    case 'boost30': {
      const val = parseInt(prize.id.replace('boost', ''));
      state.bonuses.boosters.push({ value: val, usedOn: null, activated: false });
      resultText = `Бустер +${val}% добавлен в инвентарь!`;
      resultIcon = '🎯';
      resultClass = 'rare';
      break;
    }

    case 'insur':
      state.bonuses.insurance.push({ type: 'regular', usedOn: null, activated: false });
      resultText = 'Страховка добавлена в инвентарь!';
      resultIcon = '🛡️';
      resultClass = 'rare';
      break;

    case 'case1':
    case 'case2':
    case 'case3': {
      const t = prize.id === 'case1' ? 'small' : prize.id === 'case2' ? 'medium' : 'large';
      state.bonuses.pendingCases = state.bonuses.pendingCases || [];
      state.bonuses.pendingCases.push(t);
      resultText = `${t === 'small' ? 'Малый' : t === 'medium' ? 'Средний' : 'Большой'} кейс добавлен в инвентарь!`;
      resultIcon = '📦';
      resultClass = 'epic';
      break;
    }
  }

  // Показ результата на странице
  const box = document.getElementById('wheel-result-box');
  if (box) {
    box.className = 'wheel-result-box ' + resultClass;
    box.innerHTML = `<div style="font-size:48px;">${resultIcon}</div><div>${resultText}</div>`;
    box.classList.remove('hidden');
  }

  // Toast
  toast(resultIcon + ' ' + resultText, resultClass === 'epic' ? '#ffd700' : resultClass === 'rare' ? '#a78bfa' : '#10b981');

  updateHeader();
  checkAchievements();
  checkReferralProgress();
  saveState();

  // Обновляем страницу колеса через 1 секунду (чтобы кнопка заблокировалась)
  setTimeout(() => {
    const activePage = document.querySelector('.nav-btn.active')?.dataset.page;
    if (activePage === 'wheel') {
      const scrollY = window.scrollY;
      renderPage('wheel');
      setTimeout(() => window.scrollTo(0, scrollY), 10);
      // Показать результат снова
      const newBox = document.getElementById('wheel-result-box');
      if (newBox) {
        newBox.className = 'wheel-result-box ' + resultClass;
        newBox.innerHTML = `<div style="font-size:48px;">${resultIcon}</div><div>${resultText}</div>`;
        newBox.classList.remove('hidden');
      }
    }
  }, 1500);
}