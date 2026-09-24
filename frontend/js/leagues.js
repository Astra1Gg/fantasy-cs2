// ============================================================
//  ЛИГИ — v12.2
// ============================================================

// ============================================================
//  СТРАНИЦА ЛИГ
// ============================================================
function renderLeaguePage() {
  // Страховка: если leagueSettings пустой — грузим с диска
  if (!leagueSettings || !leagueSettings.daily || !leagueSettings.weekly || !leagueSettings.monthly) {
    leagueSettings = loadLeagueSettings();
  }

  const dailyEnd = getLeagueEndTime('daily');
  const weeklyEnd = getLeagueEndTime('weekly');
  const monthlyEnd = getLeagueEndTime('monthly');
  const nowMs = now();

  // Вкладки лиг
  let tabsHtml = `<div class="league-tabs">
    <div class="league-tab ${currentLeagueTab === 'daily' ? 'active' : ''}" onclick="switchLeagueTab('daily')">
      📅 Ежедневная
      <span class="timer" id="timer-daily">${isLeagueActive('daily') ? formatTimer(dailyEnd - nowMs) : 'Завершена'}</span>
    </div>
    <div class="league-tab ${currentLeagueTab === 'weekly' ? 'active' : ''}" onclick="switchLeagueTab('weekly')">
      📆 Недельная
      <span class="timer" id="timer-weekly">${isLeagueActive('weekly') ? formatTimer(weeklyEnd - nowMs) : 'Завершена'}</span>
    </div>
    <div class="league-tab ${currentLeagueTab === 'monthly' ? 'active' : ''}" onclick="switchLeagueTab('monthly')">
      🗓️ Месячная
      <span class="timer" id="timer-monthly">${isLeagueActive('monthly') ? formatTimer(monthlyEnd - nowMs) : 'Завершена'}</span>
    </div>
  </div>`;

  // Спец-лиги (если есть)
  const specials = leagueSettings.special || [];
  if (specials.length > 0) {
    tabsHtml += `<div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;">`;
    specials.forEach(sl => {
      const active = sl.endTime > nowMs;
      tabsHtml += `<button class="league-tab ${currentLeagueTab === 'special_' + sl.id ? 'active' : ''}" style="flex:0 0 auto;min-width:auto;padding:10px 16px;background:${currentLeagueTab === 'special_' + sl.id ? 'linear-gradient(135deg, #ff0080, #ff6600)' : 'rgba(255, 0, 128, 0.1)'};border:1px solid #ff0080;opacity:${active ? 1 : 0.5};" onclick="switchLeagueTab('special_${sl.id}')">🏆 ${sl.name}</button>`;
    });
    tabsHtml += `</div>`;
  }

  return `<div class="panel">
    <div class="panel-title"><span>🏆 Лиги и призовые</span></div>
    ${tabsHtml}
    <div id="league-content">${renderLeagueContent()}</div>
  </div>`;
}

// ============================================================
//  ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ВКЛАДКАМИ
// ============================================================
function switchLeagueTab(tab) {
  currentLeagueTab = tab;
  renderPage('league');
}

// ============================================================
//  КОНТЕНТ ЛИГИ (инфо + призы + таблица)
// ============================================================
function renderLeagueContent() {
  // Страховка
  if (!leagueSettings || !leagueSettings.daily) {
    leagueSettings = loadLeagueSettings();
  }

  let type = currentLeagueTab;
  let isSpecial = false;
  let specialInfo = null;

  if (currentLeagueTab.startsWith('special_')) {
    isSpecial = true;
    const sid = currentLeagueTab.replace('special_', '');
    specialInfo = (leagueSettings.special || []).find(s => s.id === sid);
    if (!specialInfo) return `<div class="empty"><div class="empty-icon">🏆</div><div class="empty-title">Лига не найдена</div></div>`;
  }

  let leagueInfo, endTime, active;
  if (isSpecial) {
    leagueInfo = { name: specialInfo.name, prizes: specialInfo.prizes };
    endTime = specialInfo.endTime;
    active = endTime > now();
  } else {
    const s = leagueSettings[type];
    if (!s) return `<div class="empty"><div class="empty-icon">🏆</div><div class="empty-title">Лига не настроена</div></div>`;
    leagueInfo = {
      name: { daily: 'Ежедневная', weekly: 'Недельная', monthly: 'Месячная' }[type],
      prizes: s.prizes
    };
    endTime = getLeagueEndTime(type);
    active = isLeagueActive(type);
  }

  // Собираем таблицу игроков
  const users = loadUsers();
  const managers = [];
  for (const [name, u] of Object.entries(users)) {
    if (name === ADMIN_USER) continue;
    const points = isSpecial
      ? (u.specialLeagues?.[specialInfo.id]?.points || 0)
      : (u.leagues?.[type]?.points || 0);
    managers.push({
      name,
      points,
      elo: u.elo || ELO_START,
      correct: (u.history || []).filter(h => h.correct).length,
      total: (u.history || []).length,
      me: name === currentUser
    });
  }
  managers.sort((a, b) => b.points - a.points);

  // Наша позиция
  let myPosition = '—';
  let myPoints = 0;
  for (let i = 0; i < managers.length; i++) {
    if (managers[i].me) { myPosition = i + 1; myPoints = managers[i].points; break; }
  }

  const timeLeft = endTime - now();

  let html = `<div class="league-info-card">
    <div class="league-info-block">
      <div class="league-info-label">Ваше место</div>
      <div class="league-info-value ${myPosition === 1 ? 'gold' : 'cyan'}">${myPosition === '—' ? '—' : '#' + myPosition}</div>
    </div>
    <div class="league-info-block">
      <div class="league-info-label">Ваши баллы</div>
      <div class="league-info-value purple">${fmtSigned(myPoints)}</div>
    </div>
    <div class="league-info-block">
      <div class="league-info-label">${active ? 'До конца' : 'Статус'}</div>
      <div class="league-timer" id="league-timer-main" style="${active ? '' : 'color:#8b95a8;font-size:18px;'}">${active ? formatTimer(timeLeft) : 'Ожидает запуска'}</div>
    </div>
    <div class="league-info-block">
      <div class="league-info-label">Участников</div>
      <div class="league-info-value">${managers.length}</div>
    </div>
  </div>`;

  // Призы
  html += `<div class="prizes-row">
    <div class="prize-card gold"><div class="prize-icon">🥇</div><div class="prize-place">1 место</div><div class="prize-amount">${fmt(leagueInfo.prizes[0])} ₽</div></div>
    <div class="prize-card silver"><div class="prize-icon">🥈</div><div class="prize-place">2 место</div><div class="prize-amount">${fmt(leagueInfo.prizes[1])} ₽</div></div>
    <div class="prize-card bronze"><div class="prize-icon">🥉</div><div class="prize-place">3 место</div><div class="prize-amount">${fmt(leagueInfo.prizes[2])} ₽</div></div>
  </div>`;

  // Таблица
  if (managers.length === 0) {
    html += `<div class="empty"><div class="empty-icon">🏆</div><div class="empty-title">Пока никого нет в лиге</div><div style="font-size:13px;color:#8b95a8;margin-top:8px;">Сделайте первый прогноз — и попадёте в таблицу</div></div>`;
  } else {
    html += `<table class="table">
      <thead><tr><th>Место</th><th>Игрок</th><th>Баллы</th><th>ELO</th></tr></thead>
      <tbody>`;
    managers.slice(0, 50).forEach((m, i) => {
      const rc = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
      const rowCls = (i === 0 ? 'rank-row-1' : i === 1 ? 'rank-row-2' : i === 2 ? 'rank-row-3' : '') + (m.me ? ' me' : '');
      const rk = getEloRank(m.elo);
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      html += `<tr class="${rowCls}">
        <td class="${rc}">${medal} ${i + 1}</td>
        <td>${m.name}${m.me ? ' <span style="color:#00d4ff;">(Вы)</span>' : ''}</td>
        <td><span class="points-badge ${m.points < 0 ? 'negative' : ''}">${fmtSigned(m.points)}</span></td>
        <td style="color:${rk.color};font-weight:700;">${rk.icon} ${m.elo}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
  }

  return html;
}
// ============================================================
//  ТАЙМЕР ЛИГ — обновление в реальном времени
// ============================================================
function startLeagueTimer() {
  if (window._leagueTimer) clearInterval(window._leagueTimer);

  window._leagueTimer = setInterval(() => {
    if (!currentUser) return;
    const nowMs = now();

    // Обновляем таймеры вкладок
    ['daily', 'weekly', 'monthly'].forEach(t => {
      const el = document.getElementById('timer-' + t);
      if (el) {
        el.textContent = isLeagueActive(t)
          ? formatTimer(getLeagueEndTime(t) - nowMs)
          : 'Завершена';
      }
    });

    // Обновляем главный таймер на странице лиги
    const mainEl = document.getElementById('league-timer-main');
    if (mainEl) {
      let endTime, active;
      if (currentLeagueTab.startsWith('special_')) {
        const sid = currentLeagueTab.replace('special_', '');
        const sl = (leagueSettings.special || []).find(s => s.id === sid);
        endTime = sl ? sl.endTime : nowMs;
        active = endTime > nowMs;
      } else {
        endTime = getLeagueEndTime(currentLeagueTab);
        active = isLeagueActive(currentLeagueTab);
      }
      mainEl.textContent = active ? formatTimer(endTime - nowMs) : 'Ожидает запуска';
    }
  }, 1000);
}