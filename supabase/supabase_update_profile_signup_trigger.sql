-- =========================================================
-- SQL Migration Script: Full Profile Fields Auto-Sync Trigger
-- Run this script in Supabase SQL Editor to ensure all user signup metadata
-- (phone, gender, governorate, city, avatar_url, dob) is saved automatically into public.profiles.
-- =========================================================

-- 1. Ensure public.profiles table has all necessary profile columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS governorate TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob TEXT;

-- 2. Update Database Trigger Function to extract full metadata on new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username, 
    email,
    phone,
    gender,
    governorate,
    city,
    avatar_url,
    dob
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'مستخدم'),
    COALESCE(NEW.raw_user_meta_data->>'username', lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'governorate',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'dob'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    gender = COALESCE(EXCLUDED.gender, public.profiles.gender),
    governorate = COALESCE(EXCLUDED.governorate, public.profiles.governorate),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    dob = COALESCE(EXCLUDED.dob, public.profiles.dob),
    updated_at = timezone('utc'::text, now());
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
