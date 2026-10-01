# 🤖 CONTEXT — контекст для ИИ

Этот файл читается **первым** в новом чате. Даёт ИИ понимание проекта без чтения всего кода.

---

## 📌 Что это за проект

**Fantasy CS2** — веб-платформа для прогнозов на матчи CS2.
Стек: HTML/CSS/JS (фронт) + Node.js/Express/PostgreSQL (бэкенд).

| | |
|---|---|
| **GitHub** | https://github.com/Astra1Gg/fantasy-cs2 (Public) |
| **Фронт** | Netlify (автодеплой при `git push`) |
| **Прод-ссылка** | https://cheerful-chebakia-0e1c2e.netlify.app (под VPN) |
| **Бэкенд** | локально на `http://localhost:3000` (пока не задеплоен) |

---

## 🎯 ТЕКУЩИЙ СТАТУС (обновлено 01.10.2026)

### ✅ Что ГОТОВО

**Фронт (v12.3):**
- 17 JS-модулей + `config.js` + `index.html` + `style.css`
- Работает на **localStorage** (пока не подключён к API)
- Авторизация, прогнозы, ELO, лиги, колесо, магазин, кейсы, скины, значки
- Всё работает локально

**Бэкенд (Этап 3 — ПОЛНОСТЬЮ ЗАКРЫТ):**
- PostgreSQL 16.15 + БД `fantasy_cs2`
- Схема: **10 таблиц** — `users`, `matches`, `predictions`, `withdrawals`, `leagues`, `league_points`, `chat_messages`, `reviews`, `achievements`, `notifications`
- Node.js + Express + `pg` + `bcrypt` + `jsonwebtoken`
- **11 роутов, ~51 эндпоинт** — все работают:

**`routes/auth.js`** (3):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**`routes/profile.js`** (6):
- `GET /api/profile/me`
- `GET /api/profile/:username`
- `PATCH /api/profile/me`
- `POST /api/profile/buy-avatar`
- `POST /api/profile/buy-frame`
- `POST /api/profile/buy-cosmetic`

**`routes/matches.js`** (5):
- `GET /api/matches`
- `GET /api/matches/:id`
- `POST /api/matches` (admin)
- `PUT /api/matches/:id` (admin)
- `DELETE /api/matches/:id` (admin)

**`routes/predictions.js`** (3):
- `POST /api/predictions` (auth)
- `GET /api/predictions/my` (auth)
- `GET /api/predictions/match/:matchId` (admin)

**`routes/shop.js`** (5):
- `GET /api/shop/items`
- `POST /api/shop/buy-booster`
- `POST /api/shop/buy-insurance`
- `POST /api/shop/open-case`
- `POST /api/shop/open-pending-case`

**`routes/elo.js`** (4):
- `GET /api/elo/ranks`
- `GET /api/elo/top`
- `GET /api/elo/rank` (auth)
- `GET /api/elo/user/:username`

**`routes/leagues.js`** (6):
- `GET /api/leagues`
- `GET /api/leagues/:type/top`
- `GET /api/leagues/my` (auth)
- `GET /api/leagues/user/:username`
- `POST /api/leagues` (admin)
- `POST /api/leagues/:id/stop` (admin)

**`routes/withdrawals.js`** (4):
- `GET /api/withdrawals/levels` (auth)
- `GET /api/withdrawals/my` (auth)
- `POST /api/withdrawals/create` (auth)
- `GET /api/withdrawals/status/:id` (auth)

**`routes/admin.js`** (7):
- `POST /api/admin/accrue` (admin)
- `GET /api/admin/withdrawals` (admin)
- `POST /api/admin/withdrawals/:id/pay` (admin)
- `POST /api/admin/withdrawals/:id/reject` (admin)
- `GET /api/admin/players` (admin)
- `POST /api/admin/players/:username/ban` (admin)
- `POST /api/admin/matches/:id/finish` (admin)

**`routes/reviews.js`** (5):
- `GET /api/reviews`
- `GET /api/reviews/payouts`
- `POST /api/reviews` (auth)
- `POST /api/reviews/:id/pin` (admin)
- `DELETE /api/reviews/:id` (admin)

**`routes/chat.js`** (3):
- `GET /api/chat/messages`
- `POST /api/chat/messages` (auth, антифлуд 3 сек)
- `DELETE /api/chat/messages/:id` (admin)

**Плюс:** `GET /api/health` — проверка подключения к БД.

### 🔜 Что ДАЛЬШЕ

**Этап 4** — Переключение фронта на API:
- Замена localStorage → `fetch('/api/...')`
- 17 модулей по очереди
- Начать с `auth.js` (регистрация/логин)

**Этап 5** — Telegram-бот (реальный, не демо)

**Этап 6** — Деплой на прод:
- Railway: бэкенд + PostgreSQL
- Netlify: фронт (или РФ-хостинг)
- Домен .ru

---

## 🏗 Структура проекта

```
fantasy-cs2/
├── frontend/                    # Netlify (статика, localStorage)
│   ├── index.html
│   ├── css/style.css
│   └── js/                      # 17 модулей
│       ├── config.js
│       ├── utils.js
│       ├── auth.js
│       ├── chat.js
│       ├── matches.js
│       ├── live.js
│       ├── leagues.js
│       ├── elo.js
│       ├── wheel.js
│       ├── shop.js
│       ├── profile.js
│       ├── withdrawals.js
│       ├── admin.js
│       ├── faq.js
│       ├── reviews.js
│       ├── achievements.js
│       └── main.js
│
├── backend/                     # Node.js + Express (локально)
│   ├── server.js                # Точка входа
│   ├── db.js                    # Пул подключений к PostgreSQL
│   ├── .env                     # Переменные окружения (НЕ в Git!)
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js              # JWT: authRequired, adminRequired, authOptional
│   └── routes/                  # 11 роутов
│       ├── auth.js
│       ├── profile.js
│       ├── matches.js
│       ├── predictions.js
│       ├── shop.js
│       ├── elo.js
│       ├── leagues.js
│       ├── withdrawals.js
│       ├── admin.js
│       ├── reviews.js
│       └── chat.js
│
├── database/
│   └── schema.sql               # 10 таблиц (UTF-8!)
│
├── .gitignore
├── README.md
├── CHANGELOG.md
└── CONTEXT.md
```

---

## 🚨 ВАЖНЫЕ ПРАВИЛА

### Бэкенд

1. **`.env` НЕ коммитить** — там `DB_PASSWORD` и `JWT_SECRET`. Уже в `.gitignore`.
2. **Порядок middleware в `server.js`:** CORS → JSON → логгер → ROUTES → health → 404 → error handler.
3. **`JWT_SECRET`** пока `fantasy_cs2_super_secret_change_me_in_prod_2026` — на проде менять.
4. **`bcrypt`** — `BCRYPT_ROUNDS = 10`.
5. **JWT** — срок жизни `7d`.
6. **Прогнозы** — только до `match_date` (серверная валидация).
7. **Один прогноз на рынок** — UNIQUE constraint в БД.
8. **`password_hash`** — никогда не отдавать клиенту (`sanitizeUser`).
9. **Антифлуд в чате** — 3 секунды между сообщениями.
10. **НИКОГДА не вставлять русский текст через `psql`** на Windows — кодировка ломается. Использовать **API** (Node.js работает в UTF-8).

### Фронт

1. Все глобальные переменные — в `config.js`.
2. Порядок скриптов фиксирован: `config → ... → main`.
3. `enterGame` объявлен **1 раз** в `auth.js`.
4. Админ — `users[ADMIN_USER]`.
5. `loadLeagueSettings()` защищён от битого объекта.
6. `CASE_TABLES` — в `shop.js`, `CASE_SKINS` — в `config.js`.
7. `activeBadges` — в `state.activeBadges`, тумблеры в профиле.

---

## 🔧 Ключевые команды

### Запуск backend

```bash
cd /d "C:\Users\Никита\Desktop\fantasy-cs2\backend"
npm run dev
```

Запускает `nodemon server.js` — авто-перезапуск при изменениях.

### PostgreSQL

```bash
# Проверка версии
psql --version

# Подключение к БД
psql -U postgres -d fantasy_cs2
# пароль: admin123

# Список таблиц
\dt
```

### Git

```bash
cd /d "C:\Users\Никита\Desktop\fantasy-cs2"
git add .
git commit -m "..."
git push
```

### Переменные окружения (`.env`)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fantasy_cs2
DB_USER=postgres
DB_PASSWORD=admin123
JWT_SECRET=fantasy_cs2_super_secret_change_me_in_prod_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 📌 Тестовые аккаунты

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Админ |
| `testplayer` | `test123` | Игрок |

> ⚠️ **Пароль админа** пока в placeholder — есть костыль в `routes/auth.js`. Надо будет захэшировать.

---

## 🎯 Стек продакшена (план)

| Компонент | Технология | Где хостится |
|-----------|-----------|--------------|
| Frontend | HTML/CSS/JS | Netlify (пока) |
| Backend | Node.js + Express | Railway |
| БД | PostgreSQL | Railway |
| Авторизация | JWT + bcrypt | — |
| Telegram-бот | node-telegram-bot-api | Railway |
| Домен | .ru | reg.ru |
| HTTPS | Let's Encrypt | автоматом |

### Стоимость

- **Домен:** ~200 ₽/год
- **Railway:** 0–500 ₽/мес
- **Netlify:** 0 ₽
- **Telegram-бот:** 0 ₽
- **ИТОГО:** ~500–700 ₽/мес

### Важно

- **Netlify блокируется РКН** — нужен VPN. На Этапе 6 переедем на РФ-хостинг или Cloudflare.
- **Backend локальный** — на проде будет на Railway.
- **Юридика/оферта** — не сейчас, только прямые выплаты вручную.

---

## 📅 План следующих сессий

### Сессия: Этап 4 (переключение фронта)

**Порядок модулей:**
1. `auth.js` — регистрация/логин через API
2. `profile.js` — профиль
3. `matches.js` — матчи
4. `predictions.js` — прогнозы (внутри matches)
5. `shop.js` — магазин + кейсы
6. `elo.js` — рейтинг
7. `leagues.js` — лиги
8. `withdrawals.js` — выводы
9. `admin.js` — админка
10. `reviews.js` — отзывы + выплаты
11. `chat.js` — чат
12. `wheel.js` — колесо
13. `achievements.js` — достижения
14. `live.js` — трансляции
15. `faq.js` — FAQ
16. `main.js` — роутер (обновить загрузку)
17. `utils.js` — заменить save/load

**Подход для каждого модуля:**
- Добавить `api.js` — обёртку над `fetch` с JWT-токеном
- Заменить `loadUsers()`, `saveState()` и т.д. на `apiCall('/api/...')`
- Тестировать: сайт должен работать локально (`localhost:3000` + `localhost:5500`)

### Сессия: Этап 5 (Telegram-бот)
- @BotFather → создать бота
- Backend endpoint для верификации
- Привязка 1 TG = 1 аккаунт

### Сессия: Этап 6 (прод)
- Деплой backend + БД на Railway
- Переезд фронта (или РФ-хостинг)
- Домен .ru
- HTTPS
```

---

## 📄 Файл 2 — `CHANGELOG.md`

````markdown
# Changelog

Все значимые изменения проекта.

## [v12.5] — 2026-10-01 (текущая)

### 🎉 Этап 3 — Backend API — ЗАВЕРШЁН

**9 роутов + ~51 эндпоинт, все работают:**

- **Auth** (3): register, login, me
- **Profile** (6): me, username, patch, buy-avatar, buy-frame, buy-cosmetic
- **Matches** (5): list, get, create, update, delete
- **Predictions** (3): create, my, match-view
- **Shop** (5): items, buy-booster, buy-insurance, open-case, open-pending-case
- **ELO** (4): ranks, top, rank, user
- **Leagues** (6): list, top, my, user, create, stop
- **Withdrawals** (4): levels, my, create, status
- **Admin** (7): accrue, withdrawals, pay, reject, players, ban, finish-match
- **Reviews** (5): list, payouts, create, pin, delete
- **Chat** (3): messages, send, delete
- **Health** (1): проверка БД

### Добавлено — Backend
- PostgreSQL 16.15 + БД `fantasy_cs2`
- Схема: 10 таблиц
- JWT-авторизация с 3 мидлварами
- bcrypt для паролей
- Валидация времени матчей
- Антифлуд в чате (3 сек)
- Уведомления игрокам о выплатах
- Бонус за задержку выплаты (+5 ₽/час)
- Пересчёт прогнозов после завершения матча
- Уровни вывода (10 / 200 / 500 ₽)

### Документация
- `CONTEXT.md` — обновлён (v12.5, Этап 3 закрыт, план Этапа 4)
- `README.md`, `CHANGELOG.md` — обновлены

### Исправлено
- Кодировка: русский текст теперь вставляется **только через API**, не через psql (WIN1251 → UTF8 проблема решена)

## [v12.4] — 2026-09-25

### Добавлено — Backend (начало)
- PostgreSQL 16.15 + schema
- Node.js + Express сервер
- Авторизация, матчи, прогнозы
- JWT-мидлвар

## [v12.3] — 2026-09-25

### Добавлено
- Кейсы: превью-модалка, мульти-призы, скины
- Значки в кастомизации (вкл/выкл)
- Вход/регистрация по Enter

### Исправлено
- 🔴 Значок «Король» в кастомизации
- 🔴 `pickCasePrize`, `applyCasePrize`, `openPendingCase`
- 🔴 `CASE_SKINS` внутрь `WHEEL_PRIZES`

## [v12.2] — 2026-09-18
- Разбивка на 17 модулей
- config.js, тестовый сервер

## [v12.1] — ранее
- Первые фиксы авторизации

## [v12.0] — ранее
- Базовый прототип
```

---

## 📄 Файл 3 — `README.md`

````markdown
# 🏆 Fantasy CS2

Веб-платформа для прогнозов на матчи CS2. Игроки угадывают победителя, kills игроков и тотал. За удачные прогнозы — очки, ELO и реальные призовые.

## 📌 Текущий статус
- **Версия:** v12.5
- **Фронт:** готов, работает на localStorage (задеплоен на Netlify)
- **Бэкенд:** **полностью готов** (Node.js + Express + PostgreSQL)
- **Следующий шаг:** Этап 4 — переключение фронта на API

## 🛠 Стек
- **Frontend:** чистый HTML/CSS/JS (без фреймворков)
- **Backend:** Node.js + Express + PostgreSQL 16
- **Авторизация:** JWT + bcrypt
- **Хостинг фронта:** Netlify (пока)
- **Хостинг бэка (план):** Railway

## 🔗 Ссылки
- **GitHub:** https://github.com/Astra1Gg/fantasy-cs2
- **Netlify (прод):** https://cheerful-chebakia-0e1c2e.netlify.app
- **Локальный бэкенд:** http://localhost:3000

## 🚀 Быстрый старт

### Вариант A — только фронт (прототип)

1. Открой `frontend/index.html` через **Live Server**.
2. Админ: логин `admin`, пароль `admin123`.

### Вариант B — с бэкендом (полная разработка)

**Требуется:** Node.js 18+, PostgreSQL 16+.

**1. Создай БД:**
```bash
psql -U postgres -c "CREATE DATABASE fantasy_cs2;"
psql -U postgres -d fantasy_cs2 -f database/schema.sql
```

**2. Настрой `.env`** (`backend/.env`):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fantasy_cs2
DB_USER=postgres
DB_PASSWORD=admin123
JWT_SECRET=change_me_in_prod
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**3. Запусти:**
```bash
cd backend
npm install
npm run dev
```

**4. Проверь:**
```bash
curl http://localhost:3000/api/health
```

## 📁 Структура

```
fantasy-cs2/
├── frontend/                    # Netlify (статика)
│   ├── index.html
│   ├── css/style.css
│   └── js/                      # 17 модулей
│
├── backend/                     # Node.js + Express
│   ├── server.js
│   ├── db.js
│   ├── middleware/auth.js
│   └── routes/                  # 11 роутов
│       ├── auth.js
│       ├── profile.js
│       ├── matches.js
│       ├── predictions.js
│       ├── shop.js
│       ├── elo.js
│       ├── leagues.js
│       ├── withdrawals.js
│       ├── admin.js
│       ├── reviews.js
│       └── chat.js
│
├── database/
│   └── schema.sql               # 10 таблиц
│
├── README.md
├── CHANGELOG.md
└── CONTEXT.md
```

## 📡 API (полный список)

**Auth:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Profile:**
- `GET /api/profile/me`
- `GET /api/profile/:username`
- `PATCH /api/profile/me`
- `POST /api/profile/buy-avatar`
- `POST /api/profile/buy-frame`
- `POST /api/profile/buy-cosmetic`

**Matches / Predictions:**
- `GET /api/matches`
- `GET /api/matches/:id`
- `POST /api/matches` (admin)
- `PUT /api/matches/:id` (admin)
- `DELETE /api/matches/:id` (admin)
- `POST /api/predictions` (auth)
- `GET /api/predictions/my` (auth)

**Shop:**
- `GET /api/shop/items`
- `POST /api/shop/buy-booster`
- `POST /api/shop/buy-insurance`
- `POST /api/shop/open-case`
- `POST /api/shop/open-pending-case`

**ELO / Leagues:**
- `GET /api/elo/ranks`
- `GET /api/elo/top`
- `GET /api/elo/rank` (auth)
- `GET /api/leagues`
- `GET /api/leagues/:type/top`
- `GET /api/leagues/my` (auth)

**Withdrawals:**
- `GET /api/withdrawals/levels` (auth)
- `GET /api/withdrawals/my` (auth)
- `POST /api/withdrawals/create` (auth)

**Admin:**
- `POST /api/admin/accrue`
- `GET /api/admin/withdrawals`
- `POST /api/admin/withdrawals/:id/pay`
- `POST /api/admin/withdrawals/:id/reject`
- `GET /api/admin/players`
- `POST /api/admin/players/:username/ban`
- `POST /api/admin/matches/:id/finish`

**Reviews / Chat:**
- `GET /api/reviews`
- `GET /api/reviews/payouts`
- `POST /api/reviews` (auth)
- `GET /api/chat/messages`
- `POST /api/chat/messages` (auth)

## 🔐 Тестовые аккаунты

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Админ |
| `testplayer` | `test123` | Игрок |

## 📅 План развития
- [x] Прототип (localStorage)
- [x] Деплой фронта на Netlify
- [x] PostgreSQL + schema
- [x] **Backend API (все 11 роутов)**
- [ ] Этап 4 — переключение фронта на API
- [ ] Telegram-бот
- [ ] Деплой на прод (Railway + РФ-хостинг)
```

---

## 🎯 Как обновить

1. Открой `CONTEXT.md` в VS Code → **Ctrl+A** → **Delete** → вставь новый → **Ctrl+S**.
2. То же для `CHANGELOG.md`.
3. То же для `README.md`.
4. Пуш:

```bat
cd /d "C:\Users\Никита\Desktop\fantasy-cs2" && git add . && git commit -m "docs: update CONTEXT, CHANGELOG, README — Этап 3 закрыт" && git push
```

---

## 📌 Что мне написать

1. **Проверил GitHub** — 11 файлов в `backend/routes/`?
2. **Обновил 3 файла документации?**
3. **Пуш прошёл?**

---

## 🎉 Отличная работа!

Сегодня сделано **невероятно много**:
- ✅ 9 роутов бэкенда
- ✅ ~51 эндпоинт
- ✅ Полный цикл выплаты (игрок → админ → выплата)
- ✅ Чат с антифлудом
- ✅ Отзывы + реальные выплаты
- ✅ 3 лиги, ELO, магазин, профиль

**Бэкенд готов на 100%.** Дальше — **Этап 4** (переключение фронта), но это **отдельная большая сессия**.

**Отдыхай! Когда вернёшься — прикрепи `CONTEXT.md`, и продолжим.** 🚀