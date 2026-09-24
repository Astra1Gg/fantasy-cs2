// ============================================================
//  ДОСТИЖЕНИЯ — всплывающее уведомление — v12.2
// ============================================================
//
//  ⚠️ ВАЖНО: основные функции (checkAchievements, checkEloRewards,
//  checkActivityRewards) находятся в файле utils.js.
//  Здесь — только показ красивого уведомления о новом достижении.
//
// ============================================================

function showAchievementToast(ach) {
  const el = document.createElement('div');

  // Разные стили для разных редкостей
  const rarityStyles = {
    common:    { border: '#8b95a8', glow: 'rgba(139,149,168,0.3)', icon: '🏅', label: 'Достижение' },
    rare:      { border: '#00d4ff', glow: 'rgba(0,212,255,0.4)',  icon: '🎖️', label: 'Редкое достижение' },
    epic:      { border: '#a78bfa', glow: 'rgba(167,139,250,0.5)', icon: '💎', label: 'Эпическое достижение' },
    legendary: { border: '#ffd700', glow: 'rgba(255,215,0,0.6)',  icon: '👑', label: 'ЛЕГЕНДАРНОЕ достижение' }
  };

  const style = rarityStyles[ach.rarity] || rarityStyles.common;

  el.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 9999;
    background: linear-gradient(145deg, #131826, #0f1420);
    border: 2px solid ${style.border};
    border-radius: 16px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 40px ${style.glow};
    animation: achievementSlideIn 0.5s ease-out;
    max-width: 500px;
    margin: 0 auto;
  `;

  el.innerHTML = `
    <div style="font-size: 38px; filter: drop-shadow(0 0 8px ${style.glow});">${ach.icon}</div>
    <div style="flex: 1;">
      <div style="font-size: 10px; color: #8b95a8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
        ${style.icon} ${style.label}
      </div>
      <div style="font-size: 15px; font-weight: 800; color: ${style.border}; margin-top: 2px;">
        ${ach.name}
      </div>
      <div style="font-size: 11px; color: #8b95a8; margin-top: 2px; line-height: 1.4;">
        ${ach.desc}
      </div>
    </div>
  `;

  // Анимация появления
  if (!document.getElementById('achievement-anim-style')) {
    const s = document.createElement('style');
    s.id = 'achievement-anim-style';
    s.textContent = `
      @keyframes achievementSlideIn {
        from { opacity: 0; transform: translateY(40px) scale(0.9); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes achievementSlideOut {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to   { opacity: 0; transform: translateY(40px) scale(0.9); }
      }
    `;
    document.head.appendChild(s);
  }

  document.body.appendChild(el);

  // Красивое исчезновение через 4 секунды
  setTimeout(() => {
    el.style.animation = 'achievementSlideOut 0.4s ease-in forwards';
    setTimeout(() => el.remove(), 450);
  }, 4200);
}