-- Social Features Part 4: Username
-- Date: 2026-04-11
-- Purpose: Add unique username field to profiles for social features

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

COMMENT ON COLUMN public.profiles.username IS 'Unique username for social features';
