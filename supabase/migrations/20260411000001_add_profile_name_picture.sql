-- Social Features Part 2: User Profile Fields
-- Date: 2026-04-11
-- Purpose: Add name and profile picture fields to profiles for social features

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.profile_picture_url IS 'URL to user profile picture in storage';