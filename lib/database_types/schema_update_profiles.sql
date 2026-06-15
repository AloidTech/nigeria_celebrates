-- ============================================================================
-- NIGERIA CELEBRATES - PROFILE ENHANCEMENTS MIGRATION
-- ============================================================================

-- 1. Add new columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle VARCHAR(100) UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS arena_id VARCHAR(100) UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Create a backfill function for existing users
-- This will assign an arena_id to any user who doesn't have one yet.
-- Format: [user_id]_[8_random_chars]
CREATE OR REPLACE FUNCTION public.backfill_missing_profile_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT id FROM public.profiles WHERE arena_id IS NULL LOOP
        UPDATE public.profiles
        SET arena_id = rec.id::text || '_' || substr(md5(random()::text), 1, 8)
        WHERE id = rec.id;
    END LOOP;
END;
$$;

-- Note: To execute the backfill immediately, run:
-- SELECT public.backfill_missing_profile_data();
