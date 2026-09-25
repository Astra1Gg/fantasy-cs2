# 🏆 Fantasy CS2

Веб-платформа для прогнозов на матчи CS2. Игроки угадывают победителя, kills игроков и тотал. За удачные прогнозы — очки, ELO и реальные призовые.

## 📌 Текущий статус
- **Версия:** v12.4
- **Режим:** гибрид — фронт на localStorage, бэкенд на PostgreSQL (в разработке)
- **Фронт:** готов, задеплоен на Netlify (работает под VPN)
- **Бэкенд:** локально, API готово для авторизации, матчей, прогнозов
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

1. Открой `frontend/index.html` в браузере (лучше — через **Live Server** в VS Code).
2. Админ: логин `admin`, пароль `admin123`.
3. Игрок: зарегистрируйся сам.

### Вариант B — с бэкендом (полная разработка)

**Требуется:**
- Node.js 18+
- PostgreSQL 16+

**1. Установи PostgreSQL и создай БД:**

```bash
psql -U postgres -c "CREATE DATABASE fantasy_cs2;"
psql -U postgres -d fantasy_cs2 -f database/schema.sql
```

**2. Настрой `.env`** (создай `backend/.env`):

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

**3. Установи зависимости и запусти:**

```bash
cd backend
npm install
npm run dev
```

**4. Проверь:**

```bash
curl http://localhost:3000/api/health
```

Должен вернуть JSON с `"ok": true`.

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
│   └── routes/
│       ├── auth.js
│       ├── matches.js
│       └── predictions.js
│
├── database/
│   └── schema.sql               # 10 таблиц
│
├── README.md
├── CHANGELOG.md
└── CONTEXT.md
```

## 🎮 Как работает (для игрока)
1. Регистрация (с капчей и TG-верификацией — пока демо)
2. Прогнозы на 3 рынка: победитель, kills игрока, тотал
3. Очки → магазин (бустеры, страховки, кейсы, косметика, значки)
4. ELO → ранги с наградами
5. Лиги (ежедневно/недельно/месячно) → реальные призовые
6. Выводы: СБП/карта/ЮMoney

## 📡 API (что готово)

| Метод | Endpoint | Auth | Описание |
|-------|----------|------|----------|
| GET | `/api/health` | — | Проверка подключения к БД |
| POST | `/api/auth/register` | — | Регистрация |
| POST | `/api/auth/login` | — | Вход |
| GET | `/api/auth/me` | JWT | Текущий пользователь |
| GET | `/api/matches` | opt | Список матчей |
| GET | `/api/matches/:id` | opt | Один матч |
| POST | `/api/matches` | admin | Создать матч |
| PUT | `/api/matches/:id` | admin | Обновить матч |
| DELETE | `/api/matches/:id` | admin | Удалить матч |
| POST | `/api/predictions` | JWT | Сделать прогноз |
| GET | `/api/predictions/my` | JWT | Мои прогнозы |
| GET | `/api/predictions/match/:id` | admin | Прогнозы на матч |

## 🔐 Тестовые аккаунты

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Админ |
| `testplayer` | `test123` | Игрок |

## 📅 План развития
- [x] Прототип (localStorage)
- [x] Деплой фронта на Netlify
- [x] Кейсы, скины, значки, вход по Enter
- [x] PostgreSQL + schema
- [x] Backend: авторизация, матчи, прогнозы
- [ ] Backend: профиль, магазин, ELO, лиги
- [ ] Backend: выводы
- [ ] Backend: админка
- [ ] Backend: чат WebSocket + отзывы
- [ ] Переключение фронта на API
- [ ] Telegram-бот
- [ ] Деплой на прод (Railway + РФ-хостинг)