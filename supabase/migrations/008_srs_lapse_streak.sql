ALTER TABLE srs_state ADD COLUMN IF NOT EXISTS lapse_streak INTEGER NOT NULL DEFAULT 0;

UPDATE srs_state SET lapse_streak = 0;
