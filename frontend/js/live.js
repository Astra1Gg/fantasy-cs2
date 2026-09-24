// ============================================================
//  LIVE — страница активных матчей с плеером — v12.2
// ============================================================

// ============================================================
//  СТРАНИЦА LIVE
// ============================================================
function renderLivePage() {
  const liveMatches = matches.filter(m => m.status === 'live');

  let matchesHtml = liveMatches.length === 0
    ? `<div class="panel"><div class="empty">
        <div class="empty-icon">📺</div>
        <div class="empty-title">Сейчас нет активных матчей</div>
        <div style="font-size:13px;color:#8b95a8;margin-top:8px;">Заходите, когда что-то будет в эфире</div>
      </div></div>`
    : liveMatches.map(m => renderLiveMatch(m)).join('');

  return `<div class="matches-layout">
    <div>${matchesHtml}</div>
    <div class="chat-side">
      <div class="panel" style="margin:0;">
        <div class="panel-title"><span>💬 Live-чат</span><span id="chat-count-side2">0</span></div>
        <div class="chat-container">
          <div class="chat-messages" id="chat-messages-side2"></div>
          <div class="chat-input-row">
            <input type="text" class="chat-input" id="chat-input-side2" placeholder="Обсудить матч..." maxlength="200" onkeypress="if(event.key==='Enter')sendChat('side2')">
            <button class="chat-send" onclick="sendChat('side2')">➤</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
//  ОДИН LIVE-МАТЧ С ПЛЕЕРОМ
// ============================================================
function renderLiveMatch(m) {
  const stats = m.liveStats || { killsA: 0, killsB: 0, roundTime: 45, currentRound: 1, mapName: 'Mirage' };
  const hasTwitch = !!m.twitch;
  const hasKick = !!m.kick;
  const activeStream = currentLiveStream[m.id] || (hasTwitch ? 'twitch' : hasKick ? 'kick' : null);

  // Плеер
  let playerHtml = '';
  if (activeStream === 'twitch' && hasTwitch) {
    const ch = extractTwitchChannel(m.twitch);
    playerHtml = `<div style="margin-bottom:16px;background:#000;border-radius:14px;overflow:hidden;aspect-ratio:16/9;">
      <iframe src="https://player.twitch.tv/?channel=${ch}&parent=${location.hostname || 'localhost'}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>
    </div>`;
  } else if (activeStream === 'kick' && hasKick) {
    const ch = extractKickChannel(m.kick);
    playerHtml = `<div style="margin-bottom:16px;background:#000;border-radius:14px;overflow:hidden;aspect-ratio:16/9;">
      <iframe src="https://player.kick.com/${ch}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>
    </div>`;
  } else {
    playerHtml = `<div style="margin-bottom:16px;background:#000;border-radius:14px;overflow:hidden;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#5a6478;">
      <div style="font-size:56px;">📺</div>
      <div>Трансляция пока не подключена</div>
    </div>`;
  }

  // Кнопки переключения плеера
  let streamButtons = '';
  if (hasTwitch || hasKick) {
    streamButtons = '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;justify-content:center;">';
    if (hasTwitch) {
      streamButtons += `<button style="padding:10px 18px;border-radius:10px;border:none;cursor:pointer;font-weight:700;background:${activeStream === 'twitch' ? '#9146ff' : 'rgba(145,70,255,0.3)'};color:#fff;font-family:inherit;" onclick="setLiveStream('${m.id}', 'twitch')">🎥 Twitch</button>`;
    }
    if (hasKick) {
      streamButtons += `<button style="padding:10px 18px;border-radius:10px;border:none;cursor:pointer;font-weight:700;background:${activeStream === 'kick' ? '#53fc18' : 'rgba(83,252,24,0.3)'};color:${activeStream === 'kick' ? '#0a0e1a' : '#fff'};font-family:inherit;" onclick="setLiveStream('${m.id}', 'kick')">🎥 Kick</button>`;
    }
    streamButtons += '</div>';
  }

  // Счёт
  return `<div id="live-match-${m.id}">
    ${playerHtml}
    ${streamButtons}
    <div style="background:#0a0e1a;border:2px solid #ef4444;border-radius:16px;padding:20px;margin-bottom:16px;position:relative;">
      <div style="position:absolute;top:12px;right:16px;color:#ef4444;font-size:12px;font-weight:900;">● В ЭФИРЕ</div>
      <div style="text-align:center;margin-bottom:8px;font-size:12px;color:#8b95a8;">${stats.mapName} · Раунд ${stats.currentRound} · BO${m.bestOf}</div>
      <div style="display:flex;justify-content:space-around;align-items:center;margin:20px 0;">
        <div style="text-align:center;flex:1;">
          <div style="font-size:16px;font-weight:800;">${m.teamA}</div>
          <div style="font-size:48px;font-weight:900;color:${(m.scoreA||0) > (m.scoreB||0) ? '#10b981' : '#00d4ff'};">${m.scoreA || 0}</div>
        </div>
        <div style="font-size:24px;color:#5a6478;font-weight:900;">VS</div>
        <div style="text-align:center;flex:1;">
          <div style="font-size:16px;font-weight:800;">${m.teamB}</div>
          <div style="font-size:48px;font-weight:900;color:${(m.scoreB||0) > (m.scoreA||0) ? '#10b981' : '#00d4ff'};">${m.scoreB || 0}</div>
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
//  ИЗВЛЕЧЕНИЕ КАНАЛА ИЗ URL
// ============================================================
function extractTwitchChannel(url) {
  const match = url.match(/twitch\.tv\/([^\/\?]+)/);
  return match ? match[1] : url;
}

function extractKickChannel(url) {
  const match = url.match(/kick\.com\/([^\/\?]+)/);
  return match ? match[1] : url;
}

// ============================================================
//  ПЕРЕКЛЮЧЕНИЕ ПЛЕЕРА
// ============================================================
function setLiveStream(matchId, type) {
  currentLiveStream[matchId] = type;
  renderPage('live');
}