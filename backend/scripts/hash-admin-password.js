// ============================================================
//  Хэширование пароля админа
//  Запуск: node scripts/hash-admin-password.js
// ============================================================
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../db');

const ADMIN_USERNAME = 'admin';
const NEW_PASSWORD = 'admin123'; // ⚠️ поменяй на проде!
const BCRYPT_ROUNDS = 10;

async function main() {
  console.log('🔐 Хэширование пароля админа...');

  const hash = await bcrypt.hash(NEW_PASSWORD, BCRYPT_ROUNDS);
  console.log(`   Новый hash: ${hash.substring(0, 30)}...`);

  const result = await db.query(
    `UPDATE users
     SET password_hash = $1,
         is_admin = TRUE,
         verified = TRUE
     WHERE username = $2
     RETURNING id, username, is_admin`,
    [hash, ADMIN_USERNAME]
  );

  if (result.rows.length === 0) {
    console.error(`❌ Пользователь "${ADMIN_USERNAME}" не найден в БД`);
    process.exit(1);
  }

  const u = result.rows[0];
  console.log(`✅ Обновлён: id=${u.id}, username=${u.username}, is_admin=${u.is_admin}`);

  // Проверка: сравниваем пароль с новым хэшем
  const ok = await bcrypt.compare(NEW_PASSWORD, hash);
  console.log(`   Проверка compare(): ${ok ? '✅ OK' : '❌ FAIL'}`);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});