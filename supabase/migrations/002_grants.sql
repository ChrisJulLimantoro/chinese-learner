-- ==========================================================================
-- 002_grants.sql
-- Table-level privileges for the anon/authenticated roles.
--
-- RLS policies (in 001) restrict WHICH ROWS a user can see, but Postgres also
-- requires table-level GRANTs before RLS is even evaluated. Without these,
-- every query from a logged-in user fails with "permission denied for table"
-- (error 42501), which the app surfaces as "No words available for session".
--
-- Apply via: Supabase dashboard -> SQL editor, or `supabase db push`.
-- ==========================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Shared, read-only tables (writes happen via the service role, which bypasses
-- both RLS and these grants). Authenticated users only need SELECT.
GRANT SELECT ON public.words            TO authenticated;
GRANT SELECT ON public.accepted_answers TO authenticated;

-- Per-user tables: RLS (policies in 001) confines access to the user's own rows,
-- so it is safe to grant full row access to the authenticated role here.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.srs_state     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_items TO authenticated;

-- SERIAL primary keys need sequence access for INSERTs by the authenticated role.
GRANT USAGE, SELECT ON SEQUENCE public.sessions_id_seq      TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.session_items_id_seq TO authenticated;

-- Keep future tables working without re-granting each time.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
