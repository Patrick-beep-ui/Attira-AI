ALTER TABLE public.wardrobe_items
ADD COLUMN processed_image_url text,
ADD COLUMN processing_status text DEFAULT 'pending' CHECK (
  processing_status in ('pending', 'done', 'failed')
);
