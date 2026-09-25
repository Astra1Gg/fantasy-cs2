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

## 🎯 ТЕКУЩИЙ СТАТУС (обновлено 25.09.2026)

### ✅ Что ГОТОВО

**Фронт (v12.3):**
- 17 JS-модулей + `config.js` + `index.html` + `style.css`
- Авторизация, регистрация, TG-верификация (демо)
- Прогнозы на 3 рынка (победитель, kills, тотал)
- ELO + ранги, лиги, колесо, магазин, кейсы, скины, значки
- Вход/регистрация по Enter
- Всё работает локально на localStorage

**Бэкенд (Этап 3, дни 1-3):**
- PostgreSQL 16.15 + БД `fantasy_cs2`
- Схема: **10 таблиц** — `users`, `matches`, `predictions`, `withdrawals`, `leagues`, `league_points`, `chat_messages`, `reviews`, `achievements`, `notifications`
- Node.js + Express + `pg` + `bcrypt` + `jsonwebtoken`

**Авторизация:**
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/login`
- ✅ `GET /api/auth/me`
- ✅ JWT-мидлвар: `authRequired`, `adminRequired`, `authOptional`

**Матчи:**
- ✅ `GET /api/matches`
- ✅ `GET /api/matches/:id`
- ✅ `POST /api/matches` (admin)
- ✅ `PUT /api/matches/:id` (admin)
- ✅ `DELETE /api/matches/:id` (admin)

**Прогнозы:**
- ✅ `POST /api/predictions` (auth)
- ✅ `GET /api/predictions/my` (auth)
- ✅ `GET /api/predictions/match/:matchId` (admin)

**Прочее:**
- ✅ `GET /api/health` — проверка подключения к БД

**Документация:**
- `CONTEXT.md`, `CHANGELOG.md`, `README.md` — актуальны

### 🔜 Что ДАЛЬШЕ (план 6 этапов)

**Этап 3 (продолжение):**
- **День 4** — Профиль, лиги, ELO, колесо, магазин (API)
- **День 5** — Выводы (API)
- **День 6** — Админка (API)
- **День 7** — Чат WebSocket + отзывы + достижения (API)

**Этап 4:** Переключение фронта на API (замена localStorage → fetch)

**Этап 5:** Telegram-бот (реальный, не демо)

**Этап 6:** Деплой на прод (Railway + РФ-хостинг, домен .ru)

---

## 🏗 Структура проекта

```
fantasy-cs2/
├── frontend/                    # Netlify (статика)
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
│   └── routes/
│       ├── auth.js              # /api/auth/*
│       ├── matches.js           # /api/matches/*
│       └── predictions.js       # /api/predictions/*
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

| Логин | Пароль | Роль | Где создан |
|-------|--------|------|-----------|
| `admin` | `admin123` | Админ | `schema.sql` (seed, пароль — placeholder!) |
| `testplayer` | `test123` | Игрок | через `POST /api/auth/register` |

> ⚠️ **Пароль админа** пока в placeholder — есть костыль в `routes/auth.js` для входа. Надо будет захэшировать.

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

### Сессия 2 (День 4)
- `routes/profile.js` — профиль, косметика, значки
- `routes/shop.js` — магазин, кейсы, покупки
- `routes/elo.js` — рейтинг
- `routes/leagues.js` — лиги

### Сессия 3 (День 5)
- `routes/withdrawals.js` — выводы
- Валидация реквизитов, бонусы за задержку

### Сессия 4 (День 6)
- `routes/admin.js` — админка (начисления, выплаты, результаты матчей)
- Логика пересчёта прогнозов после матча

### Сессия 5 (День 7)
- `routes/chat.js` — WebSocket
- `routes/reviews.js` — отзывы + скриншоты выплат
- Достижения

### Сессия 6+ (Этап 4)
- Переключение фронта на API
- Замена localStorage на fetch
- 17 модулей по очереди

### Сессия N (Этапы 5-6)
- Telegram-бот
- Деплой на Railway
- Домен .ru
- РФ-хостинг фронта