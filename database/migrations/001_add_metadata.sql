-- ============================================================
--  Migration 001: add metadata, daily_streak, last_wheel_spin
--  Date: 2026-10-01
--  Stage: 4 (Frontend → API)
-- ============================================================

BEGIN;

-- 1. metadata — для полей, которых нет в основной схеме
--    (referralTracking, notification-настройки, wheelReminderClosed и т.д.)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. daily_streak — ежедневный вход
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS daily_streak INT DEFAULT 0;

-- 3. last_wheel_spin — когда последний раз крутили колесо
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_wheel_spin TIMESTAMPTZ DEFAULT NULL;

-- 4. Индекс для metadata (быстрый поиск по JSONB, опционально)
CREATE INDEX IF NOT EXISTS idx_users_metadata_gin
  ON users USING gin (metadata);

COMMIT;

-- ============================================================
--  Проверка:
--  \d users
-- ============================================================