-- Migration: Refactor schema for scalable production structure
-- 1. Drop old tables (if needed, or rename for backup)
ALTER TABLE IF EXISTS public.saved_outfits RENAME TO saved_outfits_legacy;
ALTER TABLE IF EXISTS public.wardrobe_items RENAME TO wardrobe_items_legacy;
ALTER TABLE IF EXISTS public.profiles RENAME TO profiles_legacy;

-- 2. Core Tables
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  body_type TEXT,
  preferred_fit TEXT,
  height_cm INTEGER,
  weight_kg INTEGER,
  country_code TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Style Categories
CREATE TABLE public.style_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Profile Style Preferences (many-to-many)
CREATE TABLE public.profile_style_preferences (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  style_category_id INTEGER REFERENCES public.style_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, style_category_id)
);

-- Clothing Categories (hierarchical)
CREATE TABLE public.clothing_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  parent_category_id INTEGER REFERENCES public.clothing_categories(id)
);

-- Wardrobe Items
CREATE TABLE public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES public.clothing_categories(id),
  color TEXT,
  fabric TEXT,
  size TEXT,
  brand TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wardrobe" ON public.wardrobe_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.wardrobe_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.wardrobe_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.wardrobe_items FOR DELETE USING (auth.uid() = user_id);

-- Outfits
CREATE TABLE public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occasion TEXT,
  formality TEXT,
  confidence NUMERIC,
  styling_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own outfits" ON public.outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outfits" ON public.outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outfits" ON public.outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outfits" ON public.outfits FOR DELETE USING (auth.uid() = user_id);

-- Outfit Items (normalized)
CREATE TABLE public.outfit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id),
  layer_order INTEGER
);

-- 3. AI Support Tables
-- Outfit Generations
CREATE TABLE public.outfit_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  occasion TEXT,
  formality TEXT,
  weather_temperature NUMERIC,
  weather_condition TEXT,
  generated_items JSONB,
  confidence NUMERIC,
  accepted BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Item Tags
CREATE TABLE public.item_tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE
);

-- Item Tag Map (many-to-many)
CREATE TABLE public.item_tag_map (
  item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES public.item_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- Storage bucket for wardrobe images (if not already present)
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe-images', 'wardrobe-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own images" ON storage.objects FOR SELECT USING (bucket_id = 'wardrobe-images');
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at
  BEFORE UPDATE ON public.outfits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Seed style_categories (add your app's styles here)
INSERT INTO public.style_categories (name) VALUES
  ('Minimalist'),
  ('Streetwear'),
  ('Business Casual'),
  ('Elegant'),
  ('Sporty')
ON CONFLICT (name) DO NOTHING;

-- Seed clothing_categories (basic hierarchy)
INSERT INTO public.clothing_categories (name, parent_category_id) VALUES
  ('Top', NULL),
  ('Shirt', 1),
  ('T-Shirt', 1),
  ('Bottom', NULL),
  ('Jeans', 4),
  ('Shorts', 4),
  ('Outerwear', NULL)
ON CONFLICT (name) DO NOTHING;

-- Seed item_tags (examples)
INSERT INTO public.item_tags (name) VALUES
  ('casual'),
  ('formal'),
  ('sporty'),
  ('minimal'),
  ('vintage'),
  ('summer'),
  ('rain-friendly')
ON CONFLICT (name) DO NOTHING;

CREATE INDEX idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);

ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_generations ENABLE ROW LEVEL SECURITY;

ALTER TABLE clothing_categories ADD CONSTRAINT clothing_categories_name_unique UNIQUE(name);


-- End of migration
