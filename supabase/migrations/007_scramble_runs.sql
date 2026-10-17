CREATE TABLE IF NOT EXISTS scramble_runs (
  id         SERIAL PRIMARY KEY,
  user_id    UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  score      INTEGER NOT NULL DEFAULT 0,
  found      JSONB   NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_scramble_runs_user ON scramble_runs (user_id, created_at DESC);

ALTER TABLE scramble_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scramble_runs_own"
  ON scramble_runs FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scramble_runs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.scramble_runs_id_seq TO authenticated;
