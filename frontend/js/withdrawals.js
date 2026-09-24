// ============================================================
//  ВЫВОДЫ ДЕНЕГ — v12.2
// ============================================================

// ============================================================
//  ИНФО ОБ УРОВНЕ ВЫВОДА
// ============================================================
function getWithdrawLevelInfo() {
  const c = state.withdrawCount || 0;
  if (c === 0) return { min: 10, nextMin: 200, title: '🎉 Первый вывод!', message: 'Минимум 10 ₽ — проверка, что реквизиты рабочие. Следующий вывод будет от 200 ₽.', color: '#10b981' };
  if (c === 1) return { min: 200, nextMin: 500, title: '💼 Второй вывод', message: 'После него стандартный минимум — 500 ₽. Это защита от дробления заявок.', color: '#f59e0b' };
  return { min: 500, nextMin: 500, title: '💼 Стандартный вывод', message: 'Минимум 500 ₽. Обработка в течение 12 часов.', color: '#00d4ff' };
}

// ============================================================
//  ГЛАВНАЯ МОДАЛКА ВЫВОДА
// ============================================================
function openWithdrawModal() {
  const levelInfo = getWithdrawLevelInfo();
  const currentBalance = state.rubles || 0;
  const minAmount = levelInfo.min;
  const canWithdraw = currentBalance >= minAmount;
  const withdrawCount = state.withdrawCount || 0;
  const activeWithdrawal = (state.withdrawals || []).find(w => w.status === 'pending');
  const progress = Math.min(100, Math.round(currentBalance / minAmount * 100));

  // Активная заявка
  if (activeWithdrawal) {
    document.getElementById('modal').innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:56px;margin-bottom:14px;">⏳</div>
        <div style="font-size:20px;font-weight:800;color:#f59e0b;margin-bottom:12px;">Активная заявка на вывод</div>
        <div style="font-size:13px;line-height:1.7;color:#b0b8c8;margin-bottom:18px;">Дождитесь обработки или напишите в поддержку</div>
        <div style="background:#0f1420;border-radius:12px;padding:14px;margin-bottom:18px;text-align:left;">
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
            <span style="color:#8b95a8;">Сумма:</span><strong>${fmt(activeWithdrawal.amount)} ₽</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
            <span style="color:#8b95a8;">В обработке:</span><strong data-withdraw-timer="${activeWithdrawal.id}">${formatTimeSince(now() - activeWithdrawal.createdAt)}</strong>
          </div>
        </div>
        <button class="btn btn-ghost" style="width:100%;" onclick="closeModal(); profileTab='withdrawals'; document.querySelector('.nav-btn[data-page=&quot;profile&quot;]').click();">📊 Отслеживать в профиле</button>
      </div>`;
    document.getElementById('modal-bg').classList.add('show');
    return;
  }

  // Форма вывода
  let html = `
    <h2>💳 Вывод средств</h2>

    <div style="background:${levelInfo.color}15;border:2px solid ${levelInfo.color};border-radius:14px;padding:16px;margin-bottom:18px;">
      <div style="font-size:16px;font-weight:800;color:${levelInfo.color};margin-bottom:8px;">${levelInfo.title}</div>
      <div style="font-size:13px;color:#b0b8c8;line-height:1.6;">${levelInfo.message}</div>
    </div>

    <!-- Уровни вывода -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px;">
      <div style="background:${withdrawCount === 0 ? 'rgba(16,185,129,0.15)' : '#0f1420'};border:2px solid ${withdrawCount === 0 ? '#10b981' : '#1f2942'};border-radius:10px;padding:10px;text-align:center;${withdrawCount > 0 ? 'opacity:0.5;' : ''}">
        <div style="font-size:10px;color:#8b95a8;">1-й вывод</div>
        <div style="font-size:16px;font-weight:900;color:#10b981;">от 10 ₽</div>
      </div>
      <div style="background:${withdrawCount === 1 ? 'rgba(245,158,11,0.15)' : '#0f1420'};border:2px solid ${withdrawCount === 1 ? '#f59e0b' : '#1f2942'};border-radius:10px;padding:10px;text-align:center;${withdrawCount > 1 ? 'opacity:0.5;' : ''}">
        <div style="font-size:10px;color:#8b95a8;">2-й вывод</div>
        <div style="font-size:16px;font-weight:900;color:#f59e0b;">от 200 ₽</div>
      </div>
      <div style="background:${withdrawCount >= 2 ? 'rgba(0,212,255,0.15)' : '#0f1420'};border:2px solid ${withdrawCount >= 2 ? '#00d4ff' : '#1f2942'};border-radius:10px;padding:10px;text-align:center;">
        <div style="font-size:10px;color:#8b95a8;">Стандарт</div>
        <div style="font-size:16px;font-weight:900;color:#00d4ff;">от 500 ₽</div>
      </div>
    </div>

    <!-- Баланс -->
    <div style="text-align:center;padding:16px;background:#0f1420;border-radius:12px;margin-bottom:16px;">
      <div style="font-size:11px;color:#8b95a8;">Доступно к выводу</div>
      <div style="font-size:36px;font-weight:900;color:${canWithdraw ? '#10b981' : '#ef4444'};margin-top:4px;">${fmt(currentBalance)} ₽</div>
      <div style="font-size:11px;color:#8b95a8;margin-top:8px;">Минимум: <strong style="color:${levelInfo.color};">${minAmount} ₽</strong></div>
      ${!canWithdraw ? `<div style="font-size:12px;color:#ef4444;margin-top:8px;">⚠️ Не хватает ${fmt(minAmount - currentBalance)} ₽</div>` : `<div style="font-size:12px;color:#10b981;margin-top:8px;">✅ Можно выводить</div>`}
      <div style="height:6px;background:#0a0e1a;border-radius:3px;margin-top:10px;overflow:hidden;">
        <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,${levelInfo.color},#7c3aed);border-radius:3px;"></div>
      </div>
    </div>`;

  if (canWithdraw) {
    html += `
      <div class="form-group" style="margin-bottom:12px;">
        <label>Сумма к выводу</label>
        <input type="number" id="withdraw-amount" value="${Math.floor(currentBalance)}" min="${minAmount}" max="${Math.floor(currentBalance)}">
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Куда выводить</label>
        <select id="withdraw-method" onchange="onWithdrawMethodChange()">
          <option value="sbp">🏦 СБП (по номеру телефона)</option>
          <option value="card">💳 Банковская карта</option>
          <option value="yoomoney">💛 ЮMoney</option>
        </select>
      </div>
      <div id="withdraw-fields"></div>
      <div style="display:flex;gap:8px;margin-top:16px;">
        <button class="btn btn-success" style="flex:1;" onclick="confirmWithdrawStep()">💳 Продолжить</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Отмена</button>
      </div>`;
  } else {
    html += `
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:14px;font-size:13px;color:#ff8888;margin-bottom:16px;text-align:center;">
        ⚠️ Недостаточно средств. Минимум для вывода: ${minAmount} ₽.
      </div>
      <button class="btn btn-ghost" style="width:100%;" onclick="closeModal()">Понятно</button>`;
  }

  document.getElementById('modal').innerHTML = html;
  document.getElementById('modal-bg').classList.add('show');
  if (canWithdraw) onWithdrawMethodChange();
}

// ============================================================
//  ФОРМЫ ПО СПОСОБАМ ВЫВОДА
// ============================================================
function onWithdrawMethodChange() {
  const method = document.getElementById('withdraw-method').value;
  const el = document.getElementById('withdraw-fields');
  if (!el) return;

  if (method === 'sbp') {
    el.innerHTML = `
      <div class="form-group" style="margin-bottom:12px;">
        <label>Номер телефона</label>
        <input type="text" id="wd-phone" placeholder="+7 (___) ___-__-__" oninput="handlePhoneInput(this)">
        <div class="input-hint" id="wd-phone-hint">Введите 11 цифр, начиная с 7</div>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Ваш банк</label>
        <select id="wd-sbp-bank">
          <option value="">— Выберите банк —</option>
          <option value="Сбербанк">🟢 Сбербанк</option>
          <option value="Т-Банк">🟡 Т-Банк</option>
          <option value="Альфа-Банк">🔴 Альфа-Банк</option>
          <option value="ВТБ">🔵 ВТБ</option>
          <option value="Райффайзен">🟨 Райффайзен</option>
          <option value="Газпромбанк">🔷 Газпромбанк</option>
          <option value="Открытие">🟦 Открытие</option>
          <option value="Росбанк">🟣 Росбанк</option>
          <option value="Совкомбанк">🟠 Совкомбанк</option>
          <option value="Почта Банк">📮 Почта Банк</option>
          <option value="Россельхозбанк">🟩 Россельхозбанк</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>Имя получателя (опционально)</label>
        <input type="text" id="wd-name" placeholder="Иван И.">
      </div>`;
  } else if (method === 'card') {
    el.innerHTML = `
      <div class="form-group" style="margin-bottom:12px;">
        <label>Номер карты</label>
        <input type="text" id="wd-card" placeholder="0000 0000 0000 0000" maxlength="23" oninput="handleCardInput(this)">
        <div class="input-hint" id="wd-card-hint">16 или 18 цифр</div>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Банк (определится автоматически)</label>
        <input type="text" id="wd-card-bank" placeholder="—" readonly style="background:#0a0e1a;color:#00d4ff;">
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Владелец карты (латиницей)</label>
        <input type="text" id="wd-card-holder" placeholder="IVAN IVANOV">
      </div>`;
  } else if (method === 'yoomoney') {
    el.innerHTML = `
      <div class="form-group" style="margin-bottom:12px;">
        <label>Номер кошелька ЮMoney</label>
        <input type="text" id="wd-yoomoney" placeholder="4100112345678901" maxlength="16" oninput="handleYooMoneyInput(this)">
        <div class="input-hint" id="wd-yoomoney-hint">15-16 цифр, начинается с 41001</div>
      </div>
      <div style="background:rgba(139,63,253,0.1);border:1px solid #8b3ffd;border-radius:10px;padding:12px;font-size:12px;color:#a78bfa;margin-bottom:12px;">
        💛 Свой номер ЮMoney можно найти в приложении: Профиль → Реквизиты
      </div>`;
  }
}
// ============================================================
//  ВАЛИДАЦИЯ И ФОРМАТИРОВАНИЕ ПОЛЕЙ
// ============================================================

// Форматирование номера телефона
function handlePhoneInput(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.startsWith('8')) val = '7' + val.substring(1);
  if (!val.startsWith('7') && val.length > 0) val = '7' + val;
  val = val.substring(0, 11);

  let formatted = '+7';
  if (val.length > 1) formatted += ' (' + val.substring(1, 4);
  if (val.length > 4) formatted += ') ' + val.substring(4, 7);
  if (val.length > 7) formatted += '-' + val.substring(7, 9);
  if (val.length > 9) formatted += '-' + val.substring(9, 11);
  input.value = formatted;

  const hint = document.getElementById('wd-phone-hint');
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) {
    input.classList.remove('error');
    input.classList.add('success');
    hint.className = 'input-hint success';
    hint.textContent = '✅ Номер корректен';
  } else {
    input.classList.remove('success');
    hint.className = 'input-hint';
    hint.textContent = 'Введите 11 цифр, начиная с 7';
  }
}

// Форматирование и определение банка по номеру карты
function handleCardInput(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 19);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();

  const hint = document.getElementById('wd-card-hint');
  const bankInput = document.getElementById('wd-card-bank');

  if (val.length >= 4) {
    const bank = detectCardBank(val);
    if (bank) {
      bankInput.value = bank.emoji + ' ' + bank.name;
      input.classList.remove('error');
      input.classList.add('success');
      hint.className = 'input-hint success';
      hint.textContent = '✅ ' + bank.name;
    } else {
      bankInput.value = 'Банк не определён';
      input.classList.remove('success');
      hint.className = 'input-hint';
      hint.textContent = 'Введите полный номер';
    }
  } else {
    bankInput.value = '';
    input.classList.remove('success', 'error');
    hint.className = 'input-hint';
    hint.textContent = '16 или 18 цифр';
  }

  if (val.length === 16) {
    input.classList.add('success');
    hint.className = 'input-hint success';
    hint.textContent = '✅ Номер корректен';
  } else if (val.length > 16 && val.length !== 18) {
    input.classList.add('error');
    input.classList.remove('success');
    hint.className = 'input-hint error';
    hint.textContent = '❌ Только 16 или 18 цифр';
  }
}

// Форматирование и валидация ЮMoney
function handleYooMoneyInput(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = val;

  const hint = document.getElementById('wd-yoomoney-hint');
  if (validateYooMoney(val)) {
    input.classList.remove('error');
    input.classList.add('success');
    hint.className = 'input-hint success';
    hint.textContent = '✅ Кошелёк корректен';
  } else if (val.length > 0) {
    input.classList.remove('success');
    input.classList.add('error');
    hint.className = 'input-hint error';
    hint.textContent = '❌ Номер должен начинаться с 41001 и содержать 15-16 цифр';
  } else {
    input.classList.remove('success', 'error');
    hint.className = 'input-hint';
    hint.textContent = '15-16 цифр, начинается с 41001';
  }
}

// ============================================================
//  ПОДТВЕРЖДЕНИЕ — шаг 2 (проверка данных)
// ============================================================
function confirmWithdrawStep() {
  const amount = parseInt(document.getElementById('withdraw-amount')?.value || 0);
  const method = document.getElementById('withdraw-method').value;
  const levelInfo = getWithdrawLevelInfo();
  const withdrawCount = state.withdrawCount || 0;

  if (!amount || amount < levelInfo.min) {
    toast(`⚠️ Минимальная сумма — ${levelInfo.min} ₽`, '#ef4444');
    return;
  }
  if (amount > (state.rubles || 0)) {
    toast('⚠️ Недостаточно средств на балансе', '#ef4444');
    return;
  }

  let methodName = '';
  let requisites = '';
  let requisitesDisplay = '';

  if (method === 'sbp') {
    const phone = document.getElementById('wd-phone').value;
    const bank = document.getElementById('wd-sbp-bank').value;
    const name = document.getElementById('wd-name').value.trim();

    if (!validatePhone(phone)) {
      toast('⚠️ Неверный номер телефона', '#ef4444');
      return;
    }
    if (!bank) {
      toast('⚠️ Выберите банк', '#ef4444');
      return;
    }
    methodName = 'СБП · ' + bank;
    requisites = phone + (name ? ' · ' + name : '');
    requisitesDisplay = phone + ' · ' + bank + (name ? ' · ' + name : '');

  } else if (method === 'card') {
    const card = document.getElementById('wd-card').value;
    const holder = document.getElementById('wd-card-holder').value.trim();
    const bank = document.getElementById('wd-card-bank').value;

    if (!validateCardNumber(card)) {
      toast('⚠️ Неверный номер карты', '#ef4444');
      return;
    }
    if (!holder || holder.length < 3) {
      toast('⚠️ Введите имя владельца карты', '#ef4444');
      return;
    }
    methodName = 'Карта · ' + (bank || '—');
    requisites = card + ' · ' + holder;
    requisitesDisplay = card + ' · ' + (bank || '—') + ' · ' + holder;

  } else if (method === 'yoomoney') {
    const ym = document.getElementById('wd-yoomoney').value;
    if (!validateYooMoney(ym)) {
      toast('⚠️ Неверный номер ЮMoney', '#ef4444');
      return;
    }
    methodName = 'ЮMoney';
    requisites = ym;
    requisitesDisplay = 'Кошелёк ' + ym;
  }

  // Финальный экран подтверждения
  let warnTitle = '', warnText = '', warnColor = '#10b981', nextNote = '';
  if (withdrawCount === 0) {
    warnTitle = '🎉 Ваш первый вывод';
    warnColor = '#10b981';
    warnText = `К выводу: <strong>${fmt(amount)} ₽</strong> — минимум 10 ₽. Обработка 12 часов.`;
    nextNote = `📌 Следующий вывод будет от <strong style="color:#f59e0b;">200 ₽</strong>. Это защита от ботов.`;
  } else if (withdrawCount === 1) {
    warnTitle = '💼 Второй вывод';
    warnColor = '#f59e0b';
    warnText = `К выводу: <strong>${fmt(amount)} ₽</strong> — минимум 200 ₽.`;
    nextNote = `✅ Всё! Дальше стандартный минимум — <strong style="color:#00d4ff;">500 ₽</strong>.`;
  } else {
    warnTitle = '💼 Стандартный вывод';
    warnColor = '#00d4ff';
    warnText = `К выводу: <strong>${fmt(amount)} ₽</strong>. Стандартный минимум — 500 ₽.`;
    nextNote = `📌 Обработка в течение <strong>12 часов</strong>.`;
  }

  document.getElementById('modal').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:56px;margin-bottom:14px;">💳</div>
      <div style="font-size:20px;font-weight:800;color:${warnColor};margin-bottom:12px;">${warnTitle}</div>
      <div style="font-size:14px;line-height:1.7;color:#b0b8c8;margin-bottom:18px;">${warnText}</div>

      <div style="background:#0f1420;border-radius:12px;padding:16px;margin-bottom:16px;">
        <div style="font-size:11px;color:#8b95a8;">Сумма к выводу</div>
        <div style="font-size:32px;font-weight:900;color:#10b981;margin-top:4px;">${fmt(amount)} ₽</div>
        <div style="font-size:11px;color:#8b95a8;margin-top:8px;">${methodName}<br>${requisitesDisplay}</div>
      </div>

      <div style="background:rgba(255,215,0,0.1);border:2px solid ${warnColor};border-radius:12px;padding:14px;margin-bottom:18px;font-size:13px;color:${warnColor};line-height:1.6;text-align:left;">
        ${nextNote}
      </div>

      <div style="display:flex;gap:8px;">
        <button class="btn btn-success" style="flex:1;" onclick="finalConfirmWithdraw(${amount}, '${methodName.replace(/'/g, "\\'")}', '${requisites.replace(/'/g, "\\'")}', '${requisitesDisplay.replace(/'/g, "\\'")}')">✅ Подтвердить</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="openWithdrawModal()">← Назад</button>
      </div>
    </div>`;
}

// ============================================================
//  СОЗДАНИЕ ЗАЯВКИ — финальный шаг
// ============================================================
function finalConfirmWithdraw(amount, methodName, requisites, requisitesDisplay) {
  const prevCount = state.withdrawCount || 0;

  const w = {
    id: 'w_' + now() + '_' + Math.floor(Math.random() * 1000),
    amount,
    method: methodName,
    requisites,
    requisitesDisplay: requisitesDisplay || requisites,
    createdAt: now(),
    standardHours: WITHDRAW_STANDARD_HOURS,
    status: 'pending',
    paidAt: null,
    bonus: 0,
    number: prevCount + 1,
    playerName: currentUser
  };

  state.withdrawals = state.withdrawals || [];
  state.withdrawals.push(w);
  state.rubles = (state.rubles || 0) - amount;
  state.withdrawCount = prevCount + 1;

  if (!state.rubHistory) state.rubHistory = [];
  state.rubHistory.push({ amount, type: 'withdraw', date: now(), number: state.withdrawCount });

  saveState();

  document.getElementById('modal').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:64px;margin-bottom:14px;">✅</div>
      <div style="font-size:22px;font-weight:800;color:#10b981;margin-bottom:12px;">Заявка создана!</div>
      <div style="font-size:14px;line-height:1.7;color:#b0b8c8;margin-bottom:18px;">
        Деньги придут в течение ${WITHDRAW_STANDARD_HOURS} часов.<br>
        Если задержим — начислим +5 ₽ за каждый час просрочки.
      </div>

      <div class="withdraw-tracker" style="text-align:left;">
        <div class="wt-row"><span class="wt-label">💰 Сумма</span><span class="wt-value">${fmt(amount)} ₽</span></div>
        <div class="wt-row"><span class="wt-label">💳 Способ</span><span class="wt-value">${methodName}</span></div>
        <div class="wt-row"><span class="wt-label">⏱️ В обработке</span><span class="wt-value" data-withdraw-timer="${w.id}">00:00:00</span></div>
        <div class="wt-row"><span class="wt-label">📌 Статус</span><span class="wt-value" style="color:#00d4ff;">⏳ В обработке</span></div>
      </div>

      <div style="background:rgba(0,212,255,0.08);border:1px solid #00d4ff;border-radius:10px;padding:12px;font-size:12px;color:#00d4ff;margin:14px 0;">
        📱 Отслеживать статус можно в профиле → 💳 Выводы
      </div>

      <button class="btn btn-primary" style="width:100%;" onclick="closeModal(); profileTab='withdrawals'; document.querySelector('.nav-btn[data-page=&quot;profile&quot;]').click();">📊 Отслеживать заявку</button>
    </div>`;

  // Тост-подсказка про следующий уровень
  setTimeout(() => {
    if (prevCount === 0) toast('📌 Следующий вывод будет от 200 ₽', '#f59e0b');
    else if (prevCount === 1) toast('✅ Дальше минимум 500 ₽', '#00d4ff');
    else toast('💳 Деньги в течение 12 часов', '#00d4ff');
  }, 1500);

  updateHeader();
}