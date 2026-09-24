// ============================================================
//  МАТЧИ — v12.2
// ============================================================

// ============================================================
//  СТРАНИЦА МАТЧЕЙ (главный экран)
// ============================================================
function renderMatchesPage() {
  const upcoming = matches.filter(m => m.status === 'upcoming');
  const live = matches.filter(m => m.status === 'live');
  const finished = matches.filter(m => m.status === 'finished');

  let matchesHtml = '';

  if (live.length > 0) {
    matchesHtml += `<div class="panel"><div class="panel-title">🔴 В эфире прямо сейчас</div><div class="match-grid">${live.map(m => renderMatchCard(m)).join('')}</div></div>`;
  }
  if (upcoming.length > 0) {
    matchesHtml += `<div class="panel"><div class="panel-title">⏳ Предстоящие матчи</div><div class="match-grid">${upcoming.map(m => renderMatchCard(m)).join('')}</div></div>`;
  }
  if (finished.length > 0) {
    matchesHtml += `<div class="panel"><div class="panel-title">✅ Завершённые матчи</div><div class="match-grid">${finished.map(m => renderMatchCard(m)).join('')}</div></div>`;
  }
  if (matches.length === 0) {
    matchesHtml = `<div class="panel"><div class="empty"><div class="empty-icon">🎮</div><div class="empty-title">Матчей пока нет</div><div style="font-size:13px;color:#8b95a8;margin-top:8px;">Заходите позже — скоро добавим новые игры</div></div></div>`;
  }

  // Предупреждение о серии
  let streakWarning = '';
  if ((state.streak || 0) >= 2) {
    streakWarning = `<div style="background:linear-gradient(135deg,rgba(255,100,0,0.15),rgba(255,0,0,0.1));border:2px solid #ff6600;border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
      <div style="font-size:36px;">🔥</div>
      <div>
        <div style="font-size:16px;font-weight:800;color:#ff6600;">Стрик из ${state.streak} побед подряд!</div>
        <div style="font-size:12px;color:#b0b8c8;margin-top:4px;">Угадайте следующий — получите бонус к награде</div>
      </div>
    </div>`;
  }

  return `${streakWarning}
    <div class="matches-layout">
      <div>${matchesHtml}</div>
      <div class="chat-side">
        <div class="panel" style="margin:0;">
          <div class="panel-title"><span>💬 Чат игроков</span><span id="chat-count-side">0</span></div>
          <div class="chat-container">
            <div class="chat-messages" id="chat-messages-side"></div>
            <div class="chat-input-row">
              <input type="text" class="chat-input" id="chat-input-side" placeholder="Написать сообщение..." maxlength="200" onkeypress="if(event.key==='Enter')sendChat('side')">
              <button class="chat-send" onclick="sendChat('side')">➤</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ============================================================
//  КАРТОЧКА МАТЧА
// ============================================================
function renderMatchCard(m) {
  const statusClass = m.status === 'live' ? 'status-live' : m.status === 'finished' ? 'status-finished' : 'status-upcoming';
  const statusText = m.status === 'live' ? '🔴 В ЭФИРЕ' : m.status === 'finished' ? '✅ Завершён' : '⏳ Скоро';

  const dateObj = new Date(m.date.replace(' ', 'T'));
  const dateStr = dateObj.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const minutesLeft = (dateObj.getTime() - now()) / 60000;
  const canPredict = m.status === 'upcoming' && minutesLeft > MINUTES_BEFORE_MATCH;

  let scoreHtml = (m.status === 'finished' || m.status === 'live')
    ? `<div class="vs-score">${m.scoreA ?? '?'} : ${m.scoreB ?? '?'}</div>`
    : `<div class="vs-score pending">VS</div>`;

  let html = `<div class="match-card ${m.status}">
    <div class="match-header">
      <span class="match-status ${statusClass}">${statusText}</span>
      <span class="match-time">${dateStr} · BO${m.bestOf}</span>
    </div>
    <div class="match-teams">
      <div class="team-name">${m.teamA}</div>
      ${scoreHtml}
      <div class="team-name right">${m.teamB}</div>
    </div>`;

  // Кнопка «Смотреть» для live
  if (m.status === 'live' && (m.twitch || m.kick)) {
    html += `<div style="display:flex;gap:6px;justify-content:center;margin-top:8px;">
      <button onclick="goToLiveMatch('${m.id}')" style="background:linear-gradient(135deg,#9146ff,#53fc18);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">🎥 Смотреть трансляцию</button>
    </div>`;
  }

  // Предупреждение о закрытии прогнозов
  if (!canPredict && m.status === 'upcoming') {
    html += `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:8px;text-align:center;font-size:12px;color:#ef4444;">🚫 Прогнозы закрыты — матч вот-вот начнётся</div>`;
  }

  // Рынки для прогнозов
  if (m.status === 'upcoming' && canPredict) {
    if (m.markets?.matchWinner) html += renderMarketWinner(m);
    if (m.markets?.playerKills) {
      m.markets.playerKills.forEach(pk => { html += renderMarketPlayerKills(m, pk); });
    }
    if (m.markets?.totalKills) html += renderMarketTotalKills(m, m.markets.totalKills);
  }

  // Результаты завершённого
  if (m.status === 'finished' && m.results) {
    html += `<div class="prediction-box"><div class="prediction-title">📊 Итоги матча</div>`;
    if (m.results.winner) {
      html += `<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;"><span style="color:#8b95a8;">Победитель</span><strong style="color:#10b981;">${m.results.winner}</strong></div>`;
    }
    if (m.results.totalKills) {
      html += `<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;"><span style="color:#8b95a8;">Всего убийств</span><strong>${m.results.totalKills}</strong></div>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

// ============================================================
//  СТАТИСТИКА ГОЛОСОВАНИЯ ПО МАТЧУ
// ============================================================
function getMatchStats(matchId, market) {
  const users = loadUsers();
  let total = 0;
  const votes = {};

  for (const [name, u] of Object.entries(users)) {
    // Из истории
    if (u.history) {
      u.history.forEach(h => {
        if (h.matchId === matchId && h.market === market && h.value !== undefined) {
          votes[h.value] = (votes[h.value] || 0) + 1;
          total++;
        }
      });
    }
    // Из активных прогнозов
    if (u.predictions) {
      Object.entries(u.predictions).forEach(([key, pred]) => {
        if (pred.matchId === matchId && pred.market === market) {
          votes[pred.value] = (votes[pred.value] || 0) + 1;
          total++;
        }
      });
    }
  }
  return { votes, total };
}

// ============================================================
//  РЫНОК — ПОБЕДИТЕЛЬ МАТЧА
// ============================================================
function renderMarketWinner(m) {
  const key = m.id + '_winner';
  const pred = state.predictions[key];
  const stats = getMatchStats(m.id, 'winner');
  const countA = stats.votes[m.teamA] || 0;
  const countB = stats.votes[m.teamB] || 0;
  const pctA = stats.total > 0 ? Math.round(countA / stats.total * 100) : 0;
  const pctB = stats.total > 0 ? Math.round(countB / stats.total * 100) : 0;

  if (pred) {
    return `<div class="prediction-box">
      <div class="prediction-title">🏆 Победитель · ваш прогноз</div>
      <div style="font-size:13px;">Ставка на: <strong style="color:#00d4ff;">${pred.value}</strong></div>
    </div>`;
  }

  return `<div class="prediction-box">
    <div class="prediction-title">🏆 Кто победит? · проголосовало: ${stats.total}</div>
    <div class="prediction-row">
      <button class="pred-btn" onclick="makePrediction('${m.id}', 'winner', '${m.teamA}')">
        <div class="pred-btn-fill" style="width:${pctA}%;"></div>
        <div class="pred-btn-content"><span>${m.teamA}</span><span class="pred-btn-pct">${stats.total > 0 ? pctA + '%' : '—'}</span></div>
      </button>
      <button class="pred-btn" onclick="makePrediction('${m.id}', 'winner', '${m.teamB}')">
        <div class="pred-btn-fill" style="width:${pctB}%;"></div>
        <div class="pred-btn-content"><span>${m.teamB}</span><span class="pred-btn-pct">${stats.total > 0 ? pctB + '%' : '—'}</span></div>
      </button>
    </div>
  </div>`;
}

// ============================================================
//  РЫНОК — KILLS ИГРОКА
// ============================================================
function renderMarketPlayerKills(m, pk) {
  const key = `${m.id}_${pk.player}_kills`;
  const pred = state.predictions[key];
  const stats = getMatchStats(m.id, `${pk.player}_kills`);
  const overC = stats.votes['over'] || 0;
  const underC = stats.votes['under'] || 0;
  const pctO = stats.total > 0 ? Math.round(overC / stats.total * 100) : 0;
  const pctU = stats.total > 0 ? Math.round(underC / stats.total * 100) : 0;

  if (pred) {
    return `<div class="prediction-box">
      <div class="prediction-title">🔫 ${pk.player} · линия ${pk.line} kills</div>
      <div style="font-size:13px;">Ваш прогноз: <strong style="color:#00d4ff;">${pred.value === 'over' ? 'БОЛЬШЕ ' + pk.line : 'МЕНЬШЕ ' + pk.line}</strong></div>
    </div>`;
  }

  return `<div class="prediction-box">
    <div class="prediction-title">🔫 ${pk.player}: kills — больше или меньше ${pk.line}? · ${stats.total}</div>
    <div class="prediction-row">
      <button class="pred-btn" onclick="makePrediction('${m.id}', '${pk.player}_kills', 'over')">
        <div class="pred-btn-fill" style="width:${pctO}%;"></div>
        <div class="pred-btn-content"><span>⬆️ БОЛЬШЕ ${pk.line}</span><span class="pred-btn-pct">${stats.total > 0 ? pctO + '%' : '—'}</span></div>
      </button>
      <button class="pred-btn" onclick="makePrediction('${m.id}', '${pk.player}_kills', 'under')">
        <div class="pred-btn-fill" style="width:${pctU}%;"></div>
        <div class="pred-btn-content"><span>⬇️ МЕНЬШЕ ${pk.line}</span><span class="pred-btn-pct">${stats.total > 0 ? pctU + '%' : '—'}</span></div>
      </button>
    </div>
  </div>`;
}

// ============================================================
//  РЫНОК — ТОТАЛ KILLS
// ============================================================
function renderMarketTotalKills(m, tk) {
  const key = `${m.id}_total_kills`;
  const pred = state.predictions[key];
  const stats = getMatchStats(m.id, 'total_kills');
  const overC = stats.votes['over'] || 0;
  const underC = stats.votes['under'] || 0;
  const pctO = stats.total > 0 ? Math.round(overC / stats.total * 100) : 0;
  const pctU = stats.total > 0 ? Math.round(underC / stats.total * 100) : 0;

  if (pred) {
    return `<div class="prediction-box">
      <div class="prediction-title">📊 Тотал · линия ${tk.line}</div>
      <div style="font-size:13px;">Ваш прогноз: <strong style="color:#00d4ff;">${pred.value === 'over' ? 'БОЛЬШЕ ' + tk.line : 'МЕНЬШЕ ' + tk.line}</strong></div>
    </div>`;
  }

  return `<div class="prediction-box">
    <div class="prediction-title">📊 Тотал убийств: больше или меньше ${tk.line}? · ${stats.total}</div>
    <div class="prediction-row">
      <button class="pred-btn" onclick="makePrediction('${m.id}', 'total_kills', 'over')">
        <div class="pred-btn-fill" style="width:${pctO}%;"></div>
        <div class="pred-btn-content"><span>⬆️ БОЛЬШЕ ${tk.line}</span><span class="pred-btn-pct">${stats.total > 0 ? pctO + '%' : '—'}</span></div>
      </button>
      <button class="pred-btn" onclick="makePrediction('${m.id}', 'total_kills', 'under')">
        <div class="pred-btn-fill" style="width:${pctU}%;"></div>
        <div class="pred-btn-content"><span>⬇️ МЕНЬШЕ ${tk.line}</span><span class="pred-btn-pct">${stats.total > 0 ? pctU + '%' : '—'}</span></div>
      </button>
    </div>
  </div>`;
}
// ============================================================
//  СОЗДАНИЕ ПРОГНОЗА — модалка подтверждения
// ============================================================
function makePrediction(matchId, market, value) {
  if (!currentUser) { toast('⚠️ Сначала войдите', '#ef4444'); return; }

  const key = `${matchId}_${market}`;
  if (state.predictions[key]) {
    toast('❌ Вы уже сделали прогноз по этому рынку', '#ef4444');
    return;
  }

  const m = matches.find(mm => mm.id === matchId);
  if (!m) return;

  const matchTime = new Date(m.date.replace(' ', 'T')).getTime();
  if ((matchTime - now()) / 60000 <= MINUTES_BEFORE_MATCH) {
    toast('🚫 Прогнозы закрыты — матч вот-вот начнётся', '#ef4444');
    return;
  }

  // Описание прогноза
  let predDesc = '';
  if (market === 'winner') {
    predDesc = `Победа: ${value}`;
  } else if (market === 'total_kills') {
    predDesc = `${value === 'over' ? 'БОЛЬШЕ' : 'МЕНЬШЕ'} ${m.markets.totalKills.line} убийств`;
  } else if (market.endsWith('_kills')) {
    const p = market.replace('_kills', '');
    const pk = m.markets.playerKills.find(x => x.player === p);
    predDesc = `${p}: ${value === 'over' ? 'БОЛЬШЕ' : 'МЕНЬШЕ'} ${pk.line} kills`;
  }

  // Активные бустеры и страховки
  const activeBoosters = (state.bonuses?.boosters || []).filter(b => !b.usedOn);
  const activeInsurances = (state.bonuses?.insurance || []).filter(i => !i.usedOn);

  let bonusesHtml = '';
  if (activeBoosters.length > 0) {
    bonusesHtml += `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #1f2942;">
      <div style="font-size:11px;color:#8b95a8;text-transform:uppercase;margin-bottom:8px;">🎯 Бустеры (можно активировать только один)</div>`;
    activeBoosters.forEach(b => {
      const ri = state.bonuses.boosters.indexOf(b);
      bonusesHtml += `<div class="boost-activate-card ${b.activated ? 'activated' : ''}">
        <div class="boost-activate-icon">🎯</div>
        <div class="boost-activate-info"><div class="boost-activate-title">Бустер +${b.value}% к награде</div></div>
        <button class="boost-activate-toggle ${b.activated ? '' : 'off'}" onclick="toggleBoosterActivation(${ri})">${b.activated ? '✓ ВКЛ' : 'Активировать'}</button>
      </div>`;
    });
    bonusesHtml += `</div>`;
  }

  if (activeInsurances.length > 0) {
    bonusesHtml += `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #1f2942;">
      <div style="font-size:11px;color:#8b95a8;text-transform:uppercase;margin-bottom:8px;">🛡️ Страховки (можно активировать только одну)</div>`;
    activeInsurances.forEach(ins => {
      const ri = state.bonuses.insurance.indexOf(ins);
      bonusesHtml += `<div class="boost-activate-card insurance ${ins.activated ? 'activated' : ''}">
        <div class="boost-activate-icon">🛡️</div>
        <div class="boost-activate-info"><div class="boost-activate-title">${ins.type === 'premium' ? 'Премиум-страховка' : 'Обычная страховка'}</div></div>
        <button class="boost-activate-toggle insurance-on ${ins.activated ? '' : 'off'}" onclick="toggleInsuranceActivation(${ri})">${ins.activated ? '✓ ВКЛ' : 'Активировать'}</button>
      </div>`;
    });
    bonusesHtml += `</div>`;
  }

  document.getElementById('modal').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:56px;margin-bottom:14px;">⚠️</div>
      <div style="font-size:20px;font-weight:800;color:#ffd700;margin-bottom:12px;">Подтверждение прогноза</div>
      <div style="font-size:14px;line-height:1.7;margin-bottom:18px;">
        <strong>${m.teamA} vs ${m.teamB}</strong><br>
        <span style="color:#00d4ff;">${predDesc}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">
        <div style="background:#0f1420;border-radius:10px;padding:12px;">
          <div style="font-size:10px;color:#8b95a8;margin-bottom:6px;">ЕСЛИ УГАДАЕТЕ</div>
          <div style="font-size:20px;font-weight:900;color:#10b981;">+100</div>
        </div>
        <div style="background:#0f1420;border-radius:10px;padding:12px;">
          <div style="font-size:10px;color:#8b95a8;margin-bottom:6px;">ЕСЛИ ОШИБЁТЕСЬ</div>
          <div style="font-size:20px;font-weight:900;color:#ef4444;">−150</div>
        </div>
      </div>
      ${bonusesHtml}
      <div style="display:flex;gap:8px;margin-top:18px;">
        <button class="btn btn-primary" style="flex:1;" onclick="confirmPrediction('${matchId}', '${market}', '${value}')">✅ ПОДТВЕРДИТЬ</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Отмена</button>
      </div>
    </div>`;
  document.getElementById('modal-bg').classList.add('show');
}

// ============================================================
//  АКТИВАЦИЯ БУСТЕРОВ / СТРАХОВОК
// ============================================================
function toggleBoosterActivation(idx) {
  state.bonuses.boosters.forEach((b, i) => { if (i !== idx) b.activated = false; });
  const b = state.bonuses.boosters[idx];
  if (!b) return;
  b.activated = !b.activated;
  saveState();
  closeModal();
  toast(b.activated ? '🎯 Бустер активирован' : '⏸️ Бустер отключён', b.activated ? '#10b981' : '#8b95a8');
}

function toggleInsuranceActivation(idx) {
  state.bonuses.insurance.forEach((ins, i) => { if (i !== idx) ins.activated = false; });
  const ins = state.bonuses.insurance[idx];
  if (!ins) return;
  ins.activated = !ins.activated;
  saveState();
  closeModal();
  toast(ins.activated ? '🛡️ Страховка активирована' : '⏸️ Страховка отключена', ins.activated ? '#a78bfa' : '#8b95a8');
}

// ============================================================
//  ПОДТВЕРЖДЕНИЕ ПРОГНОЗА
// ============================================================
function confirmPrediction(matchId, market, value) {
  const key = `${matchId}_${market}`;
  state.predictions[key] = { matchId, market, value, createdAt: now() };
  state.activityActions = (state.activityActions || 0) + 1;

  // Помечаем бустер/страховку как использованные
  const b = state.bonuses.boosters.find(x => x.activated && !x.usedOn);
  if (b) { b.activated = false; b.usedOn = key; }

  const i = state.bonuses.insurance.find(x => x.activated && !x.usedOn);
  if (i) { i.activated = false; i.usedOn = key; }

  toast('✅ Прогноз принят!', '#10b981');
  closeModal();
  updateHeader();

  // Перерисовка текущей страницы с сохранением скролла
  const activePage = document.querySelector('.nav-btn.active')?.dataset.page || 'matches';
  const scrollY = window.scrollY;
  renderPage(activePage);
  setTimeout(() => window.scrollTo(0, scrollY), 10);

  checkAchievements();
  checkReferralProgress();
  saveState();
}

// ============================================================
//  ПЕРЕХОД К LIVE-МАТЧУ
// ============================================================
function goToLiveMatch(matchId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.nav-btn[data-page="live"]').classList.add('active');

  const m = matches.find(x => x.id === matchId);
  if (m) {
    if (m.twitch) currentLiveStream[matchId] = 'twitch';
    else if (m.kick) currentLiveStream[matchId] = 'kick';
  }

  setTimeout(() => {
    const el = document.getElementById('live-match-' + matchId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
  renderPage('live');
}