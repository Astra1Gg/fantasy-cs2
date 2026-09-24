// ============================================================
//  FAQ — страница частых вопросов — v12.2
// ============================================================

function renderFaqPage() {
  return `<div class="panel">
    <div class="panel-title">
      <span>❓ Часто задаваемые вопросы</span>
      <span>${FAQ_ITEMS.length} вопросов</span>
    </div>

    <div style="background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.25);border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;color:#b0b8c8;line-height:1.7;">
      💡 Не нашли ответ? Напишите в поддержку: <strong style="color:#00d4ff;">@FantasyCS2Support</strong>. Отвечаем в течение 24 часов.
    </div>

    ${FAQ_ITEMS.map((item, i) => `
      <div class="faq-item" id="faq-${i}">
        <div class="faq-question" onclick="toggleFaq(${i})">
          <span>${item.q}</span>
          <span class="faq-arrow">▼</span>
        </div>
        <div class="faq-answer">${item.a}</div>
      </div>
    `).join('')}
  </div>`;
}

function toggleFaq(i) {
  const el = document.getElementById('faq-' + i);
  if (el) el.classList.toggle('open');
}