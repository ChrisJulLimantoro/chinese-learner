DELETE FROM word_questions a
USING word_questions b
WHERE a.word_id = b.word_id
  AND md5(a.question->>'prompt') = md5(b.question->>'prompt')
  AND a.id > b.id;

ALTER TABLE word_questions
  ADD COLUMN IF NOT EXISTS prompt_hash TEXT GENERATED ALWAYS AS (md5(question->>'prompt')) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS idx_word_questions_word_prompt
  ON word_questions (word_id, prompt_hash);
