-- Social Features Part 1: Outfit Visibility
-- Date: 2026-04-11
-- Purpose: Add ability to publish/unpublish outfits for social feed

ALTER TABLE public.outfits 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

COMMENT ON COLUMN public.outfits.is_public IS 'Visibility status: true = public (shown in feed), false = private';
COMMENT ON COLUMN public.outfits.published_at IS 'Timestamp when outfit was made public';