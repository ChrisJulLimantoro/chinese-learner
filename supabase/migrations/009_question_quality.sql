ALTER TABLE word_questions
  ADD COLUMN IF NOT EXISTS retired        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS times_answered INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS times_missed   INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS question_reports (
  question_id INTEGER NOT NULL REFERENCES word_questions(id) ON DELETE CASCADE,
  user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      TEXT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (question_id, user_id)
);

ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "question_reports_insert_own"
  ON question_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "question_reports_select_own"
  ON question_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT ON public.question_reports TO authenticated;

CREATE OR REPLACE FUNCTION public.record_question_result(p_question_id INTEGER, p_correct BOOLEAN)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE word_questions
  SET times_answered = times_answered + 1,
      times_missed   = times_missed + CASE WHEN p_correct THEN 0 ELSE 1 END,
      retired        = retired OR (
        times_answered + 1 >= 20
        AND (times_missed + CASE WHEN p_correct THEN 0 ELSE 1 END)::float / (times_answered + 1) > 0.8
      )
  WHERE id = p_question_id;
$$;

CREATE OR REPLACE FUNCTION public.report_question(p_question_id INTEGER, p_reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reporter_is_admin BOOLEAN;
  report_count INTEGER;
BEGIN
  INSERT INTO question_reports (question_id, user_id, reason)
  VALUES (p_question_id, auth.uid(), p_reason)
  ON CONFLICT DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin') INTO reporter_is_admin;
  SELECT count(*) INTO report_count FROM question_reports WHERE question_id = p_question_id;

  IF reporter_is_admin OR report_count >= 3 THEN
    UPDATE word_questions SET retired = true WHERE id = p_question_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_question_result(INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_question(INTEGER, TEXT) TO authenticated;
