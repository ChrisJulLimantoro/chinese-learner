-- ==========================================================================
-- 003_roles_limits.sql
-- Adds role / limit columns to profiles, backfills email, updates the
-- handle_new_user trigger, and tightens column-level grants so authenticated
-- users cannot self-elevate.
--
-- Apply via: Supabase dashboard → SQL editor, or `supabase db push`.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- 1. Add new columns to profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS max_vocab_words INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_sessions INTEGER DEFAULT 3;

-- ---------------------------------------------------------------------------
-- 2. Backfill email from auth.users for existing rows
-- ---------------------------------------------------------------------------
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND p.email IS NULL;

-- ---------------------------------------------------------------------------
-- 3. Replace handle_new_user trigger to populate new columns
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, current_hsk_level, max_vocab_words, max_sessions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'hsk_level')::int, 2),
    5,
    3
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Security hardening: revoke broad grants; re-grant only safe columns
--    (role, email, max_vocab_words, max_sessions must only be written by the
--    service-role admin client -- never directly by an authenticated session)
-- ---------------------------------------------------------------------------

-- Revoke the broad INSERT/UPDATE grants on profiles for authenticated users
REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;

-- Re-grant INSERT only for the columns a new user legitimately writes
GRANT INSERT (user_id, current_hsk_level, study_streak_days, last_study_date)
  ON public.profiles TO authenticated;

-- Re-grant UPDATE only for the columns users may change themselves
GRANT UPDATE (current_hsk_level, study_streak_days, last_study_date)
  ON public.profiles TO authenticated;
