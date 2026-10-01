# Changelog

Все значимые изменения проекта.

## [v12.5] — 2026-10-01 (текущая)

### 🎉 Этап 3 — Backend API — ЗАВЕРШЁН

**11 роутов + ~51 эндпоинт, все работают:**

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