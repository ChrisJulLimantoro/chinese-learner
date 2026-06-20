-- ==========================================================================
-- 001_initial_schema.sql
-- Chinese Learner — Supabase schema + RLS + auth trigger (multi-user)
-- Apply via: Supabase dashboard → SQL editor, or `supabase db push`
-- ==========================================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------------
-- words (shared, read-only for authenticated users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS words (
  id              SERIAL PRIMARY KEY,
  simplified      TEXT    NOT NULL,
  traditional     TEXT,
  pinyin          TEXT    NOT NULL,
  hsk_level       INTEGER NOT NULL CHECK (hsk_level BETWEEN 1 AND 6),
  frequency_rank  INTEGER,
  pos             JSONB,           -- string[]
  meanings        JSONB,           -- string[]
  measure_word    JSONB,           -- {mw: string, pinyin: string} | null
  lesson_card     JSONB            -- cached rich card (null until generated)
);

CREATE INDEX IF NOT EXISTS idx_words_hsk_level    ON words (hsk_level);
CREATE INDEX IF NOT EXISTS idx_words_freq_rank    ON words (hsk_level, frequency_rank ASC NULLS LAST);

-- RLS: authenticated users can read; writes via service role only (bypasses RLS)
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "words_select_authenticated"
  ON words FOR SELECT
  TO authenticated
  USING (true);

-- --------------------------------------------------------------------------
-- accepted_answers (shared grader cache, service-role writes)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accepted_answers (
  id                SERIAL PRIMARY KEY,
  word_id           INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  question_type     TEXT,
  normalized_answer TEXT    NOT NULL,
  verdict           JSONB   NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accepted_answers_lookup
  ON accepted_answers (word_id, question_type, normalized_answer);

ALTER TABLE accepted_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accepted_answers_select_authenticated"
  ON accepted_answers FOR SELECT
  TO authenticated
  USING (true);

-- --------------------------------------------------------------------------
-- profiles (per user)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  user_id             UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_hsk_level   INTEGER NOT NULL DEFAULT 2,
  study_streak_days   INTEGER NOT NULL DEFAULT 0,
  last_study_date     DATE
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own"
  ON profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- srs_state (per user)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS srs_state (
  user_id         UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id         INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  box             INTEGER NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 5),
  next_review_at  DOUBLE PRECISION NOT NULL DEFAULT 0, -- unix seconds
  correct_count   INTEGER NOT NULL DEFAULT 0,
  wrong_count     INTEGER NOT NULL DEFAULT 0,
  hesitated_count INTEGER NOT NULL DEFAULT 0,
  mastered        BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_srs_next_review
  ON srs_state (user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_srs_mastered
  ON srs_state (user_id, mastered);

ALTER TABLE srs_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srs_state_own"
  ON srs_state FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- sessions (per user)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id                SERIAL PRIMARY KEY,
  user_id           UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind              TEXT    NOT NULL,  -- new_drop | review | mixed | redrill | custom
  status            TEXT    NOT NULL DEFAULT 'in_progress',  -- in_progress | completed | abandoned
  created_at        DOUBLE PRECISION NOT NULL,   -- unix seconds
  completed_at      DOUBLE PRECISION,
  cursor            INTEGER NOT NULL DEFAULT 0,
  parent_session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  config            JSONB
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_created
  ON sessions (user_id, created_at DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_own"
  ON sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- session_items (per user, denormalized user_id for RLS)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_items (
  id               SERIAL PRIMARY KEY,
  session_id       INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id          UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_index      INTEGER NOT NULL,
  word_id          INTEGER NOT NULL REFERENCES words(id),
  question         JSONB   NOT NULL,  -- {type, prompt, target_word, context}
  user_answer      TEXT,              -- null until answered
  grader_output    JSONB,             -- null until answered
  response_time_ms INTEGER,
  outcome          TEXT               -- correct | wrong | hesitated
);

CREATE INDEX IF NOT EXISTS idx_session_items_session
  ON session_items (session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_session_items_user
  ON session_items (user_id);

ALTER TABLE session_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_items_own"
  ON session_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- Trigger: auto-create profiles row on new user signup
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, current_hsk_level)
  VALUES (NEW.id, 2)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
