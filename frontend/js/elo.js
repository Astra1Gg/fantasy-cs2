// ============================================================
//  ELO — рейтинг игроков — v12.2
// ============================================================

function renderEloPage() {
  const users = loadUsers();
  const sorted = [];

  for (const [name, u] of Object.entries(users)) {
    if (name === ADMIN_USER) continue;
    sorted.push({
      name,
      elo: u.elo || ELO_START,
      rank: getEloRank(u.elo || ELO_START)
    });
  }
  sorted.sort((a, b) => b.elo - a.elo);

  // Наша позиция
  let myPosition = '—';
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].name === currentUser) { myPosition = i + 1; break; }
  }

  const myActions = state.activityActions || 0;
  const weekThreshold = 20;
  const monthThreshold = 50;
  const weekProgress = Math.min(100, Math.round(myActions / weekThreshold * 100));
  const monthProgress = Math.min(100, Math.round(myActions / monthThreshold * 100));

  return `<div class="panel">
    <div class="panel-title">
      <span>🎖️ Рейтинг ELO</span>
      <span>Ваше место: ${myPosition === '—' ? '—' : '#' + myPosition}</span>
    </div>

    <div style="background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(0,212,255,0.1));border:1px solid rgba(124,58,237,0.4);border-radius:14px;padding:14px;margin-bottom:16px;font-size:13px;line-height:1.7;">
      💡 <strong style="color:#a78bfa;">ELO — постоянный рейтинг мастерства.</strong> Он не сбрасывается. Угадали прогноз — ELO растёт, ошиблись — падает. За каждый новый ранг получаете награду.
    </div>

    <!-- Карточки рангов -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:16px;">
      ${ELO_RANKS.map(r => `
        <div style="background:${state.elo >= r.min ? 'linear-gradient(135deg, rgba(255,215,0,0.08), #0f1420)' : '#0f1420'};border:2px solid ${state.elo >= r.min ? r.color : '#1f2942'};border-radius:14px;padding:14px;opacity:${state.elo >= r.min ? 1 : 0.5};">
          <div style="font-size:32px;margin-bottom:6px;">${r.icon}</div>
          <div style="font-weight:800;font-size:15px;color:${r.color};">${r.name}</div>
          <div style="font-size:11px;color:#8b95a8;margin-top:4px;">${r.min} — ${r.max === 99999 ? '∞' : r.max} ELO</div>
          ${state.eloRewardsClaimed?.[r.name]
            ? `<div style="font-size:11px;color:#10b981;margin-top:6px;">✅ Награда получена</div>`
            : `<div style="font-size:11px;color:#ffd700;margin-top:6px;">🎁 ${r.reward?.points || 0} 🟡 + ${r.reward?.cases?.length || 0} кейсов</div>`}
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Награды за активность -->
  <div class="panel">
    <div class="panel-title">🏆 Награды за активность</div>

    <div style="background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.25);border-radius:12px;padding:14px;margin-bottom:14px;font-size:12px;color:#b0b8c8;line-height:1.7;">
      📊 <strong style="color:#00d4ff;">Ваша статистика</strong><br>
      • Действий: <strong style="color:#00d4ff;">${myActions}</strong><br>
      • Прогнозов: <strong>${(state.history || []).length}</strong><br>
      • Сообщений в чате: <strong>${state.chatMessages || 0}</strong><br>
      • Приглашённых друзей: <strong>${(state.referrals || []).length}</strong>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <!-- Недельная -->
      <div style="background:#0f1420;border:2px solid ${myActions >= weekThreshold ? '#10b981' : '#1f2942'};border-radius:14px;padding:16px;">
        <div style="font-size:32px;margin-bottom:8px;">📅</div>
        <div style="font-weight:800;font-size:15px;color:#10b981;">Недельная награда</div>
        <div style="font-size:12px;color:#8b95a8;margin-top:6px;">Нужно действий за неделю:</div>
        <div style="font-size:13px;color:#ffd700;margin-top:6px;">🟡 100 + 📦 Малый кейс</div>
        <div class="ref-progress-bar" style="margin-top:10px;">
          <div class="ref-progress-fill" style="width:${weekProgress}%;background:${myActions >= weekThreshold ? 'linear-gradient(90deg,#10b981,#00d4ff)' : 'linear-gradient(90deg,#00d4ff,#7c3aed)'};"></div>
        </div>
        <div style="font-size:11px;color:#8b95a8;margin-top:6px;">${myActions} / ${weekThreshold}</div>
        ${state.weeklyRewardClaimed === weekStr()
          ? '<div style="color:#10b981;font-size:11px;margin-top:8px;">✅ Получено</div>'
          : myActions >= weekThreshold
            ? '<div style="color:#ffd700;font-size:11px;margin-top:8px;">🎁 Разблокировано!</div>'
            : `<div style="color:#8b95a8;font-size:11px;margin-top:8px;">Осталось: ${weekThreshold - myActions}</div>`}
      </div>

      <!-- Месячная -->
      <div style="background:#0f1420;border:2px solid ${myActions >= monthThreshold ? '#a78bfa' : '#1f2942'};border-radius:14px;padding:16px;">
        <div style="font-size:32px;margin-bottom:8px;">🗓️</div>
        <div style="font-weight:800;font-size:15px;color:#a78bfa;">Месячная награда</div>
        <div style="font-size:12px;color:#8b95a8;margin-top:6px;">Нужно действий за месяц:</div>
        <div style="font-size:13px;color:#ffd700;margin-top:6px;">🟡 500 + 💎 Средний кейс</div>
        <div class="ref-progress-bar" style="margin-top:10px;">
          <div class="ref-progress-fill" style="width:${monthProgress}%;background:${myActions >= monthThreshold ? 'linear-gradient(90deg,#a78bfa,#00d4ff)' : 'linear-gradient(90deg,#00d4ff,#7c3aed)'};"></div>
        </div>
        <div style="font-size:11px;color:#8b95a8;margin-top:6px;">${myActions} / ${monthThreshold}</div>
        ${state.monthlyRewardClaimed === monthStr()
          ? '<div style="color:#10b981;font-size:11px;margin-top:8px;">✅ Получено</div>'
          : myActions >= monthThreshold
            ? '<div style="color:#ffd700;font-size:11px;margin-top:8px;">🎁 Разблокировано!</div>'
            : `<div style="color:#8b95a8;font-size:11px;margin-top:8px;">Осталось: ${monthThreshold - myActions}</div>`}
      </div>
    </div>
  </div>

  <!-- Топ по ELO -->
  <div class="panel">
    <div class="panel-title">📊 Топ игроков по ELO</div>
    ${sorted.length === 0
      ? '<div class="empty"><div class="empty-icon">🎖️</div><div class="empty-title">Пока никого нет</div></div>'
      : `<table class="table">
          <thead><tr><th>#</th><th>Игрок</th><th>ELO</th><th>Ранг</th></tr></thead>
          <tbody>${sorted.slice(0, 100).map((m, i) => {
            const rc = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
            const rowCls = (i === 0 ? 'rank-row-1' : i === 1 ? 'rank-row-2' : i === 2 ? 'rank-row-3' : '') + (m.name === currentUser ? ' me' : '');
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            return `<tr class="${rowCls}">
              <td class="${rc}">${medal} ${i + 1}</td>
              <td>${m.name}${m.name === currentUser ? ' <span style="color:#00d4ff;">(Вы)</span>' : ''}</td>
              <td style="color:${m.rank.color};font-weight:800;">${m.elo}</td>
              <td><span style="color:${m.rank.color};">${m.rank.icon} ${m.rank.name}</span></td>
            </tr>`;
          }).join('')}</tbody>
        </table>`}
  </div>`;
}