-- Social Features Part 3: Outfit Likes & RLS Policies
-- Date: 2026-04-11
-- Purpose: Add likes table and update RLS policies for social feed

-- Create outfit_likes table
CREATE TABLE IF NOT EXISTS public.outfit_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, outfit_id)
);

ALTER TABLE public.outfit_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for outfit_likes
CREATE POLICY "Users can view outfit likes" ON outfit_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert outfit likes" ON outfit_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete outfit likes" ON outfit_likes FOR DELETE USING (auth.uid() = user_id);

-- Allow viewing outfit_items when the outfit is public
CREATE POLICY "Anyone can view outfit items for public outfits" ON outfit_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM outfits
    WHERE outfits.id = outfit_items.outfit_id
    AND outfits.is_public = true
  )
);

-- Allow viewing wardrobe_items when they're used in public outfits
CREATE POLICY "Anyone can view wardrobe items for public outfits" ON wardrobe_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM outfit_items
    JOIN outfits ON outfits.id = outfit_items.outfit_id
    WHERE outfit_items.wardrobe_item_id = wardrobe_items.id
    AND outfits.is_public = true
  )
);