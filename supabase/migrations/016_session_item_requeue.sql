ALTER TABLE session_items ADD COLUMN IF NOT EXISTS is_requeue BOOLEAN NOT NULL DEFAULT false;

DROP FUNCTION IF EXISTS public.finalize_session_item(INTEGER, TEXT, JSONB, INTEGER, TEXT, INTEGER, DOUBLE PRECISION, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER);

CREATE OR REPLACE FUNCTION public.finalize_session_item(
  p_item_id          INTEGER,
  p_user_answer      TEXT,
  p_grader_output    JSONB,
  p_response_time_ms INTEGER,
  p_outcome          TEXT,
  p_box              INTEGER,
  p_next_review_at   DOUBLE PRECISION,
  p_correct_count    INTEGER,
  p_wrong_count      INTEGER,
  p_hesitated_count  INTEGER,
  p_lapse_streak     INTEGER,
  p_mastered         BOOLEAN,
  p_box5_correct     INTEGER,
  p_requeue_question JSONB DEFAULT NULL
)
RETURNS TABLE (new_cursor INTEGER, session_complete BOOLEAN, requeue_item_id INTEGER, requeue_order_index INTEGER)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_session_id INTEGER;
  v_word_id    INTEGER;
  v_total      INTEGER;
  v_cursor     INTEGER;
  v_was_requeue BOOLEAN;
  v_requeue_id INTEGER;
  v_requeue_order INTEGER;
  v_today      DATE := (now() AT TIME ZONE 'utc')::date;
BEGIN
  UPDATE session_items
  SET user_answer      = COALESCE(p_user_answer, user_answer),
      grader_output    = p_grader_output,
      response_time_ms = p_response_time_ms,
      outcome          = p_outcome
  WHERE id = p_item_id AND user_id = auth.uid() AND outcome IS NULL
  RETURNING session_id, word_id, is_requeue INTO v_session_id, v_word_id, v_was_requeue;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_item % not found or already graded', p_item_id;
  END IF;

  IF p_outcome = 'wrong' AND p_requeue_question IS NOT NULL AND NOT v_was_requeue THEN
    SELECT COALESCE(max(order_index), -1) + 1 INTO v_requeue_order
    FROM session_items WHERE session_id = v_session_id AND user_id = auth.uid();

    INSERT INTO session_items (session_id, user_id, order_index, word_id, question, is_requeue)
    VALUES (v_session_id, auth.uid(), v_requeue_order, v_word_id, p_requeue_question, true)
    RETURNING id INTO v_requeue_id;
  END IF;

  SELECT count(*) INTO v_total
  FROM session_items WHERE session_id = v_session_id AND user_id = auth.uid();

  UPDATE sessions
  SET cursor       = cursor + 1,
      status       = CASE WHEN cursor + 1 >= v_total THEN 'completed' ELSE status END,
      completed_at = CASE WHEN cursor + 1 >= v_total THEN extract(epoch FROM now()) ELSE completed_at END
  WHERE id = v_session_id AND user_id = auth.uid()
  RETURNING cursor INTO v_cursor;

  INSERT INTO srs_state (user_id, word_id, box, next_review_at, correct_count, wrong_count, hesitated_count, lapse_streak, mastered, box5_correct)
  VALUES (auth.uid(), v_word_id, p_box, p_next_review_at, p_correct_count, p_wrong_count, p_hesitated_count, p_lapse_streak, p_mastered, p_box5_correct)
  ON CONFLICT (user_id, word_id) DO UPDATE
  SET box             = EXCLUDED.box,
      next_review_at  = EXCLUDED.next_review_at,
      correct_count   = EXCLUDED.correct_count,
      wrong_count     = EXCLUDED.wrong_count,
      hesitated_count = EXCLUDED.hesitated_count,
      lapse_streak    = EXCLUDED.lapse_streak,
      mastered        = EXCLUDED.mastered,
      box5_correct    = EXCLUDED.box5_correct;

  UPDATE profiles
  SET study_streak_days = CASE WHEN last_study_date = v_today - 1 THEN study_streak_days + 1 ELSE 1 END,
      last_study_date   = v_today
  WHERE user_id = auth.uid() AND last_study_date IS DISTINCT FROM v_today;

  RETURN QUERY SELECT v_cursor, v_cursor >= v_total, v_requeue_id, v_requeue_order;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.finalize_session_item(INTEGER, TEXT, JSONB, INTEGER, TEXT, INTEGER, DOUBLE PRECISION, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalize_session_item(INTEGER, TEXT, JSONB, INTEGER, TEXT, INTEGER, DOUBLE PRECISION, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER, JSONB) TO authenticated;
