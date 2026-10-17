CREATE TABLE IF NOT EXISTS word_questions (
  id               SERIAL PRIMARY KEY,
  word_id          INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  type             TEXT    NOT NULL,
  question         JSONB   NOT NULL,
  accepted_answers TEXT[]  NOT NULL DEFAULT '{}',
  reference_answer TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_word_questions_word_id ON word_questions (word_id);

ALTER TABLE word_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_questions_select_authenticated"
  ON word_questions FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.word_questions TO authenticated;
