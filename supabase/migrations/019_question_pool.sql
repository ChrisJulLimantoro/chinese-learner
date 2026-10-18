CREATE INDEX IF NOT EXISTS idx_session_items_user_word
  ON session_items (user_id, word_id, id DESC);

CREATE OR REPLACE FUNCTION public.pick_questions(
  p_word_ids INTEGER[],
  p_types_by_box JSONB DEFAULT '{}'::jsonb,
  p_default_box INTEGER DEFAULT 1,
  p_exclude_bank_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
  word_id INTEGER,
  box INTEGER,
  bank_id INTEGER,
  question JSONB,
  accepted_answers TEXT[],
  reference_answer TEXT,
  bank_size INTEGER,
  type_counts JSONB,
  exhausted BOOLEAN
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  WITH ids AS (
    SELECT DISTINCT unnest(p_word_ids) AS word_id
  ),
  wanted AS (
    SELECT i.word_id, COALESCE(st.box, p_default_box) AS box
    FROM ids i
    LEFT JOIN srs_state st ON st.user_id = auth.uid() AND st.word_id = i.word_id
  ),
  live AS (
    SELECT q.id, q.word_id, q.type, q.question, q.accepted_answers, q.reference_answer
    FROM word_questions q
    JOIN wanted w ON w.word_id = q.word_id
    WHERE NOT q.retired
  ),
  seen AS (
    SELECT si.word_id, (si.question->>'bank_id')::integer AS bank_id, max(si.id) AS last_id
    FROM session_items si
    JOIN wanted w ON w.word_id = si.word_id
    WHERE si.user_id = auth.uid() AND si.question->>'bank_id' IS NOT NULL
    GROUP BY si.word_id, (si.question->>'bank_id')::integer
  ),
  candidates AS (
    SELECT l.*, s.last_id,
      l.type IN (
        SELECT jsonb_array_elements_text(COALESCE(p_types_by_box->(w.box::text), '[]'::jsonb))
      ) AS is_preferred
    FROM live l
    JOIN wanted w ON w.word_id = l.word_id
    LEFT JOIN seen s ON s.word_id = l.word_id AND s.bank_id = l.id
  ),
  per_type AS (
    SELECT c.word_id, c.type, count(*)::integer AS n FROM candidates c GROUP BY c.word_id, c.type
  ),
  stats AS (
    SELECT t.word_id, sum(t.n)::integer AS bank_size, jsonb_object_agg(t.type, t.n) AS type_counts
    FROM per_type t GROUP BY t.word_id
  ),
  coverage AS (
    SELECT c.word_id,
      COALESCE(bool_and(c.last_id IS NOT NULL) FILTER (WHERE c.is_preferred), bool_and(c.last_id IS NOT NULL)) AS exhausted
    FROM candidates c GROUP BY c.word_id
  ),
  picked AS (
    SELECT DISTINCT ON (c.word_id) c.word_id, c.id, c.question, c.accepted_answers, c.reference_answer
    FROM candidates c
    WHERE c.id IS DISTINCT FROM p_exclude_bank_id
    ORDER BY c.word_id, c.is_preferred DESC, c.last_id ASC NULLS FIRST, c.id
  )
  SELECT w.word_id, w.box, p.id, p.question, p.accepted_answers, p.reference_answer,
    COALESCE(s.bank_size, 0), COALESCE(s.type_counts, '{}'::jsonb), COALESCE(v.exhausted, true)
  FROM wanted w
  LEFT JOIN picked p ON p.word_id = w.word_id
  LEFT JOIN stats s ON s.word_id = w.word_id
  LEFT JOIN coverage v ON v.word_id = w.word_id;
$$;

REVOKE EXECUTE ON FUNCTION public.pick_questions(INTEGER[], JSONB, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pick_questions(INTEGER[], JSONB, INTEGER, INTEGER) TO authenticated;
