// ============================================================
//  FANTASY CS2 — BACKEND API
//  Точка входа
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const matchesRoutes = require('./routes/matches');
const predictionsRoutes = require('./routes/predictions');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  MIDDLEWARE
// ============================================================
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Простой логгер запросов
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const dur = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${dur}ms)`);
  });
  next();
});
// ============================================================
//  ROUTES
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/predictions', predictionsRoutes);

// ============================================================
//  HEALTH CHECK
// ============================================================
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as now, current_database() as db, version() as version');
    res.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      db: {
        name: result.rows[0].db,
        server_time: result.rows[0].now,
        version: result.rows[0].version.split(' ').slice(0, 2).join(' '),
      },
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      status: 'unhealthy',
      error: err.message,
    });
  }
});

// ============================================================
//  ROOT
// ============================================================
app.get('/', (req, res) => {
  res.json({
    name: 'Fantasy CS2 API',
    version: '0.1.0',
    endpoints: [
  'GET    /api/health',
  'POST   /api/auth/register',
  'POST   /api/auth/login',
  'GET    /api/auth/me',
  'GET    /api/matches',
  'GET    /api/matches/:id',
  'POST   /api/matches          (admin)',
  'PUT    /api/matches/:id      (admin)',
  'DELETE /api/matches/:id      (admin)',
  'POST   /api/predictions      (auth)',
  'GET    /api/predictions/my   (auth)',
    ],
  });
});

// ============================================================
//  404 — не найдено
// ============================================================
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found', path: req.originalUrl });
});

// ============================================================
//  ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ ok: false, error: err.message || 'Internal server error' });
});

// ============================================================
//  СТАРТ СЕРВЕРА
// ============================================================
async function start() {
  console.log('🚀 Запуск Fantasy CS2 Backend...');
  console.log(`📍 PORT=${PORT}, NODE_ENV=${process.env.NODE_ENV}`);

  const dbOk = await db.testConnection();
  if (!dbOk) {
    console.error('❌ Не удалось запустить сервер: нет подключения к БД');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

start();