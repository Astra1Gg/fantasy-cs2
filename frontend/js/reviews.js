// ============================================================
//  ОТЗЫВЫ — v12.2
// ============================================================

// ============================================================
//  СТРАНИЦА ОТЗЫВОВ (2 вкладки: Реальные выплаты + Отзывы)
// ============================================================
function renderReviewsPage() {
  const users = loadUsers();

  // Собираем скриншоты реальных выплат
  const withdrawPosts = [];
  for (const [name, u] of Object.entries(users)) {
    (u.withdrawals || []).forEach(w => {
      if (w.screenshot && w.status === 'paid') {
        withdrawPosts.push({ ...w, playerName: name, type: 'withdraw' });
      }
    });
  }
  withdrawPosts.sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));

  // Текстовые отзывы
  const textReviews = reviews
    .filter(r => r.type !== 'withdraw')
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });

  // Вкладки
  const tabs = `<div class="reviews-tabs">
    <div class="reviews-tab ${reviewsTab === 'payouts' ? 'active' : ''}" onclick="switchReviewsTab('payouts')">💰 Реальные выплаты (${withdrawPosts.length})</div>
    <div class="reviews-tab ${reviewsTab === 'reviews' ? 'active' : ''}" onclick="switchReviewsTab('reviews')">💬 Отзывы игроков (${textReviews.length})</div>
  </div>`;

  // === ВКЛАДКА «РЕАЛЬНЫЕ ВЫПЛАТЫ» ===
  if (reviewsTab === 'payouts') {
    return `<div class="panel">
      <div class="panel-title">
        <span>💰 Реальные выплаты</span>
        <span>${withdrawPosts.length}</span>
      </div>
      ${tabs}

      <div style="font-size:13px;color:#8b95a8;margin-bottom:14px;line-height:1.6;">
        Скриншоты реальных переводов — доказательство работы проекта. Мы не скрываем ничего: каждая выплата подтверждена.
      </div>

      ${withdrawPosts.length === 0
        ? `<div class="empty">
            <div class="empty-icon">💰</div>
            <div class="empty-title">Пока нет опубликованных выплат</div>
            <div style="font-size:13px;color:#8b95a8;margin-top:8px;">Скриншоты появятся после первой обработанной заявки</div>
          </div>`
        : withdrawPosts.map(w => `
            <div class="review-card withdraw">
              <div class="review-header">
                <div>
                  <div class="review-author">${w.playerName}</div>
                  <div class="review-date">${new Date(w.paidAt).toLocaleString('ru-RU')}</div>
                </div>
                <span style="background:#10b981;color:#fff;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:800;">💰 ВЫПЛАЧЕНО</span>
              </div>
              <div style="font-size:14px;margin-bottom:10px;">
                Вывод <strong style="color:#10b981;">${fmt(w.amount)} ₽</strong>
                ${w.bonus ? ` <span style="color:#ffd700;">(+${fmt(w.bonus)} ₽ бонус)</span>` : ''}
                на ${w.method}
              </div>
              ${w.screenshot ? `<img src="${w.screenshot}" style="max-width:100%;border-radius:10px;border:1px solid #1f2942;" onerror="this.style.display='none'">` : ''}
            </div>
          `).join('')}
    </div>`;
  }

  // === ВКЛАДКА «ОТЗЫВЫ ИГРОКОВ» ===
  return `<div class="panel">
    <div class="panel-title">
      <span>💬 Отзывы игроков</span>
      <span>${textReviews.length}</span>
    </div>
    ${tabs}

    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="openReviewModal()">✏️ Написать отзыв</button>
      ${isAdmin() ? `<button class="btn btn-gold" onclick="openReviewModal(true)">📝 Создать статью (админ)</button>` : ''}
    </div>

    ${textReviews.length === 0
      ? `<div class="empty">
          <div class="empty-icon">💬</div>
          <div class="empty-title">Пока нет отзывов</div>
          <div style="font-size:13px;color:#8b95a8;margin-top:8px;">Будьте первым — расскажите о своём опыте</div>
        </div>`
      : textReviews.map(r => `
          <div class="review-card ${r.pinned ? 'pinned' : ''}">
            <div class="review-header">
              <div>
                <div class="review-author ${r.isAdmin ? 'is-admin' : ''}">
                  ${r.isAdmin ? '👑 ' : ''}${r.author}
                </div>
                <div class="review-date">${new Date(r.createdAt).toLocaleString('ru-RU')}</div>
              </div>
              ${r.pinned ? '<span style="background:#ffd700;color:#1a0a2e;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:800;">📌 ЗАКРЕПЛЕНО</span>' : ''}
            </div>

            <div class="review-text">${escapeHtml(r.text)}</div>

            ${r.image ? `<img src="${r.image}" style="max-width:100%;border-radius:10px;margin-top:10px;" onerror="this.style.display='none'">` : ''}

            ${isAdmin() ? `
              <div style="margin-top:10px;display:flex;gap:6px;">
                <button class="btn btn-ghost" style="padding:6px 12px;font-size:11px;min-height:32px;" onclick="togglePinReview('${r.id}')">
                  ${r.pinned ? '📍 Открепить' : '📌 Закрепить'}
                </button>
                <button class="btn btn-danger" style="padding:6px 12px;font-size:11px;min-height:32px;" onclick="deleteReview('${r.id}')">
                  🗑️ Удалить
                </button>
              </div>
            ` : ''}
          </div>
        `).join('')}
  </div>`;
}

// ============================================================
//  ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================================
function switchReviewsTab(tab) {
  reviewsTab = tab;
  renderPage('reviews');
}
// ============================================================
//  МОДАЛКА СОЗДАНИЯ ОТЗЫВА
// ============================================================
function openReviewModal(isArticle = false) {
  document.getElementById('modal').innerHTML = `
    <h2>${isArticle ? '📝 Новая статья (админ)' : '✏️ Написать отзыв'}</h2>

    <div class="form-group" style="margin-bottom:12px;">
      <label>Текст</label>
      <textarea id="review-text" placeholder="${isArticle ? 'Расскажите о новостях проекта, обновлениях, акциях...' : 'Поделитесь опытом: как играете, что нравится, что можно улучшить...'}" style="min-height:140px;"></textarea>
      <div class="input-hint" id="review-text-hint">От 5 до 2000 символов</div>
    </div>

    <div class="form-group" style="margin-bottom:16px;">
      <label>Изображение (URL, опционально)</label>
      <input type="text" id="review-image" placeholder="https://i.imgur.com/...">
      <div class="input-hint">Скриншот, картинка или мем — приветствуется</div>
    </div>

    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary" style="flex:1;" onclick="submitReview(${isArticle})">
        ${isArticle ? '📝 Опубликовать статью' : '✅ Опубликовать отзыв'}
      </button>
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Отмена</button>
    </div>`;
  document.getElementById('modal-bg').classList.add('show');
}

// ============================================================
//  ОТПРАВКА ОТЗЫВА
// ============================================================
function submitReview(isArticle) {
  const text = document.getElementById('review-text').value.trim();
  const image = document.getElementById('review-image').value.trim();
  const hint = document.getElementById('review-text-hint');

  if (!text || text.length < 5) {
    hint.className = 'input-hint error';
    hint.textContent = '⚠️ Минимум 5 символов';
    toast('⚠️ Слишком короткий отзыв', '#ef4444');
    return;
  }
  if (text.length > 2000) {
    hint.className = 'input-hint error';
    hint.textContent = '⚠️ Максимум 2000 символов';
    toast('⚠️ Превышен лимит символов', '#ef4444');
    return;
  }

  reviews.push({
    id: 'r_' + now(),
    author: currentUser,
    text,
    image: image || null,
    createdAt: now(),
    pinned: false,
    isAdmin: isArticle && isAdmin(),
    type: 'text'
  });

  saveReviews();
  toast(isArticle ? '📝 Статья опубликована!' : '✅ Отзыв опубликован!', '#10b981');
  closeModal();
  renderPage('reviews');
}

// ============================================================
//  ЗАКРЕПИТЬ / ОТКРЕПИТЬ ОТЗЫВ (только админ)
// ============================================================
function togglePinReview(id) {
  if (!isAdmin()) return;
  const r = reviews.find(x => x.id === id);
  if (!r) return;

  r.pinned = !r.pinned;
  saveReviews();
  toast(r.pinned ? '📌 Отзыв закреплён' : '📍 Отзыв откреплён', r.pinned ? '#ffd700' : '#8b95a8');
  renderPage('reviews');
}

// ============================================================
//  УДАЛИТЬ ОТЗЫВ (только админ)
// ============================================================
function deleteReview(id) {
  if (!isAdmin()) return;
  if (!confirm('Удалить этот отзыв? Действие необратимо.')) return;

  reviews = reviews.filter(x => x.id !== id);
  saveReviews();
  toast('🗑️ Отзыв удалён', '#f59e0b');
  renderPage('reviews');
}