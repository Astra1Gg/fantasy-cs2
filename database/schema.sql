-- ============================================================
--  FANTASY CS2 — схема PostgreSQL
--  Версия: v12.3
--  СУБД: PostgreSQL 16+
-- ============================================================

-- Расширения (для UUID и удобных типов)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  USERS — игроки
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  username        VARCHAR(30) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  email           VARCHAR(120),
  telegram_id     VARCHAR(50) UNIQUE,
  fingerprint     VARCHAR(64),
  ref_code        VARCHAR(10) UNIQUE,
  referred_by     VARCHAR(30),
  
  -- Игровые поля
  elo             INTEGER NOT NULL DEFAULT 1000,
  best_elo        INTEGER NOT NULL DEFAULT 1000,
  fantasy_points  INTEGER NOT NULL DEFAULT 100,
  rubles          INTEGER NOT NULL DEFAULT 0,
  streak          INTEGER NOT NULL DEFAULT 0,
  best_streak     INTEGER NOT NULL DEFAULT 0,
  kills_streak    INTEGER NOT NULL DEFAULT 0,
  underdog_wins   INTEGER NOT NULL DEFAULT 0,
  daily_streak    INTEGER NOT NULL DEFAULT 0,
  
  -- Статистика
  total_predictions INTEGER NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  cases_opened    INTEGER NOT NULL DEFAULT 0,
  total_spins     INTEGER NOT NULL DEFAULT 0,
  activity_actions INTEGER NOT NULL DEFAULT 0,
  chat_messages   INTEGER NOT NULL DEFAULT 0,
  withdraw_count  INTEGER NOT NULL DEFAULT 0,
  prizes_count    INTEGER NOT NULL DEFAULT 0,
  
  -- Профиль (косметика)
  avatar          VARCHAR(20) DEFAULT 'default',
  frame           VARCHAR(20) DEFAULT 'none',
  active_nick_effect VARCHAR(30),
  active_badges   JSONB DEFAULT '{}'::jsonb,
  cosmetics       JSONB DEFAULT '[]'::jsonb,
  inventory       JSONB DEFAULT '[]'::jsonb,
  
  -- Инвентарь (бустеры, страховки, кейсы)
  bonuses         JSONB DEFAULT '{"boosters":[],"insurance":[],"pendingCases":[]}'::jsonb,
  
  -- Мета
  verified        BOOLEAN DEFAULT FALSE,
  banned          BOOLEAN DEFAULT FALSE,
  ban_reason      TEXT,
  is_admin        BOOLEAN DEFAULT FALSE,
  last_active_day DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_elo          ON users(elo DESC);
CREATE INDEX idx_users_points       ON users(fantasy_points DESC);
CREATE INDEX idx_users_ref_code     ON users(ref_code);
CREATE INDEX idx_users_telegram     ON users(telegram_id);
CREATE INDEX idx_users_fingerprint  ON users(fingerprint);

-- ============================================================
--  MATCHES — матчи CS2
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id              BIGSERIAL PRIMARY KEY,
  external_id     VARCHAR(50) UNIQUE,
  team_a          VARCHAR(60) NOT NULL,
  team_b          VARCHAR(60) NOT NULL,
  match_date      TIMESTAMPTZ NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  score_a         INTEGER,
  score_b         INTEGER,
  best_of         INTEGER DEFAULT 3,
  
  -- Рынки (JSONB — гибко для будущих расширений)
  markets         JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Результаты
  result_winner   VARCHAR(60),
  result_total_kills INTEGER,
  result_player_kills JSONB,
  
  -- Трансляции
  twitch_url      VARCHAR(255),
  kick_url        VARCHAR(255),
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matches_date   ON matches(match_date DESC);
CREATE INDEX idx_matches_status ON matches(status);

-- ============================================================
--  PREDICTIONS — прогнозы игроков
-- ============================================================
CREATE TABLE IF NOT EXISTS predictions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id        BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  market          VARCHAR(50) NOT NULL,
  pick            VARCHAR(50) NOT NULL,
  line_value      NUMERIC(10,2),
  
  -- Результат (заполняется после матча)
  is_correct      BOOLEAN,
  points_awarded  INTEGER,
  elo_delta       INTEGER,
  bonus_awarded   INTEGER DEFAULT 0,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  
  UNIQUE (user_id, match_id, market)
);

CREATE INDEX idx_predictions_user   ON predictions(user_id);
CREATE INDEX idx_predictions_match  ON predictions(match_id);
CREATE INDEX idx_predictions_unresolved ON predictions(match_id) WHERE is_correct IS NULL;

-- ============================================================
--  WITHDRAWALS — заявки на вывод
-- ============================================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  number          INTEGER NOT NULL,
  amount          INTEGER NOT NULL,
  bonus           INTEGER NOT NULL DEFAULT 0,
  method          VARCHAR(50) NOT NULL,
  requisites      TEXT NOT NULL,
  requisites_display TEXT,
  
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  screenshot_url  TEXT,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  rejected_reason TEXT
);

CREATE INDEX idx_withdrawals_user    ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status  ON withdrawals(status);
CREATE INDEX idx_withdrawals_created ON withdrawals(created_at DESC);

-- ============================================================
--  LEAGUES — лиги (ежедневные, недельные, месячные, спец)
-- ============================================================
CREATE TABLE IF NOT EXISTS leagues (
  id              BIGSERIAL PRIMARY KEY,
  type            VARCHAR(20) NOT NULL,
  name            VARCHAR(100),
  start_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_days   INTEGER NOT NULL,
  prizes          JSONB NOT NULL DEFAULT '[]'::jsonb,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leagues_active ON leagues(active) WHERE active = TRUE;

-- ============================================================
--  LEAGUE_POINTS — очки игроков в лигах
-- ============================================================
CREATE TABLE IF NOT EXISTS league_points (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  league_id       BIGINT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  points          INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, league_id)
);

CREATE INDEX idx_league_points_league ON league_points(league_id, points DESC);

-- ============================================================
--  CHAT_MESSAGES — сообщения чата
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text            VARCHAR(200) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_created ON chat_messages(created_at DESC);

-- ============================================================
--  REVIEWS — отзывы и реальные выплаты
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
  author_name     VARCHAR(30) NOT NULL,
  type            VARCHAR(20) NOT NULL DEFAULT 'text',
  text            TEXT,
  image_url       TEXT,
  screenshot_url  TEXT,
  amount          INTEGER,
  is_admin        BOOLEAN DEFAULT FALSE,
  pinned          BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_type    ON reviews(type);
CREATE INDEX idx_reviews_pinned  ON reviews(pinned, created_at DESC);

-- ============================================================
--  ACHIEVEMENTS — разблокированные достижения игроков
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id  VARCHAR(50) NOT NULL,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_achievements_user ON achievements(user_id);

-- ============================================================
--  NOTIFICATIONS — уведомления игрокам
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  text            TEXT,
  reason          TEXT,
  seen            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, seen, created_at DESC);

-- ============================================================
--  TRIGGER: обновление updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_league_points_updated_at
  BEFORE UPDATE ON league_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
--  SEED: администратор по умолчанию
--  Логин: admin / Пароль: admin123 (временный, надо хэшировать позже)
-- ============================================================
INSERT INTO users (username, password_hash, is_admin, verified, ref_code, fantasy_points, rubles)
VALUES ('admin', '$2b$10$temp_placeholder_will_be_hashed', TRUE, TRUE, 'ADMIN1', 999999, 0)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
--  END OF SCHEMA
-- ============================================================