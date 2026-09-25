// ============================================================
//  ПРОФИЛЬ — v12.2
// ============================================================

// ============================================================
//  ГЛАВНАЯ СТРАНИЦА ПРОФИЛЯ
// ============================================================
function renderProfilePage() {
  const userCosmetics = state.cosmetics || [];
  const activeBadges = state.activeBadges || {};
  const avatar = AVATARS.find(a => a.id === state.avatar) || AVATARS[0];
  const frame = FRAMES.find(f => f.id === state.frame) || FRAMES[0];
  const rank = getEloRank(state.elo || ELO_START);

  // Классы аватара
  let avatarClass = 'profile-avatar';
  if (frame.id !== 'none') avatarClass += ' frame-' + frame.id;

  // Классы ника
  let nameClass = 'profile-name';
  if (state.activeNickEffect === 'animnick') nameClass += ' anim-nick';
  else if (state.activeNickEffect === 'fire_effect') nameClass += ' fire-nick';
  else if (state.activeNickEffect === 'electric') nameClass += ' electric-nick';
  else if (state.activeNickEffect === 'crystal_effect') nameClass += ' crystal-nick';
  else if (state.activeNickEffect === 'rainbow_effect') nameClass += ' anim-nick';
  else if (activeBadges.vip && userCosmetics.includes('vip')) nameClass += ' vip-nick';

  const hasVip = userCosmetics.includes('vip');
  const activeWithdrawals = (state.withdrawals || []).filter(w => w.status === 'pending').length;

  // Собираем значки рядом с ником
  const badgesHtml = [
    activeBadges.vip && hasVip ? ' ⭐' : '',
    activeBadges.crown && userCosmetics.includes('crown') ? ' 👑' : '',
    activeBadges.badge_hunter && userCosmetics.includes('badge_hunter') ? ' 🎯' : '',
    activeBadges.badge_king && userCosmetics.includes('badge_king') ? ' ♛' : '',
  ].join('');

  return `
    <div class="profile-header">
      <div class="profile-avatar-wrap">
        <div class="${avatarClass}"><span>${avatar.icon}</span></div>
      </div>
      <div class="profile-info">
        <div class="${nameClass}">${state.user}${badgesHtml}</div>
        <div class="profile-rank-badge" style="color:${rank.color};border:1px solid ${rank.color};">
          ${rank.icon} ${rank.name} · ${state.elo || ELO_START} ELO
        </div>
      </div>
    </div>

    <div class="profile-tabs">
      <div class="profile-tab ${profileTab === 'main' ? 'active' : ''}" onclick="switchProfileTab('main')">📊 Основное</div>
      <div class="profile-tab ${profileTab === 'withdrawals' ? 'active' : ''}" onclick="switchProfileTab('withdrawals')">💳 Выводы${activeWithdrawals > 0 ? ' (' + activeWithdrawals + ')' : ''}</div>
      <div class="profile-tab ${profileTab === 'achievements' ? 'active' : ''}" onclick="switchProfileTab('achievements')">🏅 Достижения</div>
      <div class="profile-tab ${profileTab === 'friends' ? 'active' : ''}" onclick="switchProfileTab('friends')">🤝 Друзья</div>
      <div class="profile-tab ${profileTab === 'customize' ? 'active' : ''}" onclick="switchProfileTab('customize')">🎨 Кастомизация</div>
      <div class="profile-tab ${profileTab === 'wheel' ? 'active' : ''}" onclick="switchProfileTab('wheel')">🎡 Колесо</div>
    </div>

    <div id="profile-content">${renderProfileTab()}</div>
  `;
}

function switchProfileTab(tab) {
  profileTab = tab;
  renderPage('profile');
}

function renderProfileTab() {
  if (profileTab === 'withdrawals') return renderProfileWithdrawals();
  if (profileTab === 'achievements') return renderProfileAchievements();
  if (profileTab === 'friends') return renderProfileFriends();
  if (profileTab === 'customize') return renderProfileCustomize();
  if (profileTab === 'wheel') return renderWheelPage();
  return renderProfileMain();
}

// ============================================================
//  ВКЛАДКА «ОСНОВНОЕ» — статистика + инвентарь + история
// ============================================================
function renderProfileMain() {
  const history = state.history || [];
  const correct = history.filter(h => h.correct).length;
  const wrong = history.filter(h => !h.correct).length;
  const winRate = history.length > 0 ? Math.round(correct / history.length * 100) : 0;

  const activeBoosters = (state.bonuses?.boosters || []).filter(b => !b.usedOn);
  const activeInsurances = (state.bonuses?.insurance || []).filter(i => !i.usedOn);
  const pendingCases = state.bonuses?.pendingCases || [];
  const skins = state.inventory || [];

  const hasInventory = activeBoosters.length || activeInsurances.length || pendingCases.length || skins.length;

  return `
    <!-- СТАТИСТИКА -->
    <div class="panel">
      <div class="panel-title">📊 Ваша статистика</div>
      <div class="profile-stats">
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">Прогнозов</div><div style="font-size:20px;font-weight:800;color:#00d4ff;">${history.length + Object.keys(state.predictions || {}).length}</div></div>
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">✅ Угадано</div><div style="font-size:20px;font-weight:800;color:#10b981;">${correct}</div></div>
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">❌ Промахов</div><div style="font-size:20px;font-weight:800;color:#ef4444;">${wrong}</div></div>
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">Точность</div><div style="font-size:20px;font-weight:800;color:#10b981;">${winRate}%</div></div>
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">🔥 Серия</div><div style="font-size:20px;font-weight:800;color:#ffd700;">${state.bestStreak || 0}</div></div>
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">📊 Активность</div><div style="font-size:20px;font-weight:800;color:#a78bfa;">${state.activityActions || 0}</div></div>
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">📦 Кейсов</div><div style="font-size:20px;font-weight:800;color:#a78bfa;">${state.casesOpened || 0}</div></div>
        <div class="profile-stat"><div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">💰 Заработано</div><div style="font-size:20px;font-weight:800;color:#10b981;">${fmt(state.rubles || 0)} ₽</div></div>
      </div>
    </div>

    <!-- ИНВЕНТАРЬ -->
    ${hasInventory ? `
      <div class="panel">
        <div class="panel-title">⚡ Ваш инвентарь</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${activeBoosters.map(b => {
            const ri = state.bonuses.boosters.indexOf(b);
            return `<div class="boost-activate-card ${b.activated ? 'activated' : ''}">
              <div class="boost-activate-icon">🎯</div>
              <div class="boost-activate-info"><div class="boost-activate-title">Бустер +${b.value}% к награде</div></div>
              <button class="boost-activate-toggle ${b.activated ? '' : 'off'}" onclick="toggleBoosterFromProfile(${ri})">${b.activated ? '✓ АКТИВЕН' : 'Активировать'}</button>
            </div>`;
          }).join('')}

          ${activeInsurances.map(ins => {
            const ri = state.bonuses.insurance.indexOf(ins);
            return `<div class="boost-activate-card insurance ${ins.activated ? 'activated' : ''}">
              <div class="boost-activate-icon">🛡️</div>
              <div class="boost-activate-info"><div class="boost-activate-title">${ins.type === 'premium' ? 'Премиум-страховка' : 'Страховка'}</div></div>
              <button class="boost-activate-toggle insurance-on ${ins.activated ? '' : 'off'}" onclick="toggleInsuranceFromProfile(${ri})">${ins.activated ? '✓ АКТИВНА' : 'Активировать'}</button>
            </div>`;
          }).join('')}

          ${pendingCases.map((c, idx) => `
            <div style="background:rgba(255,215,0,0.15);border:1px solid #ffd700;border-radius:10px;padding:10px 14px;color:#ffd700;font-size:13px;font-weight:700;display:flex;justify-content:space-between;align-items:center;">
              <span>📦 ${c === 'small' ? 'Малый' : c === 'medium' ? 'Средний' : 'Большой'} кейс</span>
              <button onclick="openPendingCase(${idx})" style="background:#ffd700;color:#1a0a2e;border:none;border-radius:6px;padding:6px 14px;font-weight:800;cursor:pointer;font-family:inherit;">Открыть</button>
            </div>
          `).join('')}

          ${skins.map(s => `
            <div style="background:linear-gradient(135deg,rgba(255,100,0,0.12),rgba(124,58,237,0.12));border:1px solid #ff6b00;border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:12px;">
              <div style="font-size:32px;">${s.icon}</div>
              <div style="flex:1;">
                <div style="font-weight:800;font-size:13px;color:#e6edf7;">${s.name}</div>
                <div style="font-size:10px;color:#8b95a8;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">${s.rarity} · ${s.price} 🟡</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- ИСТОРИЯ ПРОГНОЗОВ -->
    <div class="panel">
      <div class="panel-title">📜 История прогнозов</div>
      ${history.length === 0
        ? '<div style="text-align:center;padding:20px;color:#8b95a8;">Пока нет прогнозов. Сделайте первый — и он появится здесь.</div>'
        : `<div style="display:flex;flex-direction:column;gap:6px;">
            ${history.slice(-10).reverse().map(h => `
              <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#0f1420;border-radius:10px;font-size:12px;">
                <div>
                  <div style="font-weight:700;">${h.matchName}</div>
                  <div style="font-size:10px;color:#8b95a8;">${h.predLabel}</div>
                </div>
                <div style="color:${h.correct ? '#10b981' : '#ef4444'};font-weight:800;">
                  ${h.correct ? '✅ +' + h.points : '❌ ' + h.points}
                </div>
              </div>
            `).join('')}
          </div>`}
    </div>
  `;
}

// ============================================================
//  АКТИВАЦИЯ БУСТЕРА/СТРАХОВКИ ИЗ ПРОФИЛЯ
// ============================================================
function toggleBoosterFromProfile(idx) {
  state.bonuses.boosters.forEach((b, i) => { if (i !== idx) b.activated = false; });
  const b = state.bonuses.boosters[idx];
  if (!b) return;
  b.activated = !b.activated;
  saveState();
  renderPage('profile');
  toast(b.activated ? '🎯 Бустер активирован' : '⏸️ Бустер отключён', b.activated ? '#10b981' : '#8b95a8');
}

function toggleInsuranceFromProfile(idx) {
  state.bonuses.insurance.forEach((ins, i) => { if (i !== idx) ins.activated = false; });
  const ins = state.bonuses.insurance[idx];
  if (!ins) return;
  ins.activated = !ins.activated;
  saveState();
  renderPage('profile');
  toast(ins.activated ? '🛡️ Страховка активирована' : '⏸️ Страховка отключена', ins.activated ? '#a78bfa' : '#8b95a8');
}
// ============================================================
//  ВКЛАДКА «ВЫВОДЫ» — активная заявка + история + статистика
// ============================================================
function renderProfileWithdrawals() {
  const withdrawals = state.withdrawals || [];
  const active = withdrawals.filter(w => w.status === 'pending');
  const history = withdrawals
    .filter(w => w.status !== 'pending')
    .sort((a, b) => (b.paidAt || b.rejectedAt || b.createdAt) - (a.paidAt || a.rejectedAt || a.createdAt));

  const totalWithdrawn = withdrawals.filter(w => w.status === 'paid').reduce((s, w) => s + w.amount, 0);
  const totalBonus = withdrawals.filter(w => w.status === 'paid').reduce((s, w) => s + (w.bonus || 0), 0);

  let html = '';

  // Активная заявка
  if (active.length > 0) {
    html += `<div class="panel"><div class="panel-title">⏳ Активная заявка на вывод</div>`;
    active.forEach(w => {
      const age = now() - w.createdAt;
      const status = getWithdrawStatus(w);
      const bonus = calcWithdrawBonus(w);
      const progress = Math.min(100, (age / (WITHDRAW_STANDARD_HOURS * 3600000)) * 100);
      const overdue = age > WITHDRAW_STANDARD_HOURS * 3600000;

      html += `<div class="withdraw-tracker">
        <div class="wt-row"><span class="wt-label">💰 Сумма</span><span class="wt-value">${fmt(w.amount)} ₽</span></div>
        <div class="wt-row"><span class="wt-label">💳 Способ</span><span class="wt-value">${w.method}</span></div>
        <div class="wt-row"><span class="wt-label">📱 Реквизиты</span><span class="wt-value">${w.requisitesDisplay || w.requisites}</span></div>
        <div class="wt-row"><span class="wt-label">🕒 Отправлено</span><span class="wt-value">${new Date(w.createdAt).toLocaleString('ru-RU')}</span></div>
        <div class="wt-row"><span class="wt-label">⏱️ В обработке</span><span class="wt-value" data-withdraw-timer="${w.id}">${formatTimeSince(age)}</span></div>
        <div class="wt-row"><span class="wt-label">📌 Статус</span><span class="wt-value" style="color:${status.color};">${status.label}</span></div>

        <div style="height:8px;background:#0a0e1a;border-radius:4px;margin:10px 0;overflow:hidden;">
          <div data-withdraw-progress="${w.id}" style="height:100%;width:${progress}%;background:linear-gradient(90deg,#00d4ff,#7c3aed);border-radius:4px;"></div>
        </div>

        <div class="wt-row">
          <span class="wt-label">💵 Бонус ${overdue ? '(просрочка!)' : '(после 12ч)'}</span>
          <span class="wt-value" style="color:${bonus > 0 ? '#10b981' : '#8b95a8'};" data-withdraw-bonus="${w.id}">${bonus > 0 ? '+' + bonus + ' ₽' : '0 ₽'}</span>
        </div>

        ${overdue ? `<div style="background:rgba(245,158,11,0.1);border:1px solid #f59e0b;border-radius:8px;padding:10px;margin-top:10px;font-size:12px;color:#f59e0b;">⚠️ Админ задерживает выплату. За каждый час просрочки начисляется +5 ₽ бонуса.</div>` : ''}
      </div>`;
    });
    html += `</div>`;
  }

  // Статистика
  html += `<div class="panel">
    <div class="panel-title">📊 Статистика выводов</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div style="background:#0f1420;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">Всего выведено</div>
        <div style="font-size:22px;font-weight:800;color:#10b981;margin-top:4px;">${fmt(totalWithdrawn)} ₽</div>
      </div>
      <div style="background:#0f1420;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:10px;color:#8b95a8;text-transform:uppercase;">Бонусов за задержку</div>
        <div style="font-size:22px;font-weight:800;color:#ffd700;margin-top:4px;">${fmt(totalBonus)} ₽</div>
      </div>
    </div>
  </div>`;

  // История
  html += `<div class="panel">
    <div class="panel-title">📜 История выводов</div>
    ${history.length === 0
      ? '<div style="text-align:center;padding:20px;color:#8b95a8;">Пока нет завершённых выводов</div>'
      : `<div style="display:flex;flex-direction:column;gap:8px;">
          ${history.map(w => {
            const status = getWithdrawStatus(w);
            const duration = w.paidAt ? formatTimeSince(w.paidAt - w.createdAt) : '—';
            const borderClr = w.status === 'rejected' ? '#ef4444' : w.status === 'paid' ? '#10b981' : '#1f2942';
            return `<div style="background:#0f1420;border-radius:10px;padding:12px 14px;border-left:3px solid ${borderClr};">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
                <span style="font-weight:700;">${fmt(w.amount)} ₽${w.bonus ? ' (+' + w.bonus + ' ₽ бонус)' : ''}</span>
                <span style="color:${status.color};font-weight:700;">${status.label}</span>
              </div>
              <div style="font-size:11px;color:#8b95a8;">
                ${w.method} · ${new Date(w.createdAt).toLocaleDateString('ru-RU')} · ${w.paidAt ? 'За ' + duration : ''}
              </div>
              ${w.status === 'rejected' && w.rejectedReason ? `
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:8px 12px;margin-top:8px;font-size:12px;">
                  <span style="color:#8b95a8;">Причина отказа: </span><strong style="color:#ff8888;">${w.rejectedReason}</strong>
                </div>
              ` : ''}
            </div>`;
          }).join('')}
        </div>`}
  </div>`;

  return html;
}

// ============================================================
//  ВКЛАДКА «ДОСТИЖЕНИЯ»
// ============================================================
function renderProfileAchievements() {
  const unlocked = state.achievements || {};
  const total = ACHIEVEMENTS.length;
  const count = Object.keys(unlocked).length;
  const pct = Math.round(count / total * 100);

  return `<div class="panel">
    <div class="panel-title"><span>🏅 Достижения</span><span>${count} / ${total}</span></div>

    <div style="background:#0f1420;border-radius:12px;padding:14px;margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;">
        <span style="color:#8b95a8;">Прогресс коллекции</span>
        <span style="color:#00d4ff;font-weight:800;">${pct}%</span>
      </div>
      <div style="background:#0a0e1a;border-radius:4px;height:8px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#00d4ff,#7c3aed);height:100%;width:${pct}%;"></div>
      </div>
    </div>

    <div class="achievements-grid">
      ${ACHIEVEMENTS.map(a => {
        const u = !!unlocked[a.id];
        const rarity = { common: 'Обычное', rare: 'Редкое', epic: 'Эпическое', legendary: 'Легендарное' }[a.rarity];
        return `<div class="achievement ${u ? 'unlocked' : 'locked'}">
          <div class="ach-icon">${a.icon}</div>
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
          <span class="ach-rarity rarity-${a.rarity}">${rarity}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ============================================================
//  ВКЛАДКА «ДРУЗЬЯ» (рефералы)
// ============================================================
function renderProfileFriends() {
  const refCode = state.refCode || '—';
  const referrals = state.referrals || [];
  const tracking = state.referralTracking || {};
  const users = loadUsers();
  const totalEarned = Object.values(tracking).reduce((s, t) => s + (t.totalEarned || 0), 0);

  return `<div class="panel">
    <div class="panel-title">🤝 Приглашайте друзей и зарабатывайте</div>

    <div style="background:linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,100,0,0.1));border:1px solid rgba(255,215,0,0.4);border-radius:18px;padding:20px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🤝</div>
      <div style="font-size:18px;font-weight:900;margin-bottom:8px;">До 700 🟡 + 2 кейса за друга!</div>
      <div style="font-size:12px;color:#8b95a8;margin-bottom:12px;">Дайте другу свой код при регистрации</div>

      <div style="font-family:monospace;font-size:28px;font-weight:900;letter-spacing:4px;color:#ffd700;background:rgba(0,0,0,0.4);padding:16px;border-radius:12px;margin:12px 0;user-select:all;">${refCode}</div>

      <button class="btn btn-gold" onclick="copyRefCode()" style="width:100%;max-width:300px;margin:8px auto;display:block;">📋 Скопировать код</button>
    </div>

    <div style="background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.25);border-radius:12px;padding:14px;margin-top:14px;font-size:12px;color:#b0b8c8;line-height:1.7;">
      <strong style="color:#00d4ff;">📈 Награды по этапам:</strong><br>
      🟢 Друг зарегистрировался → <strong style="color:#10b981;">+50 🟡</strong><br>
      🔵 Друг сделал 5 прогнозов → <strong style="color:#10b981;">+250 🟡</strong><br>
      🟣 Друг сделал первый вывод → <strong style="color:#10b981;">+400 🟡</strong><br>
      💎 Друг сделал второй вывод → <strong style="color:#a78bfa;">Средний кейс</strong><br>
      👑 Друг сделал третий вывод → <strong style="color:#ffd700;">Большой кейс</strong>
    </div>

    <div style="text-align:center;font-size:14px;margin-top:14px;color:#ffd700;">
      💰 Всего заработано с друзей: <strong>${fmt(totalEarned)} 🟡</strong>
    </div>
  </div>

  <div class="panel">
    <div class="panel-title"><span>👥 Ваши друзья</span><span>${referrals.length}</span></div>
    ${referrals.length === 0
      ? '<div style="text-align:center;padding:20px;color:#8b95a8;">Пока никого. Отправьте код другу — и он появится здесь.</div>'
      : `<div style="display:flex;flex-direction:column;gap:12px;">
          ${referrals.map(name => {
            const u = users[name] || {};
            const rank = getEloRank(u.elo || ELO_START);
            const t = tracking[name] || {};
            const refPreds = (u.history || []).length;
            const refWithdraws = u.withdrawCount || 0;

            const stages = [
              { done: true, label: 'Регистрация', reward: '+50 🟡' },
              { done: t.fivePredictions || refPreds >= 5, label: '5 прогнозов', reward: '+250 🟡', prog: Math.min(refPreds, 5), max: 5 },
              { done: t.firstWithdraw || refWithdraws >= 1, label: 'Первый вывод', reward: '+400 🟡' },
              { done: t.secondWithdraw || refWithdraws >= 2, label: 'Второй вывод', reward: '💎 Средний кейс' },
              { done: t.thirdWithdraw || refWithdraws >= 3, label: 'Третий вывод', reward: '👑 Большой кейс' }
            ];
            const doneCount = stages.filter(s => s.done).length;
            const progressPct = Math.round(doneCount / stages.length * 100);

            return `<div style="background:#0f1420;border-radius:12px;padding:14px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
                <div>
                  <div style="font-weight:800;font-size:14px;">${name}</div>
                  <div style="font-size:11px;color:#8b95a8;">${rank.icon} ${u.elo || ELO_START} ELO</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:11px;color:#8b95a8;">Заработано</div>
                  <div style="font-weight:800;color:#ffd700;">${fmt(t.totalEarned || 0)} 🟡</div>
                </div>
              </div>

              <div class="ref-progress-bar"><div class="ref-progress-fill" style="width:${progressPct}%;"></div></div>
              <div style="font-size:11px;color:#8b95a8;margin-top:6px;">${doneCount} из ${stages.length} этапов (${progressPct}%)</div>

              <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;">
                ${stages.map(s => `
                  <div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 10px;background:${s.done ? 'rgba(16,185,129,0.1)' : '#0a0e1a'};border-radius:8px;${s.done ? 'color:#10b981;' : 'color:#5a6478;'}">
                    <span>${s.done ? '✅' : '⏳'} ${s.label}${s.prog !== undefined && !s.done ? ` (${s.prog}/${s.max})` : ''}</span>
                    <span style="font-weight:700;">${s.reward}</span>
                  </div>
                `).join('')}
              </div>
            </div>`;
          }).join('')}
        </div>`}
  </div>`;
}

// ============================================================
//  КОПИРОВАНИЕ РЕФЕРАЛЬНОГО КОДА
// ============================================================
function copyRefCode() {
  navigator.clipboard.writeText(state.refCode).then(() => {
    toast('📋 Реферальный код скопирован!', '#10b981');
  }).catch(() => {
    toast('⚠️ Не удалось скопировать. Скопируйте вручную.', '#ef4444');
  });
}

// ============================================================
//  ВКЛАДКА «КАСТОМИЗАЦИЯ» — аватар, рамка, эффекты, значки
// ============================================================
function renderProfileCustomize() {
  const userCosmetics = state.cosmetics || [];
  const activeBadges = state.activeBadges || {};
  const nickEffects = COSMETICS.filter(c => c.category === 'nick_effect');
  const badges = COSMETICS.filter(c => c.category === 'badge' || c.category === 'crown' || c.category === 'vip');

  return `
    <!-- АВАТАР -->
    <div class="panel">
      <div class="panel-title">👤 Аватар</div>
      <div style="font-size:12px;color:#8b95a8;margin-bottom:8px;">Стоимость нового аватара — 30 🟡</div>
      <div class="avatars-grid">
        ${AVATARS.map(a => {
          const owned = a.free || userCosmetics.includes('av_' + a.id);
          const sel = state.avatar === a.id;
          return `<div class="avatar-option ${sel ? 'selected' : ''} ${owned ? '' : 'locked'}" 
                        onclick="${owned ? `setAvatar('${a.id}')` : `buyAvatar('${a.id}')`}"
                        title="${a.name}${owned ? '' : ' · 30 🟡'}">${a.icon}</div>`;
        }).join('')}
      </div>
    </div>

    <!-- РАМКА -->
    <div class="panel">
      <div class="panel-title">🖼️ Рамка для аватара</div>
      <div style="font-size:12px;color:#8b95a8;margin-bottom:8px;">Купленные рамки выделяют ваш аватар в чате и профиле</div>
      <div class="avatars-grid">
        ${FRAMES.map(f => {
          const owned = f.free || userCosmetics.includes('frame_' + f.id);
          const sel = state.frame === f.id;
          return `<div class="avatar-option ${sel ? 'selected' : ''} ${owned ? '' : 'locked'}" 
                        onclick="${owned ? `setFrame('${f.id}')` : `buyFrameFromProfile('${f.id}')`}" 
                        title="${f.name}${owned ? '' : ' · ' + f.cost + ' 🟡'}">${f.icon}</div>`;
        }).join('')}
      </div>
    </div>

    <!-- ЗНАЧКИ -->
    <div class="panel">
      <div class="panel-title">🏅 Значки</div>
      <div style="font-size:12px;color:#8b95a8;margin-bottom:8px;">Значки показываются рядом с вашим ником в чате и профиле. Можно включить несколько сразу — или все выключить.</div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${badges.map(b => {
          const owned = userCosmetics.includes(b.id);
          const isActive = !!activeBadges[b.id];
          return `<div class="boost-activate-card ${isActive ? 'activated' : ''}">
            <div class="boost-activate-icon">${b.icon}</div>
            <div class="boost-activate-info">
              <div class="boost-activate-title">${b.name}</div>
              <div class="boost-activate-desc">${owned ? (isActive ? '✓ Показывается в чате и профиле' : 'Куплено, выключено') : `${b.points} 🟡 — пока не куплено`}</div>
            </div>
            ${owned
              ? `<button class="boost-activate-toggle ${isActive ? '' : 'off'}" onclick="toggleBadge('${b.id}')">${isActive ? '✓ ВКЛ' : 'Включить'}</button>`
              : `<button class="boost-activate-toggle off" onclick="buyCosmetic('${b.id}')">Купить (${b.points} 🟡)</button>`}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ЭФФЕКТЫ НИКА -->
    <div class="panel">
      <div class="panel-title">✨ Эффекты никнейма</div>
      <div style="font-size:12px;color:#8b95a8;margin-bottom:8px;">Покажите свой стиль — эффекты видны в чате и профиле</div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${nickEffects.map(ne => {
          const owned = userCosmetics.includes(ne.id);
          const isActive = state.activeNickEffect === ne.id;
          return `<div class="boost-activate-card ${isActive ? 'activated' : ''}">
            <div class="boost-activate-icon">${ne.icon}</div>
            <div class="boost-activate-info">
              <div class="boost-activate-title">${ne.name}</div>
              <div class="boost-activate-desc">${owned ? (isActive ? '✓ Сейчас активен' : 'Куплено, можно включить') : `${ne.points} 🟡 — пока не куплено`}</div>
            </div>
            ${owned
              ? `<button class="boost-activate-toggle ${isActive ? '' : 'off'}" onclick="toggleNickEffect('${ne.id}')">${isActive ? '✓ ВКЛ' : 'Включить'}</button>`
              : `<button class="boost-activate-toggle off" onclick="buyCosmetic('${ne.id}')">Купить (${ne.points} 🟡)</button>`}
          </div>`;
        }).join('')}

        <div class="boost-activate-card ${state.activeNickEffect === null ? 'activated' : ''}">
          <div class="boost-activate-icon">👤</div>
          <div class="boost-activate-info">
            <div class="boost-activate-title">Обычный ник</div>
            <div class="boost-activate-desc">Стандартный ник без эффектов</div>
          </div>
          <button class="boost-activate-toggle ${state.activeNickEffect === null ? '' : 'off'}" onclick="toggleNickEffect(null)">${state.activeNickEffect === null ? '✓ ВКЛ' : 'Включить'}</button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
//  ФУНКЦИИ ПРИМЕНЕНИЯ
// ============================================================
function setAvatar(id) {
  state.avatar = id;
  toast('✅ Аватар изменён', '#10b981');
  renderPage('profile');
  saveState();
}

function setFrame(id) {
  state.frame = id;
  toast('✅ Рамка изменена', '#10b981');
  renderPage('profile');
  saveState();
}

function toggleNickEffect(effectId) {
  if (state.activeNickEffect === effectId) {
    state.activeNickEffect = null;
    toast('⭐ Обычный ник', '#8b95a8');
  } else {
    state.activeNickEffect = effectId;
    toast('✨ Эффект ника применён', '#10b981');
  }
  renderPage('profile');
  saveState();
}

// ============================================================
//  ЗНАЧКИ — вкл/выкл
// ============================================================
function toggleBadge(badgeId) {
  if (!state.activeBadges) state.activeBadges = {};
  state.activeBadges[badgeId] = !state.activeBadges[badgeId];
  const isOn = state.activeBadges[badgeId];
  toast(isOn ? `🏅 Значок включён` : `⏸️ Значок выключен`, isOn ? '#10b981' : '#8b95a8');
  renderPage('profile');
  saveState();
}

// ============================================================
//  ПОКУПКА ИЗ ПРОФИЛЯ
// ============================================================
function buyAvatar(id) {
  const cost = 30;
  if ((state.fantasyPoints || 0) < cost) {
    toast(`❌ Нужно ${cost} 🟡 для покупки аватара`, '#ef4444');
    return;
  }
  state.fantasyPoints -= cost;
  state.cosmetics = state.cosmetics || [];
  state.cosmetics.push('av_' + id);
  toast('✅ Аватар куплен!', '#10b981');
  updateHeader();
  renderPage('profile');
  saveState();
}

function buyFrameFromProfile(id) {
  const f = FRAMES.find(x => x.id === id);
  if (!f) return;
  if ((state.fantasyPoints || 0) < f.cost) {
    toast(`❌ Нужно ${f.cost} 🟡 для покупки рамки`, '#ef4444');
    return;
  }
  state.fantasyPoints -= f.cost;
  state.cosmetics = state.cosmetics || [];
  state.cosmetics.push('frame_' + id);
  toast(`✅ Рамка «${f.name}» куплена!`, '#10b981');
  updateHeader();
  renderPage('profile');
  saveState();
}