// ============================================================
//  АДМИНКА — v12.2
// ============================================================

// ============================================================
//  ГЛАВНАЯ СТРАНИЦА АДМИНКИ (табы)
// ============================================================
function renderAdminPage() {
  if (!isAdmin()) {
    return `<div class="panel"><div class="empty"><div class="empty-icon">🚫</div><div class="empty-title">Доступ запрещён</div></div></div>`;
  }

  const tabs = [
    { id: 'withdrawals', name: '💳 Выводы' },
    { id: 'matches', name: '⚽ Матчи' },
    { id: 'leagues', name: '🏆 Лиги' },
    { id: 'accruals', name: '🎁 Начисления' },
    { id: 'players', name: '👥 Игроки' },
    { id: 'content', name: '💬 Контент' },
  ];

  let html = `<div class="admin-tabs">${tabs.map(t => `<div class="admin-tab ${adminTab === t.id ? 'active' : ''}" onclick="switchAdminTab('${t.id}')">${t.name}</div>`).join('')}</div>`;

  switch (adminTab) {
    case 'withdrawals': html += renderAdminWithdrawals(); break;
    case 'matches': html += renderAdminMatches(); break;
    case 'leagues': html += renderAdminLeagues(); break;
    case 'accruals': html += renderAdminAccruals(); break;
    case 'players': html += renderAdminPlayers(); break;
    case 'content': html += renderAdminContent(); break;
  }
  return html;
}

function switchAdminTab(tab) {
  adminTab = tab;
  renderPage('admin');
}

// ============================================================
//  ВКЛАДКА «ВЫВОДЫ» — очередь заявок
// ============================================================
function renderAdminWithdrawals() {
  const users = loadUsers();
  const pending = [];
  const paid = [];
  const rejected = [];

  for (const [name, u] of Object.entries(users)) {
    (u.withdrawals || []).forEach(w => {
      const item = { ...w, player: name };
      if (w.status === 'pending') pending.push(item);
      else if (w.status === 'paid') paid.push(item);
      else rejected.push(item);
    });
  }

  pending.sort((a, b) => a.createdAt - b.createdAt);
  paid.sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));

  const totalPending = pending.reduce((s, w) => s + w.amount, 0);
  const totalPaid = paid.reduce((s, w) => s + w.amount, 0);

  let html = `<div class="panel">
    <div class="panel-title">💳 Очередь выводов</div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;">
      <div style="background:#0f1420;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#8b95a8;">Ожидают</div>
        <div style="font-size:20px;font-weight:800;color:#f59e0b;">${pending.length}</div>
      </div>
      <div style="background:#0f1420;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#8b95a8;">Сумма</div>
        <div style="font-size:20px;font-weight:800;color:#f59e0b;">${fmt(totalPending)} ₽</div>
      </div>
      <div style="background:#0f1420;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#8b95a8;">Выплачено</div>
        <div style="font-size:20px;font-weight:800;color:#10b981;">${paid.length}</div>
      </div>
      <div style="background:#0f1420;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#8b95a8;">Сумма</div>
        <div style="font-size:20px;font-weight:800;color:#10b981;">${fmt(totalPaid)} ₽</div>
      </div>
    </div>`;

  if (pending.length === 0) {
    html += `<div style="text-align:center;padding:20px;color:#8b95a8;">Нет активных заявок ✅</div>`;
  } else {
    html += `<div style="font-size:13px;font-weight:700;margin-bottom:10px;color:#f59e0b;">⏳ Ожидают обработки (${pending.length})</div>`;
    pending.forEach(w => {
      const age = now() - w.createdAt;
      const bonus = calcWithdrawBonus(w);
      const overdue = age > WITHDRAW_STANDARD_HOURS * 3600000;

      html += `<div style="background:#0f1420;border:2px solid ${overdue ? '#ef4444' : '#00d4ff'};border-radius:14px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <div>
            <div style="font-weight:800;font-size:15px;">💰 Заявка №${w.number} · ${w.player}</div>
            <div style="font-size:12px;color:#8b95a8;margin-top:4px;">${w.method}</div>
            <div style="font-size:12px;color:#00d4ff;margin-top:4px;">📱 ${w.requisitesDisplay || w.requisites}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px;font-weight:900;color:#10b981;">${fmt(w.amount)} ₽</div>
            ${bonus > 0 ? `<div style="font-size:12px;color:#f59e0b;">Бонус за задержку: +${fmt(bonus)} ₽</div>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:10px;font-size:12px;color:#8b95a8;margin-bottom:10px;flex-wrap:wrap;">
          <span>🕒 ${new Date(w.createdAt).toLocaleString('ru-RU')}</span>
          <span>⏱️ <span data-withdraw-timer="${w.id}">${formatTimeSince(age)}</span></span>
          ${overdue ? `<span style="color:#ef4444;">⚠️ ПРОСРОЧКА</span>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-success" style="padding:8px 14px;font-size:12px;min-height:38px;" onclick="adminPayWithdrawal('${w.player}', '${w.id}')">✅ Выплачено</button>
          <button class="btn btn-danger" style="padding:8px 14px;font-size:12px;min-height:38px;" onclick="adminRejectWithdrawal('${w.player}', '${w.id}')">❌ Отклонить</button>
          <button class="btn btn-ghost" style="padding:8px 14px;font-size:12px;min-height:38px;" onclick="navigator.clipboard.writeText('${(w.requisites || '').replace(/'/g, "\\'")}'); toast('📋 Скопировано в буфер', '#10b981');">📋 Скопировать реквизиты</button>
        </div>
      </div>`;
    });
  }

  html += `</div>`;

  // История
  if (paid.length > 0 || rejected.length > 0) {
    html += `<div class="panel"><div class="panel-title">📜 История обработанных заявок</div>`;
    [...paid.slice(0, 20), ...rejected.slice(0, 10)].forEach(w => {
      const status = getWithdrawStatus(w);
      html += `<div style="background:#0f1420;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12px;">
        <div>
          <strong>${w.player}</strong> · ${fmt(w.amount)} ₽${w.bonus ? ' (+' + w.bonus + ' ₽ бонус)' : ''} · ${w.method}
          ${w.status === 'rejected' && w.rejectedReason ? `<br><span style="color:#ff8888;">Причина: ${w.rejectedReason}</span>` : ''}
        </div>
        <div style="color:${status.color};font-weight:700;">${status.label}</div>
      </div>`;
    });
    html += `</div>`;
  }

  return html;
}
// ============================================================
//  ВЫПЛАТА ЗАЯВКИ + ЭКРАН СО СКРИНШОТОМ
// ============================================================
function adminPayWithdrawal(playerName, withdrawalId) {
  const users = loadUsers();
  const u = users[playerName];
  if (!u || !u.withdrawals) return;

  const w = u.withdrawals.find(x => x.id === withdrawalId);
  if (!w || w.status !== 'pending') return;

  const bonus = calcWithdrawBonus(w);
  w.bonus = bonus;
  w.status = 'paid';
  w.paidAt = now();

  // Начисляем бонус игроку, если админ задержал
  if (bonus > 0) u.rubles = (u.rubles || 0) + bonus;

  // Уведомление игроку
  if (!u.notifications) u.notifications = [];
  u.notifications.push({
    id: 'n_' + now(),
    type: 'withdraw_paid',
    title: '✅ Вывод выплачен!',
    text: `Сумма: ${fmt(w.amount)} ₽${bonus > 0 ? ` + бонус за задержку ${fmt(bonus)} ₽` : ''}`,
    reason: null,
    createdAt: now(),
    seen: false
  });

  localStorage.setItem('fs2_users', JSON.stringify(users));

  // Синхронизация state админа
  if (currentUser === ADMIN_USER) state = users[ADMIN_USER] || state;

  toast(`✅ Выплачено ${fmt(w.amount)} ₽ игроку ${playerName}`, '#10b981');

  // Экран с предложением прикрепить скриншот
  document.getElementById('modal').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:64px;margin-bottom:14px;">✅</div>
      <div style="font-size:20px;font-weight:800;color:#10b981;margin-bottom:12px;">Выплата отмечена!</div>

      <div style="background:#0f1420;border-radius:12px;padding:16px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;">
          <span style="color:#8b95a8;">Игрок:</span><strong>${playerName}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;">
          <span style="color:#8b95a8;">Сумма:</span><strong>${fmt(w.amount)} ₽</strong>
        </div>
        ${bonus > 0 ? `
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;">
            <span style="color:#8b95a8;">Бонус за задержку:</span><strong style="color:#10b981;">+${fmt(bonus)} ₽</strong>
          </div>
        ` : ''}
      </div>

      <div style="background:rgba(0,212,255,0.08);border:1px solid #00d4ff;border-radius:12px;padding:14px;margin-bottom:16px;text-align:left;">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px;">📸 Прикрепить скриншот перевода?</div>
        <div style="font-size:11px;color:#8b95a8;margin-bottom:10px;">Скриншот попадёт в раздел «Отзывы → Реальные выплаты». Это показывает другим игрокам, что проект платит.</div>

        <label class="screenshot-upload-btn" for="screenshot-file">📁 Загрузить файл с компьютера</label>
        <input type="file" id="screenshot-file" accept="image/*" style="display:none;" onchange="handleScreenshotFile(event)">

        <div style="display:flex;align-items:center;gap:10px;margin:12px 0;color:#5a6478;font-size:11px;">
          <div style="flex:1;height:1px;background:#1f2942;"></div>
          <span>ИЛИ ВСТАВЬТЕ ССЫЛКУ</span>
          <div style="flex:1;height:1px;background:#1f2942;"></div>
        </div>

        <input type="text" id="withdraw-screenshot" placeholder="https://i.imgur.com/..." style="width:100%;background:#0a0e1a;border:1px solid #1f2942;border-radius:8px;padding:10px;color:#e6edf7;font-size:13px;font-family:inherit;outline:none;" oninput="previewScreenshot(this.value)">
        <div style="font-size:10px;color:#5a6478;margin-top:6px;">⚠️ Яндекс.Диск, VK, Google Photos не поддерживаются</div>

        <div class="screenshot-preview" id="screenshot-preview">
          <img id="screenshot-preview-img" src="" alt="" onerror="screenshotPreviewError()">
        </div>
        <div class="screenshot-error" id="screenshot-error"></div>
      </div>

      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" style="flex:1;" onclick="attachScreenshot('${playerName}', '${withdrawalId}')">📸 Опубликовать</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="closeModal(); renderPage('admin');">Без скриншота</button>
      </div>
    </div>`;

  document.getElementById('modal-bg').classList.add('show');
  window._screenshotData = null;
}

// ============================================================
//  ЗАГРУЗКА СКРИНШОТА — файл
// ============================================================
function handleScreenshotFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast('⚠️ Максимум 2 МБ', '#ef4444'); return; }
  if (!file.type.startsWith('image/')) { toast('⚠️ Только изображения', '#ef4444'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    window._screenshotData = e.target.result;
    const prev = document.getElementById('screenshot-preview');
    const img = document.getElementById('screenshot-preview-img');
    const err = document.getElementById('screenshot-error');
    const urlInput = document.getElementById('withdraw-screenshot');
    if (urlInput) urlInput.value = '';
    img.src = e.target.result;
    prev.classList.add('show');
    err.classList.remove('show');
    toast('✅ Файл загружен', '#10b981');
  };
  reader.readAsDataURL(file);
}

// ============================================================
//  ПРЕВЬЮ СКРИНШОТА ПО ССЫЛКЕ
// ============================================================
function previewScreenshot(url) {
  const prev = document.getElementById('screenshot-preview');
  const img = document.getElementById('screenshot-preview-img');
  const err = document.getElementById('screenshot-error');

  if (!url || !url.startsWith('http')) {
    prev.classList.remove('show');
    err.classList.remove('show');
    window._screenshotData = null;
    return;
  }

  const blocked = ['yandex.net', 'yandex.ru', 'vk.com', 'userapi.com', 'googleusercontent.com', 'disk.yandex'];
  const isBlocked = blocked.some(d => url.includes(d));
  if (isBlocked) {
    prev.classList.remove('show');
    err.innerHTML = '❌ <strong>Этот сервис блокирует встраивание изображений.</strong><br>Используйте imgur.com или загрузите файл с компьютера.';
    err.classList.add('show');
    window._screenshotData = null;
    return;
  }

  img.src = url;
  prev.classList.add('show');
  err.classList.remove('show');
  window._screenshotData = url;
}

function screenshotPreviewError() {
  const prev = document.getElementById('screenshot-preview');
  const err = document.getElementById('screenshot-error');
  prev.classList.remove('show');
  err.innerHTML = '❌ <strong>Не удалось загрузить изображение.</strong><br>Проверьте ссылку или загрузите файл.';
  err.classList.add('show');
  window._screenshotData = null;
}

// ============================================================
//  ПРИКРЕПЛЕНИЕ СКРИНШОТА К ВЫПЛАТЕ
// ============================================================
function attachScreenshot(playerName, withdrawalId) {
  const url = document.getElementById('withdraw-screenshot')?.value.trim();
  const data = window._screenshotData;
  const screenshot = data || url;

  if (!screenshot) {
    toast('⚠️ Прикрепите скриншот или закройте окно', '#ef4444');
    return;
  }

  const users = loadUsers();
  const u = users[playerName];
  if (!u || !u.withdrawals) return;

  const w = u.withdrawals.find(x => x.id === withdrawalId);
  if (!w) return;

  w.screenshot = screenshot;
  localStorage.setItem('fs2_users', JSON.stringify(users));

  toast('📸 Скриншот опубликован в «Отзывы → Реальные выплаты»', '#10b981');
  window._screenshotData = null;
  closeModal();
  renderPage('admin');
}

// ============================================================
//  ОТКЛОНЕНИЕ ЗАЯВКИ
// ============================================================
function adminRejectWithdrawal(playerName, withdrawalId) {
  document.getElementById('modal').innerHTML = `
    <h2 style="color:#ef4444;">❌ Отклонение заявки</h2>

    <div style="background:#0f1420;border-radius:12px;padding:14px;margin-bottom:16px;">
      <div style="font-size:13px;padding:4px 0;"><span style="color:#8b95a8;">Игрок:</span> <strong>${playerName}</strong></div>
      <div style="font-size:13px;padding:4px 0;"><span style="color:#8b95a8;">Заявка:</span> <strong>№${withdrawalId.slice(-5)}</strong></div>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <label>Готовая причина</label>
      <select id="reject-reason-preset" onchange="onRejectReasonChange()">
        <option value="">— Выберите или напишите свою —</option>
        <option value="Неверные реквизиты. Проверьте номер и попробуйте снова.">Неверные реквизиты</option>
        <option value="Подозрительная активность. Обратитесь в поддержку.">Подозрительная активность</option>
        <option value="Мультиаккаунт. Нарушение правил проекта.">Мультиаккаунт</option>
        <option value="Обнаружено использование ботов/скриптов.">Использование ботов</option>
        <option value="Нарушение правил проекта. Обратитесь в поддержку.">Нарушение правил</option>
      </select>
    </div>

    <div class="form-group" style="margin-bottom:16px;">
      <label>Точный текст, который увидит игрок</label>
      <textarea id="reject-reason" placeholder="Опишите причину подробно..."></textarea>
    </div>

    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:12px;font-size:12px;color:#ff8888;margin-bottom:16px;">
      💰 Средства будут возвращены на баланс игрока + бонус за ожидание (если был).
    </div>

    <div style="display:flex;gap:8px;">
      <button class="btn btn-danger" style="flex:1;" onclick="confirmRejectWithdrawal('${playerName}', '${withdrawalId}')">❌ Отклонить</button>
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Отмена</button>
    </div>`;
  document.getElementById('modal-bg').classList.add('show');
}

function onRejectReasonChange() {
  const preset = document.getElementById('reject-reason-preset').value;
  if (preset) document.getElementById('reject-reason').value = preset;
}

function confirmRejectWithdrawal(playerName, withdrawalId) {
  const reason = document.getElementById('reject-reason').value.trim();
  if (!reason || reason.length < 5) {
    toast('⚠️ Введите причину (минимум 5 символов)', '#ef4444');
    return;
  }

  const users = loadUsers();
  const u = users[playerName];
  if (!u || !u.withdrawals) return;

  const w = u.withdrawals.find(x => x.id === withdrawalId);
  if (!w || w.status !== 'pending') return;

  w.status = 'rejected';
  w.rejectedAt = now();
  w.rejectedReason = reason;

  const bonus = calcWithdrawBonus(w);
  u.rubles = (u.rubles || 0) + w.amount + bonus;

  if (!u.notifications) u.notifications = [];
  u.notifications.push({
    id: 'n_' + now(),
    type: 'withdraw_rejected',
    title: '❌ Вывод отклонён',
    text: `Заявка на ${fmt(w.amount)} ₽ отклонена. Средства возвращены на баланс.`,
    reason: reason,
    createdAt: now(),
    seen: false
  });

  localStorage.setItem('fs2_users', JSON.stringify(users));
  if (currentUser === ADMIN_USER) state = users[ADMIN_USER] || state;

  toast(`❌ Заявка ${playerName} отклонена`, '#f59e0b');
  closeModal();
  renderPage('admin');
}

// ============================================================
//  ВКЛАДКА «МАТЧИ»
// ============================================================
function renderAdminMatches() {
  let html = `<div class="panel">
    <div class="panel-title">➕ Добавить матч</div>

    <div class="form-row">
      <div class="form-group"><label>Команда A</label><input type="text" id="new-teamA" placeholder="Falcons"></div>
      <div class="form-group"><label>Команда B</label><input type="text" id="new-teamB" placeholder="Vitality"></div>
    </div>

    <div class="form-row">
      <div class="form-group"><label>Дата и время</label><input type="datetime-local" id="new-date"></div>
      <div class="form-group"><label>Формат</label>
        <select id="new-bestof">
          <option value="1">BO1</option>
          <option value="3" selected>BO3</option>
          <option value="5">BO5</option>
        </select>
      </div>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <label>Игроки (через запятую)</label>
      <input type="text" id="new-players" placeholder="donk, sh1ro, m0NESY">
    </div>

    <div class="form-row">
      <div class="form-group"><label>Линия для kills</label><input type="number" id="new-playerline" value="50"></div>
      <div class="form-group"><label>Тотал матча</label><input type="number" id="new-totalline" value="200"></div>
    </div>

    <div class="form-row">
      <div class="form-group"><label>Ссылка Twitch</label><input type="text" id="new-twitch" placeholder="https://twitch.tv/..."></div>
      <div class="form-group"><label>Ссылка Kick</label><input type="text" id="new-kick" placeholder="https://kick.com/..."></div>
    </div>

    <button class="btn btn-primary" style="width:100%;" onclick="addMatch()">➕ Добавить матч</button>
  </div>

  <div class="panel">
    <div class="panel-title">📋 Существующие матчи (${matches.length})</div>`;

  matches.forEach(m => {
    const icon = m.status === 'finished' ? '✅' : m.status === 'live' ? '🔴' : '⏳';
    html += `<div style="background:#0f1420;border:1px solid #1f2942;border-radius:12px;padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <div>
          <div style="font-weight:700;">${icon} ${m.teamA} vs ${m.teamB}</div>
          <div style="font-size:11px;color:#8b95a8;margin-top:2px;">${m.date} · ${m.status}</div>
          ${m.twitch ? `<div style="font-size:11px;color:#9146ff;margin-top:2px;">🎥 ${m.twitch}</div>` : ''}
          ${m.kick ? `<div style="font-size:11px;color:#53fc18;margin-top:2px;">🎥 ${m.kick}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${m.status !== 'live' && m.status !== 'finished' ? `<button class="btn btn-ghost" style="padding:6px 10px;font-size:11px;min-height:36px;" onclick="setMatchStatus('${m.id}','live')">🔴 В эфир</button>` : ''}
          ${m.status !== 'finished' ? `<button class="btn btn-ghost" style="padding:6px 10px;font-size:11px;min-height:36px;" onclick="editStreamLinks('${m.id}')">🎥 Ссылки</button>` : ''}
          ${m.status !== 'finished' ? `<button class="btn btn-gold" style="padding:6px 10px;font-size:11px;min-height:36px;" onclick="openFinishForm('${m.id}')">📝 Результат</button>` : ''}
          <button class="btn btn-danger" style="padding:6px 10px;font-size:11px;min-height:36px;" onclick="deleteMatch('${m.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
  });

  html += `</div>`;
  return html;
}
// ============================================================
//  ВКЛАДКА «ЛИГИ»
// ============================================================
function renderAdminLeagues() {
  // Страховка от пустого leagueSettings
  if (!leagueSettings || !leagueSettings.daily || !leagueSettings.weekly || !leagueSettings.monthly) {
    leagueSettings = loadLeagueSettings();
  }

  let html = `<div class="panel"><div class="panel-title">🏆 Управление лигами</div>`;

  ['daily', 'weekly', 'monthly'].forEach(type => {
    const s = leagueSettings[type];
    const names = { daily: '📅 Ежедневная', weekly: '📆 Недельная', monthly: '🗓️ Месячная' };
    const ends = s.startTime + s.durationDays * 24 * 3600 * 1000;
    const isActive = ends > now();

    html += `<div style="background:#0f1420;border:1px solid ${isActive ? '#10b981' : '#8b95a8'};border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <div style="font-weight:800;font-size:15px;">${names[type]}</div>
        <div style="font-size:12px;color:${isActive ? '#10b981' : '#8b95a8'};font-weight:700;">
          ${isActive ? '● АКТИВНА' : '○ ЗАВЕРШЕНА'}
        </div>
      </div>

      <div style="font-size:12px;color:#8b95a8;margin-bottom:10px;">
        ${isActive ? `До конца: <strong style="color:#ffd700;">${formatTimer(ends - now())}</strong>` : 'Завершена'}
      </div>

      <div class="form-row">
        <div class="form-group"><label>Дней</label><input type="number" id="lg-${type}-days" value="${s.durationDays}" min="1"></div>
        <div class="form-group"><label>1 место, ₽</label><input type="number" id="lg-${type}-p1" value="${s.prizes[0]}"></div>
      </div>

      <div class="form-row">
        <div class="form-group"><label>2 место, ₽</label><input type="number" id="lg-${type}-p2" value="${s.prizes[1]}"></div>
        <div class="form-group"><label>3 место, ₽</label><input type="number" id="lg-${type}-p3" value="${s.prizes[2]}"></div>
      </div>

      <button class="btn btn-primary" style="width:100%;margin-bottom:8px;" onclick="startLeague('${type}')">
        ${isActive ? '🔄 Перезапустить лигу' : '▶️ Запустить лигу'}
      </button>

      ${isActive ? `<button class="btn btn-danger" style="width:100%;" onclick="stopLeague('${type}')">⏹️ Остановить</button>` : ''}
    </div>`;
  });

  html += `</div>`;

  // Спец-лиги
  html += `<div class="panel">
    <div class="panel-title">🏆 Специальные лиги (турниры)</div>

    <div class="form-row">
      <div class="form-group"><label>Название</label><input type="text" id="sl-name" placeholder="Major Paris 2026"></div>
      <div class="form-group"><label>Длительность, дней</label><input type="number" id="sl-days" value="30"></div>
    </div>

    <div class="form-row">
      <div class="form-group"><label>1 место, ₽</label><input type="number" id="sl-p1" value="10000"></div>
      <div class="form-group"><label>2 место, ₽</label><input type="number" id="sl-p2" value="5000"></div>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <label>3 место, ₽</label><input type="number" id="sl-p3" value="2500">
    </div>

    <button class="btn btn-primary" style="width:100%;" onclick="createSpecialLeague()">🏆 Создать спец-лигу</button>
  </div>`;

  if ((leagueSettings.special || []).length > 0) {
    html += `<div class="panel"><div class="panel-title">📋 Активные спец-лиги (${leagueSettings.special.length})</div>`;
    leagueSettings.special.forEach(sl => {
      const active = sl.endTime > now();
      html += `<div style="background:#0f1420;border:1px solid #ff0080;border-radius:12px;padding:14px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-weight:700;">🏆 ${sl.name}</div>
            <div style="font-size:11px;color:#8b95a8;margin-top:2px;">
              ${active ? formatTimer(sl.endTime - now()) : 'Завершена'}
            </div>
          </div>
          <button class="btn btn-danger" style="padding:6px 10px;font-size:11px;min-height:36px;" onclick="deleteSpecialLeague('${sl.id}')">🗑️ Удалить</button>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  return html;
}

// ============================================================
//  ВКЛАДКА «НАЧИСЛЕНИЯ» — с ФИКСОМ для админа
// ============================================================
function renderAdminAccruals() {
  const users = loadUsers();
  const players = Object.keys(users).filter(n => n !== ADMIN_USER);

  return `<div class="panel">
    <div class="panel-title">🎁 Начисления очков/рублей/кейсов</div>

    <div style="background:#0f1420;border-radius:14px;padding:16px;margin-bottom:14px;">
      <div class="form-row">
        <div class="form-group">
          <label>Кому начислить</label>
          <select id="accrual-target">
            <option value="${ADMIN_USER}">👑 Себе (админу)</option>
            <option value="__all__">👥 Всем игрокам</option>
            ${players.map(p => `<option value="${p}">${p}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Что начислить</label>
          <select id="accrual-type">
            <option value="points">🟡 Очки</option>
            <option value="rubles">💰 Рубли</option>
            <option value="case_small">📦 Малый кейс</option>
            <option value="case_medium">💎 Средний кейс</option>
            <option value="case_large">👑 Большой кейс</option>
            <option value="booster10">🎯 Бустер +10%</option>
            <option value="booster20">🎯 Бустер +20%</option>
            <option value="booster30">🎯 Бустер +30%</option>
            <option value="insurance">🛡️ Страховка</option>
            <option value="vip">⭐ VIP-значок</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:12px;">
        <label>Количество</label>
        <input type="number" id="accrual-amount" value="1000" min="1">
      </div>

      <button class="btn btn-primary" style="width:100%;" onclick="adminAccrue()">🎁 Начислить</button>
    </div>

    <div style="background:#0f1420;border-radius:14px;padding:16px;">
      <div style="font-weight:700;margin-bottom:12px;">⚡ Быстрые начисления (себе)</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">
        <button class="btn btn-ghost" style="font-size:11px;padding:10px;min-height:44px;" onclick="quickAccrual('points', 1000)">🟡 1 000 очков</button>
        <button class="btn btn-ghost" style="font-size:11px;padding:10px;min-height:44px;" onclick="quickAccrual('points', 10000)">🟡 10 000 очков</button>
        <button class="btn btn-ghost" style="font-size:11px;padding:10px;min-height:44px;" onclick="quickAccrual('points', 100000)">🟡 100 000 очков</button>
        <button class="btn btn-ghost" style="font-size:11px;padding:10px;min-height:44px;" onclick="quickAccrual('rubles', 1000)">💰 1 000 ₽</button>
        <button class="btn btn-ghost" style="font-size:11px;padding:10px;min-height:44px;" onclick="quickAccrual('rubles', 10000)">💰 10 000 ₽</button>
        <button class="btn btn-ghost" style="font-size:11px;padding:10px;min-height:44px;" onclick="quickAccrual('case_large', 1)">👑 Большой кейс</button>
      </div>
    </div>
  </div>`;
}

// ============================================================
//  ✅ ФУНКЦИЯ НАЧИСЛЕНИЯ — ИСПРАВЛЕНА ДЛЯ РАБОТЫ С АДМИНОМ
// ============================================================
function adminAccrue() {
  const target = document.getElementById('accrual-target').value;
  const type = document.getElementById('accrual-type').value;
  const amount = parseInt(document.getElementById('accrual-amount').value) || 1;
  const users = loadUsers();

  // ГЛАВНОЕ: гарантируем, что state админа есть в users
  if (currentUser === ADMIN_USER && !users[ADMIN_USER]) {
    users[ADMIN_USER] = state;
  }

  const targets = target === '__all__'
    ? Object.keys(users).filter(n => n !== ADMIN_USER)
    : [target];

  targets.forEach(name => {
    const u = (name === ADMIN_USER) ? (users[ADMIN_USER] || state) : users[name];
    if (!u) return;

    switch (type) {
      case 'points':
        u.fantasyPoints = (u.fantasyPoints || 0) + amount;
        break;
      case 'rubles':
        u.rubles = (u.rubles || 0) + amount;
        break;
      case 'case_small':
        u.bonuses = u.bonuses || {};
        u.bonuses.pendingCases = u.bonuses.pendingCases || [];
        for (let i = 0; i < amount; i++) u.bonuses.pendingCases.push('small');
        break;
      case 'case_medium':
        u.bonuses = u.bonuses || {};
        u.bonuses.pendingCases = u.bonuses.pendingCases || [];
        for (let i = 0; i < amount; i++) u.bonuses.pendingCases.push('medium');
        break;
      case 'case_large':
        u.bonuses = u.bonuses || {};
        u.bonuses.pendingCases = u.bonuses.pendingCases || [];
        for (let i = 0; i < amount; i++) u.bonuses.pendingCases.push('large');
        break;
      case 'booster10':
        u.bonuses = u.bonuses || {};
        u.bonuses.boosters = u.bonuses.boosters || [];
        for (let i = 0; i < amount; i++) u.bonuses.boosters.push({ value: 10, usedOn: null, activated: false });
        break;
      case 'booster20':
        u.bonuses = u.bonuses || {};
        u.bonuses.boosters = u.bonuses.boosters || [];
        for (let i = 0; i < amount; i++) u.bonuses.boosters.push({ value: 20, usedOn: null, activated: false });
        break;
      case 'booster30':
        u.bonuses = u.bonuses || {};
        u.bonuses.boosters = u.bonuses.boosters || [];
        for (let i = 0; i < amount; i++) u.bonuses.boosters.push({ value: 30, usedOn: null, activated: false });
        break;
      case 'insurance':
        u.bonuses = u.bonuses || {};
        u.bonuses.insurance = u.bonuses.insurance || [];
        for (let i = 0; i < amount; i++) u.bonuses.insurance.push({ type: 'regular', usedOn: null, activated: false });
        break;
      case 'vip':
        u.cosmetics = u.cosmetics || [];
        if (!u.cosmetics.includes('vip')) u.cosmetics.push('vip');
        break;
    }
  });

  // Синхронизация state админа
  if (currentUser === ADMIN_USER) {
    state = users[ADMIN_USER];
  }

  localStorage.setItem('fs2_users', JSON.stringify(users));
  toast(`✅ Начислено: ${type} × ${amount}`, '#10b981');
  updateHeader();
  renderPage('admin');
}

function quickAccrual(type, amount) {
  document.getElementById('accrual-target').value = ADMIN_USER;
  document.getElementById('accrual-type').value = type;
  document.getElementById('accrual-amount').value = amount;
  adminAccrue();
}

// ============================================================
//  ВКЛАДКА «ИГРОКИ»
// ============================================================
function renderAdminPlayers() {
  const users = loadUsers();
  const list = Object.entries(users).filter(([n]) => n !== ADMIN_USER);

  let html = `<div class="panel"><div class="panel-title"><span>👥 Игроки (${list.length})</span></div>`;

  if (list.length === 0) {
    html += `<div class="empty"><div class="empty-icon">👥</div><div class="empty-title">Пока никого</div></div>`;
  } else {
    list.forEach(([name, u]) => {
      const rank = getEloRank(u.elo || ELO_START);
      const banned = u.banned;
      html += `<div style="background:#0f1420;border:1px solid ${banned ? '#ef4444' : '#1f2942'};border-radius:12px;padding:14px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <div>
            <div style="font-weight:800;font-size:15px;">${name} ${banned ? '🚫 (забанен)' : ''}</div>
            <div style="font-size:11px;color:#8b95a8;margin-top:4px;">
              Регистрация: ${new Date(u.createdAt || 0).toLocaleDateString('ru-RU')}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="color:${rank.color};font-weight:800;">${rank.icon} ${u.elo || ELO_START} ELO</div>
            <div style="font-size:12px;color:#ffd700;">🟡 ${fmt(u.fantasyPoints || 0)}</div>
            <div style="font-size:12px;color:#10b981;">💰 ${fmt(u.rubles || 0)} ₽</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${banned
            ? `<button class="btn btn-success" style="padding:6px 12px;font-size:11px;min-height:36px;" onclick="toggleBan('${name}')">✅ Разбанить</button>`
            : `<button class="btn btn-danger" style="padding:6px 12px;font-size:11px;min-height:36px;" onclick="toggleBan('${name}')">🚫 Забанить</button>`}
        </div>
      </div>`;
    });
  }

  html += `</div>`;
  return html;
}

function toggleBan(name) {
  const users = loadUsers();
  if (!users[name]) return;
  users[name].banned = !users[name].banned;
  localStorage.setItem('fs2_users', JSON.stringify(users));
  toast(users[name].banned ? `🚫 ${name} забанен` : `✅ ${name} разбанен`, users[name].banned ? '#ef4444' : '#10b981');
  renderPage('admin');
}

// ============================================================
//  ВКЛАДКА «КОНТЕНТ» — закреплённые отзывы + статистика
// ============================================================
function renderAdminContent() {
  const users = loadUsers();
  const stats = { totalWithdrawn: 0, totalCount: 0 };

  for (const [name, u] of Object.entries(users)) {
    (u.withdrawals || []).forEach(w => {
      if (w.status === 'paid') {
        stats.totalWithdrawn += w.amount;
        stats.totalCount++;
      }
    });
  }

  return `<div class="panel">
    <div class="panel-title">💬 Управление контентом</div>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-gold" onclick="openReviewModal(true)">📝 Создать статью</button>
    </div>

    <div style="font-weight:700;margin-bottom:12px;">📌 Закреплённые отзывы:</div>
    ${reviews.filter(r => r.pinned).map(r => `
      <div style="background:#0f1420;border:1px solid #ffd700;border-radius:10px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span><strong>${r.author}</strong> · ${new Date(r.createdAt).toLocaleDateString('ru-RU')}</span>
          <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;min-height:30px;" onclick="togglePinReview('${r.id}')">📍 Открепить</button>
        </div>
        <div style="font-size:12px;color:#8b95a8;margin-top:6px;">${r.text.substring(0, 100)}${r.text.length > 100 ? '...' : ''}</div>
      </div>
    `).join('') || '<div style="color:#8b95a8;font-size:12px;padding:10px;">Нет закреплённых отзывов</div>'}
  </div>

  <div class="panel">
    <div class="panel-title">📊 Публичная статистика проекта</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div style="background:#0f1420;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:11px;color:#8b95a8;">Всего выплачено</div>
        <div style="font-size:22px;font-weight:800;color:#10b981;">${fmt(stats.totalWithdrawn)} ₽</div>
      </div>
      <div style="background:#0f1420;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:11px;color:#8b95a8;">Успешных выплат</div>
        <div style="font-size:22px;font-weight:800;color:#00d4ff;">${stats.totalCount}</div>
      </div>
    </div>
  </div>`;
}

// ============================================================
//  УПРАВЛЕНИЕ МАТЧАМИ
// ============================================================
function addMatch() {
  const teamA = document.getElementById('new-teamA').value.trim();
  const teamB = document.getElementById('new-teamB').value.trim();
  const date = document.getElementById('new-date').value;
  const bestOf = parseInt(document.getElementById('new-bestof').value);
  const playersStr = document.getElementById('new-players').value.trim();
  const playerLine = parseInt(document.getElementById('new-playerline').value) || 50;
  const totalLine = parseInt(document.getElementById('new-totalline').value) || 200;
  const twitch = document.getElementById('new-twitch').value.trim();
  const kick = document.getElementById('new-kick').value.trim();

  if (!teamA || !teamB || !date) {
    toast('⚠️ Заполните команды и дату', '#ef4444');
    return;
  }

  matches.push({
    id: 'm' + now(),
    teamA,
    teamB,
    date: date.replace('T', ' '),
    status: 'upcoming',
    scoreA: null,
    scoreB: null,
    bestOf,
    twitch,
    kick,
    markets: {
      matchWinner: true,
      playerKills: playersStr.split(',').map(p => p.trim()).filter(Boolean).map(p => ({ player: p, line: playerLine })),
      totalKills: { line: totalLine }
    }
  });

  saveMatches();
  toast('✅ Матч добавлен', '#10b981');
  renderPage('admin');
}

function deleteMatch(id) {
  if (!confirm('Удалить матч?')) return;
  matches = matches.filter(m => m.id !== id);
  saveMatches();
  toast('🗑️ Матч удалён', '#f59e0b');
  renderPage('admin');
}

function setMatchStatus(id, status) {
  const m = matches.find(x => x.id === id);
  if (!m) return;
  m.status = status;
  if (status === 'live') {
    m.scoreA = 0;
    m.scoreB = 0;
    m.liveStats = { killsA: 0, killsB: 0, roundTime: 45, currentRound: 1, mapName: 'Mirage' };
  }
  saveMatches();
  toast(`✅ Матч → ${status}`, '#10b981');
  renderPage('admin');
}

function editStreamLinks(matchId) {
  const m = matches.find(x => x.id === matchId);
  if (!m) return;

  document.getElementById('modal').innerHTML = `
    <h2>🎥 Ссылки на трансляцию</h2>
    <div class="form-group" style="margin-bottom:12px;">
      <label>Twitch</label>
      <input type="text" id="edit-twitch" value="${m.twitch || ''}" placeholder="https://twitch.tv/...">
    </div>
    <div class="form-group" style="margin-bottom:12px;">
      <label>Kick</label>
      <input type="text" id="edit-kick" value="${m.kick || ''}" placeholder="https://kick.com/...">
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary" style="flex:1;" onclick="saveStreamLinks('${matchId}')">✅ Сохранить</button>
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Отмена</button>
    </div>`;
  document.getElementById('modal-bg').classList.add('show');
}

function saveStreamLinks(matchId) {
  const m = matches.find(x => x.id === matchId);
  if (!m) return;
  m.twitch = document.getElementById('edit-twitch').value.trim();
  m.kick = document.getElementById('edit-kick').value.trim();
  saveMatches();
  toast('✅ Ссылки сохранены', '#10b981');
  closeModal();
  renderPage('admin');
}

// ============================================================
//  ЗАВЕРШЕНИЕ МАТЧА + ПЕРЕСЧЁТ ПРОГНОЗОВ
// ============================================================
function openFinishForm(matchId) {
  const m = matches.find(x => x.id === matchId);
  if (!m) return;

  let playersHtml = '';
  if (m.markets?.playerKills) {
    playersHtml = m.markets.playerKills.map(pk => `
      <div class="form-group">
        <label>${pk.player} (линия ${pk.line})</label>
        <input type="number" data-player="${pk.player}" class="player-kills-input" placeholder="kills">
      </div>
    `).join('');
  }

  document.getElementById('modal').innerHTML = `
    <h2>📝 Результат матча</h2>
    <div style="font-weight:700;margin-bottom:12px;">${m.teamA} vs ${m.teamB}</div>

    <div class="form-row">
      <div class="form-group"><label>Счёт ${m.teamA}</label><input type="number" id="finish-scoreA" value="0"></div>
      <div class="form-group"><label>Счёт ${m.teamB}</label><input type="number" id="finish-scoreB" value="0"></div>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <label>Победитель</label>
      <select id="finish-winner">
        <option value="${m.teamA}">${m.teamA}</option>
        <option value="${m.teamB}">${m.teamB}</option>
      </select>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <label>Всего kills в матче</label>
      <input type="number" id="finish-totalKills" placeholder="Например, 195">
    </div>

    <div class="form-row">${playersHtml}</div>

    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn btn-success" style="flex:1;" onclick="finishMatch('${matchId}')">✅ Сохранить и рассчитать</button>
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Отмена</button>
    </div>`;
  document.getElementById('modal-bg').classList.add('show');
}

function finishMatch(matchId) {
  const m = matches.find(x => x.id === matchId);
  if (!m) return;

  m.scoreA = parseInt(document.getElementById('finish-scoreA').value);
  m.scoreB = parseInt(document.getElementById('finish-scoreB').value);
  m.status = 'finished';
  m.results = {
    winner: document.getElementById('finish-winner').value,
    totalKills: parseInt(document.getElementById('finish-totalKills').value) || 0,
    playerKills: {}
  };

  document.querySelectorAll('.player-kills-input').forEach(inp => {
    const p = inp.dataset.player;
    const v = parseInt(inp.value);
    if (!isNaN(v)) m.results.playerKills[p] = v;
  });

  saveMatches();
  recalcAllPredictions();
  toast('✅ Результат сохранён, прогнозы рассчитаны', '#10b981');
  closeModal();
  renderPage('admin');
}

// ============================================================
//  ЛИГИ — УПРАВЛЕНИЕ
// ============================================================
function startLeague(type) {
  const days = parseInt(document.getElementById('lg-' + type + '-days').value) || 7;
  const p1 = parseInt(document.getElementById('lg-' + type + '-p1').value) || 0;
  const p2 = parseInt(document.getElementById('lg-' + type + '-p2').value) || 0;
  const p3 = parseInt(document.getElementById('lg-' + type + '-p3').value) || 0;

  const users = loadUsers();
  for (const [name, u] of Object.entries(users)) {
    if (name === ADMIN_USER) continue;
    if (!u.leagues) u.leagues = {};
    u.leagues[type] = { points: 0 };
  }
  localStorage.setItem('fs2_users', JSON.stringify(users));

  leagueSettings[type] = { startTime: now(), durationDays: days, prizes: [p1, p2, p3], active: true };
  saveLeagueSettings();

  if (currentUser === ADMIN_USER) state = users[ADMIN_USER] || state;

  toast(`🏆 Лига запущена на ${days} дней`, '#10b981');
  renderPage('admin');
}

function stopLeague(type) {
  if (!confirm('Остановить лигу?')) return;
  leagueSettings[type].active = false;
  saveLeagueSettings();
  toast('⏹️ Лига остановлена', '#f59e0b');
  renderPage('admin');
}

function createSpecialLeague() {
  const name = document.getElementById('sl-name').value.trim();
  const days = parseInt(document.getElementById('sl-days').value) || 30;
  const p1 = parseInt(document.getElementById('sl-p1').value) || 10000;
  const p2 = parseInt(document.getElementById('sl-p2').value) || 5000;
  const p3 = parseInt(document.getElementById('sl-p3').value) || 2500;

  if (!name) { toast('⚠️ Введите название', '#ef4444'); return; }

  if (!leagueSettings.special) leagueSettings.special = [];
  leagueSettings.special.push({
    id: 'sl_' + now(),
    name,
    endTime: now() + days * 24 * 3600 * 1000,
    prizes: [p1, p2, p3],
    createdAt: now()
  });
  saveLeagueSettings();
  toast(`🏆 Спец-лига «${name}» создана!`, '#10b981');
  renderPage('admin');
}

function deleteSpecialLeague(id) {
  if (!confirm('Удалить спец-лигу?')) return;
  leagueSettings.special = (leagueSettings.special || []).filter(s => s.id !== id);
  saveLeagueSettings();
  toast('🗑️ Удалена', '#f59e0b');
  renderPage('admin');
}

// ============================================================
//  ПЕРЕСЧЁТ ПРОГНОЗОВ ПОСЛЕ МАТЧА
// ============================================================
function recalcAllPredictions() {
  const users = loadUsers();

  for (const [userName, u] of Object.entries(users)) {
    if (!u.predictions) continue;
    const newHistory = u.history || [];

    for (const [key, pred] of Object.entries(u.predictions)) {
      const m = matches.find(x => x.id === pred.matchId);
      if (!m || m.status !== 'finished' || !m.results) continue;
      if (newHistory.some(h => h.key === key)) continue;

      let correct = false;

      if (pred.market === 'winner') {
        correct = m.results.winner === pred.value;
      } else if (pred.market === 'total_kills') {
        const line = m.markets.totalKills.line;
        correct = (pred.value === 'over' && m.results.totalKills > line) ||
                  (pred.value === 'under' && m.results.totalKills < line);
      } else if (pred.market.endsWith('_kills')) {
        const p = pred.market.replace('_kills', '');
        const pk = m.markets.playerKills.find(x => x.player === p);
        if (pk && m.results.playerKills?.[p] !== undefined) {
          const actual = m.results.playerKills[p];
          correct = (pred.value === 'over' && actual > pk.line) ||
                    (pred.value === 'under' && actual < pk.line);
        }
      }

      let points = correct ? POINTS_CORRECT : POINTS_WRONG;
      let bonus = 0;
      let eloDelta = 0;

      if (!u.elo) u.elo = ELO_START;

      // Страховка
      const ins = (u.bonuses?.insurance || []).find(i => i.usedOn === key);
      if (ins && !correct) {
        points = 0;
        eloDelta = 0;
      }

      // Бустер
      const bst = (u.bonuses?.boosters || []).find(b => b.usedOn === key);
      if (bst && correct) {
        points = Math.round(points * (1 + bst.value / 100));
      }

      // ELO
      const isUnderdog = pred.value === 'under';
      if (correct) {
        eloDelta = isUnderdog ? ELO_WIN_UNDERDOG : ELO_WIN_FAVORITE;
        if (isUnderdog) u.underdogWins = (u.underdogWins || 0) + 1;
      } else if (!ins) {
        eloDelta = isUnderdog ? ELO_LOSE_UNDERDOG : ELO_LOSE_FAVORITE;
      }
      u.elo += eloDelta;

      if (u.elo < ELO_START && !u.lowEloReached) u.lowEloReached = true;
      if (u.elo > (u.bestEloReached || ELO_START)) u.bestEloReached = u.elo;

      // Серия
      if (correct) {
        u.streak = (u.streak || 0) + 1;
        if (u.streak > (u.bestStreak || 0)) u.bestStreak = u.streak;
        if (STREAK_BONUS[u.streak]) {
          bonus = STREAK_BONUS[u.streak];
          points += bonus;
        }
        if (pred.market.endsWith('_kills')) u.killsStreak = (u.killsStreak || 0) + 1;
        else u.killsStreak = 0;
      } else {
        if (!ins) u.streak = 0;
        u.killsStreak = 0;
      }

      u.fantasyPoints = (u.fantasyPoints || 0) + (correct ? 3 : 2);
      u.activityActions = (u.activityActions || 0) + 1;

      if (!u.leagues) u.leagues = { daily: { points: 0 }, weekly: { points: 0 }, monthly: { points: 0 } };
      for (const lk of ['daily', 'weekly', 'monthly']) {
        if (!u.leagues[lk]) u.leagues[lk] = { points: 0 };
        u.leagues[lk].points = (u.leagues[lk].points || 0) + points;
      }

      if (!u.specialLeagues) u.specialLeagues = {};
      (leagueSettings.special || []).forEach(sl => {
        if (sl.endTime > now()) {
          if (!u.specialLeagues[sl.id]) u.specialLeagues[sl.id] = { points: 0 };
          u.specialLeagues[sl.id].points = (u.specialLeagues[sl.id].points || 0) + points;
        }
      });

      newHistory.push({
        key,
        matchId: pred.matchId,
        matchName: `${m.teamA} vs ${m.teamB}`,
        predLabel: formatPredLabel(pred, m),
        market: pred.market,
        value: pred.value,
        correct,
        points,
        bonus,
        eloDelta,
        date: new Date().toLocaleDateString('ru-RU')
      });

      delete u.predictions[key];
    }

    u.history = newHistory;
  }

  localStorage.setItem('fs2_users', JSON.stringify(users));

  if (currentUser && users[currentUser]) {
    state = users[currentUser];
    updateHeader();
    checkAchievements();
    checkEloRewards();
    checkReferralProgress();
  }
}

// ============================================================
//  ОПИСАНИЕ ПРОГНОЗА ДЛЯ ИСТОРИИ
// ============================================================
function formatPredLabel(pred, m) {
  if (pred.market === 'winner') return `Победа: ${pred.value}`;
  if (pred.market === 'total_kills') return `${pred.value === 'over' ? 'БОЛЬШЕ' : 'МЕНЬШЕ'} ${m.markets.totalKills.line}`;
  if (pred.market.endsWith('_kills')) {
    const p = pred.market.replace('_kills', '');
    const pk = m.markets.playerKills.find(x => x.player === p);
    return `${p}: ${pred.value === 'over' ? 'БОЛЬШЕ' : 'МЕНЬШЕ'} ${pk.line}`;
  }
  return pred.market;
}