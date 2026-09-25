// ============================================================
//  ПОДКЛЮЧЕНИЕ К POSTGRESQL
// ============================================================
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Ошибка пула PostgreSQL:', err.message);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 SQL (${duration}ms):`, text.substring(0, 80) + (text.length > 80 ? '...' : ''));
    }
    return result;
  } catch (err) {
    console.error('❌ SQL Error:', err.message);
    console.error('   Query:', text);
    console.error('   Params:', params);
    throw err;
  }
}

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log(`✅ PostgreSQL подключён: БД=${res.rows[0].db}, время=${res.rows[0].now.toISOString()}`);
    return true;
  } catch (err) {
    console.error('❌ Не удалось подключиться к PostgreSQL:', err.message);
    return false;
  }
}

module.exports = { query, pool, testConnection };