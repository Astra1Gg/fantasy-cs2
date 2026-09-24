# 🤖 CONTEXT — контекст для ИИ

Этот файл читается **первым** в новом чате. Даёт ИИ понимание проекта без чтения всего кода.

---

## Что это за проект

**Fantasy CS2** — веб-платформа для прогнозов на матчи CS2. Прототип на localStorage.
Стек: HTML/CSS/JS (без фреймворков). Файлов: 17 JS + 1 CSS + 1 HTML.

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

## Что ИИ должен знать про архитектуру

### Функция `renderPage(page)` (в `main.js`)
Центральный роутер. Переключает страницы:
- `matches`, `live`, `league`, `elo`, `wheel`, `shop`, `profile`, `faq`, `reviews`, `admin`

**Каждая страница — своя функция `render*Page()`**, возвращает HTML-строку.

### Паттерн работы с данными
```js
// Чтение
const users = loadUsers();

// Изменение
users[name].fantasyPoints += 100;

// Сохранение
localStorage.setItem('fs2_users', JSON.stringify(users));

// Обновление UI
updateHeader();
renderPage('current-page');

ВАЖНО: сохранение state и users
state — текущий игрок (упрощённый доступ)

users — все игроки

saveUsers() — синхронизирует state → users[currentUser]

После изменений всегда saveState() или saveUsers()


---

# 🎯 ТЕКУЩАЯ ЗАДАЧА (обновлено 18.09.2026)

## Цель
Довести проект до продакшена: сайт работает в интернете 24/7, реальная БД,
Telegram-бот для верификации, игроки заходят и играют.

## Согласованный план (6 этапов)

### Этап 1: Деплой фронта на Netlify (1 день)
- Регистрация на GitHub
- Загрузка проекта
- Подключение Netlify → публичная ссылка
- Результат: работающая ссылка

### Этап 2: Схема PostgreSQL (1 день)
- Установка PostgreSQL локально
- Таблицы: users, matches, predictions, withdrawals, leagues,
  chat_messages, reviews, achievements, notifications
- Готовый schema.sql

### Этап 3: Backend API на Node.js (5-7 дней)
День 1-2: Авторизация (register, login, /me, JWT, bcrypt)
День 3: Матчи и прогнозы (с серверной валидацией времени)
День 4: Профиль, лиги, ELO, колесо, магазин
День 5: Выводы (create, list)
День 6: Админка (начисления, выплаты, матчи)
День 7: Чат (WebSocket) + отзывы + достижения

### Этап 4: Переключение фронта на API (2-3 дня)
- Замена localStorage → fetch('/api/...')
- Все 17 модулей по очереди
- Тестирование

### Этап 5: Telegram-бот (1-2 дня)
- Создание бота в @BotFather
- Backend endpoint для верификации
- Привязка 1 TG = 1 аккаунт

### Этап 6: Деплой на прод (2-3 дня)
- Railway: бэкенд + PostgreSQL
- Netlify: фронт
- Домен (reg.ru)
- HTTPS автоматом
- Финальные тесты

## Стек продакшена

| Компонент | Технология | Где хостится |
|-----------|-----------|--------------|
| Frontend | HTML/CSS/JS | Netlify |
| Backend | Node.js + Express | Railway |
| БД | PostgreSQL | Railway |
| Авторизация | JWT + bcrypt | — |
| Telegram-бот | node-telegram-bot-api | Railway |
| Домен | .ru | reg.ru |
| HTTPS | Let's Encrypt | автоматом |

## Стоимость продакшена
- Домен: ~200 ₽/год
- Хостинг (Railway): 0–500 ₽/мес
- Netlify: 0 ₽
- Telegram-бот: 0 ₽
- ИТОГО: ~500–700 ₽/мес

## Важно
- Локальный сервер (на ПК) — только для разработки
- Продакшен — в облаке (Railway), работает 24/7 без твоего ПК
- Юридика/оферта/платёжка — НЕ сейчас, только прямые выплаты вручную

## Начинаем с
Этап 1 — деплой фронта на Netlify.