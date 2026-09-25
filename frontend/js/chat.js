// ============================================================
//  ЧАТ — v12.2
// ============================================================

// Рендер всех сообщений чата (с учётом эффектов ника и активных значков)
function renderChatMessages() {
  const users = loadUsers();
  return chatMessages.map(m => {
    const ad = users[m.author] || {};
    const cos = ad.cosmetics || [];
    const activeBadges = ad.activeBadges || {};
    const ne = ad.activeNickEffect;
    const isMe = m.author === currentUser;
    const time = new Date(m.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    // Классы ника
    let ac = 'chat-msg-author';
    if (ne === 'fire_effect') ac += ' fire';
    else if (ne === 'animnick' || ne === 'rainbow_effect') ac += ' anim';
    else if (ne === 'electric') ac += ' electric';
    else if (ne === 'crystal_effect') ac += ' anim';

    // Значки рядом с ником — только активные
    const badges = [
      (activeBadges.vip && cos.includes('vip')) ? ' ⭐' : '',
      (activeBadges.crown && cos.includes('crown')) ? ' 👑' : '',
      (activeBadges.badge_hunter && cos.includes('badge_hunter')) ? ' 🎯' : '',
      (activeBadges.badge_king && cos.includes('badge_king')) ? ' ♛' : '',
    ].join('');

    return `<div class="chat-msg ${isMe ? 'me' : ''}">
      <div class="${ac}">${m.author}${badges}</div>
      <div class="chat-msg-text">${escapeHtml(m.text)}</div>
      <div class="chat-msg-time">${time}</div>
    </div>`;
  }).join('');
}

// Обновить оба контейнера чата (на Матчах и на Live)
function updateAllChats() {
  ['chat-messages-side', 'chat-messages-side2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = renderChatMessages();
      el.scrollTop = el.scrollHeight;
    }
  });
  ['chat-count-side', 'chat-count-side2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = chatMessages.length;
  });
}

// Отправить сообщение
function sendChat(which) {
  if (!currentUser) { toast('⚠️ Сначала войдите в аккаунт', '#ef4444'); return; }
  const inputId = which === 'side' ? 'chat-input-side' : 'chat-input-side2';
  const input = document.getElementById(inputId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;
  if (text.length > 200) { toast('⚠️ Сообщение максимум 200 символов', '#ef4444'); return; }

  // Антифлуд — 3 секунды между сообщениями
  const lastMsgTime = state.lastActionTimes?.slice(-1)[0] || 0;
  if (now() - lastMsgTime < 3000) {
    toast('⏳ Подождите 3 секунды перед следующим сообщением', '#f59e0b');
    return;
  }

  state.lastActionTimes = state.lastActionTimes || [];
  state.lastActionTimes.push(now());

  chatMessages.push({ author: currentUser, text, time: now() });
  if (chatMessages.length > 200) chatMessages = chatMessages.slice(-200);
  localStorage.setItem('fs2_chat', JSON.stringify(chatMessages));

  // Награды за активность
  state.chatMessages = (state.chatMessages || 0) + 1;
  state.fantasyPoints = (state.fantasyPoints || 0) + 1;
  state.activityActions = (state.activityActions || 0) + 1;

  input.value = '';
  updateAllChats();
  updateHeader();
  checkAchievements();
  saveState();
}

// Авто-обновление чата каждые 3 секунды (если кто-то написал в другой вкладке)
setInterval(() => {
  if (!currentUser) return;
  const newChat = JSON.parse(localStorage.getItem('fs2_chat') || '[]');
  if (newChat.length !== chatMessages.length) {
    chatMessages = newChat;
    updateAllChats();
  }
}, 3000);