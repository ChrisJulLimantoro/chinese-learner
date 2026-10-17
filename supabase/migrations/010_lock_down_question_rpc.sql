REVOKE EXECUTE ON FUNCTION public.record_question_result(INTEGER, BOOLEAN) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.report_question(INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_question_result(INTEGER, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION public.report_question(INTEGER, TEXT) TO authenticated;
