# 🤖 CONTEXT — контекст для ИИ

Этот файл читается **первым** в новом чате. Даёт ИИ понимание проекта без чтения всего кода.

---

## Что это за проект

**Fantasy CS2** — веб-платформа для прогнозов на матчи CS2. Прототип на localStorage.
Стек: HTML/CSS/JS (без фреймворков). Файлов: 17 JS + 1 CSS + 1 HTML.

**Где живёт:** https://github.com/Astra1Gg/fantasy-cs2 (Public)
**Задеплоен на:** Netlify (автоматически при каждом `git push`)
**Прод-ссылка:** https://cheerful-chebakia-0e1c2e.netlify.app (временный слаг)
**Проблема:** Netlify блокируется РКН — нужен VPN для доступа из РФ.

---

## Ключевые правила проекта

### ⚠️ Нельзя ломать (сломает всё):

1. **Все глобальные переменные только в `config.js`**
   - `currentUser`, `state`, `matches`, `chatMessages`, `reviews`, `leagueSettings`
   - `profileTab`, `currentLeagueTab`, `currentLiveStream`, `adminTab`, `reviewsTab`
   - `captchaAnswer`, `pendingRegister`
   - **НЕ объявлять их в других файлах** → будет `Identifier has already been declared`

2. **Порядок подключения скриптов в `index.html` критичен:**
   config → utils → achievements → auth → chat → matches → live →
   leagues → elo → wheel → shop → profile → withdrawals → admin →
   faq → reviews → main
   Менять нельзя. `config.js` первым. `main.js` последним.

3. **Админ всегда в `users[ADMIN_USER]`**
   - При логине админа: `users[ADMIN_USER] = adminState` + `localStorage.setItem`
   - Функция `adminAccrue` берёт `users[ADMIN_USER]`, а не `users[name]`
   - Иначе начисления себе не работают

4. **`loadLeagueSettings()` защищён** — если в localStorage битый объект, возвращает дефолт. Не убирать эту защиту.

5. **`enterGame` не перезаписывается** — только один раз объявлена в `auth.js`. `localStorage.setItem('fs2_last_user')` внутри.

6. **Кейсы — структура `CASE_TABLES` в `shop.js`:**
   - Каждый приз: `{ type, icon, name, rarity, amount|value|count|caseType|skinRarity|insType }`
   - `type`: `'points' | 'booster' | 'insurance' | 'case' | 'skin'`
   - `count`: сколько выдать (для мульти-призов ×2-×5)
   - Скины — `skinRarity` (`'common' | 'rare' | 'epic'`), берутся из `CASE_SKINS` в `config.js`

7. **Значки (`activeBadges`)**
   - Хранится в `state.activeBadges = { vip: true, crown: false, badge_hunter: true, badge_king: false }`
   - В чате показываются **только активные** значки (проверка в `chat.js`)
   - В профиле рядом с ником — тоже только активные
   - Тумблеры в `renderProfileCustomize` (`profile.js`), функция `toggleBadge(badgeId)`

### 🔑 Ключевые константы
- `ADMIN_USER = 'admin'`, `ADMIN_PASS = 'admin123'` (временно, уйдёт на сервер)
- `POINTS_CORRECT = 100`, `POINTS_WRONG = -150`
- `ELO_START = 1000`
- `WITHDRAW_STANDARD_HOURS = 12`, `WITHDRAW_BONUS_PER_HOUR = 5`

### 💾 Хранилище (localStorage)

| Ключ | Что |
|------|-----|
| `fs2_users` | все пользователи |
| `fs2_pass_<логин>` | пароли (открытым текстом — временно) |
| `fs2_matches` | матчи |
| `fs2_league_settings` | настройки лиг |
| `fs2_reviews` | отзывы |
| `fs2_chat` | последние 200 сообщений чата |
| `fs2_last_user` | последний логин |

---

## Архитектура

### Функция `renderPage(page)` (в `main.js`)
Центральный роутер. Переключает страницы:
`matches`, `live`, `league`, `elo`, `wheel`, `shop`, `profile`, `faq`, `reviews`, `admin`

**Каждая страница — своя функция `render*Page()`**, возвращает HTML-строку.

### Паттерн работы с данными

```js
const users = loadUsers();
users[name].fantasyPoints += 100;
localStorage.setItem('fs2_users', JSON.stringify(users));
updateHeader();
renderPage('current-page');
```


**ВАЖНО: сохранение `state` и `users`**
- `state` — текущий игрок (упрощённый доступ)
- `users` — все игроки
- `saveUsers()` — синхронизирует `state` → `users[currentUser]`
- После изменений всегда `saveState()` или `saveUsers()`

---

## 📊 ЧТО СДЕЛАНО (на момент v12.3)

### ✅ Готово:
- Разбивка монолитного HTML на 17 JS-модулей
- Авторизация, регистрация, TG-верификация (демо)
- Прогнозы на 3 рынка (победитель, kills игрока, тотал)
- ELO + ранги (Bronze → Legend)
- Лиги (ежедневная / недельная / месячная)
- Колесо Фортуны
- Магазин: бустеры, страховки, косметика, рамки
- **Кейсы (малый/средний/большой):**
  - Превью-модалка со списком призов перед открытием (`showCasePreview`)
  - Рулетка с анимацией 7 сек (`showCaseRoulette`)
  - Мульти-призы: бустеры ×2, страховки ×2/×3, кейсы ×2
  - **Скины CS2** — выпадают, копятся в `state.inventory`
  - Шансы на скины: **1/500 малый, 1/200 средний, 1/50 большой**
- **Значки (vip, crown, badge_hunter, badge_king):**
  - Тумблеры вкл/выкл в кастомизации
  - В чате и профиле показываются только активные
- **Вход/регистрация по Enter** (в `auth.js`, блок `DOMContentLoaded`)
- Выводы (СБП / карта / ЮMoney) + бонус за задержку
- Админка (6 вкладок)
- Достижения (36 штук, с человеческими описаниями)
- Реферальная система (до 700 🟡 + 2 кейса за друга)
- Чат (общий, с антифлудом 3 сек)
- Отзывы, FAQ

### 📌 Задеплоено на:
- **GitHub:** https://github.com/Astra1Gg/fantasy-cs2
- **Netlify:** https://cheerful-chebakia-0e1c2e.netlify.app (автодеплой при push)
- Последний коммит: `942246f feat: badge toggles + only active badges in chat/profile`

---

# 🎯 ТЕКУЩАЯ ЗАДАЧА (обновлено 25.09.2026)

## Цель
Довести проект до продакшена: сайт работает в интернете 24/7, реальная БД,
Telegram-бот для верификации, игроки заходят и играют.

## Согласованный план (6 этапов)

### ✅ Этап 1: Деплой фронта на Netlify — ЗАВЕРШЁН
- Git установлен, GitHub репозиторий создан
- Код запушен, Netlify подключён, автодеплой работает
- Все UI-баги исправлены (кейсы, значки, скины, Enter)

### 🔜 Этап 2: Схема PostgreSQL — СЛЕДУЮЩИЙ ШАГ
- Установка PostgreSQL локально (Windows)
- Таблицы: `users`, `matches`, `predictions`, `withdrawals`, `leagues`,
  `league_points`, `chat_messages`, `reviews`, `achievements`, `notifications`
- Готовый `database/schema.sql`

### Этап 3: Backend API на Node.js (5-7 дней)
- День 1-2: Авторизация (register, login, /me, JWT, bcrypt)
- День 3: Матчи и прогнозы (с серверной валидацией времени)
- День 4: Профиль, лиги, ELO, колесо, магазин
- День 5: Выводы (create, list)
- День 6: Админка (начисления, выплаты, матчи)
- День 7: Чат (WebSocket) + отзывы + достижения

### Этап 4: Переключение фронта на API (2-3 дня)
- Замена localStorage → fetch('/api/...')
- Все 17 модулей по очереди

### Этап 5: Telegram-бот (1-2 дня)
- Создание бота в @BotFather
- Backend endpoint для верификации
- Привязка 1 TG = 1 аккаунт

### Этап 6: Деплой на прод (2-3 дня)
- Railway: бэкенд + PostgreSQL
- Netlify: фронт (или переезд на хостинг, доступный из РФ)
- Домен (reg.ru)
- HTTPS автоматом

## Стек продакшена

| Компонент | Технология | Где хостится |
|-----------|-----------|--------------|
| Frontend | HTML/CSS/JS | Netlify (пока) |
| Backend | Node.js + Express | Railway |
| БД | PostgreSQL | Railway |
| Авторизация | JWT + bcrypt | — |
| Telegram-бот | node-telegram-bot-api | Railway |
| Домен | .ru | reg.ru |
| HTTPS | Let's Encrypt | автоматом |

## Важно
- Локальный сервер (на ПК) — только для разработки
- Продакшен — в облаке (Railway), работает 24/7 без твоего ПК
- Юридика/оферта/платёжка — НЕ сейчас, только прямые выплаты вручную
- **Netlify блокируется в РФ** — на Этапе 6 решим (РФ-хостинг или Cloudflare)

## Следующее действие
**Этап 2** — установить PostgreSQL локально и написать `database/schema.sql`.