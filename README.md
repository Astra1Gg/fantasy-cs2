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