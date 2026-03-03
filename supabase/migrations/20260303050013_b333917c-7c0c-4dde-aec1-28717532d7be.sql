
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  body_type TEXT,
  preferred_fit TEXT,
  style_preferences TEXT[] DEFAULT '{}',
  climate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Wardrobe items table
CREATE TABLE public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  fabric TEXT,
  season TEXT DEFAULT 'all-season',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wardrobe" ON public.wardrobe_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.wardrobe_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.wardrobe_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.wardrobe_items FOR DELETE USING (auth.uid() = user_id);

-- Saved outfits table
CREATE TABLE public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  styling_notes TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits" ON public.saved_outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outfits" ON public.saved_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own outfits" ON public.saved_outfits FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for wardrobe images
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe-images', 'wardrobe-images', true);

CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own images" ON storage.objects FOR SELECT USING (bucket_id = 'wardrobe-images');
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

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

-- Updated_at trigger
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
