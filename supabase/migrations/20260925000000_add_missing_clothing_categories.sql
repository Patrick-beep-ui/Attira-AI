-- Add missing wardrobe categories and rename Bracelet -> Bangle.
-- Idempotent via the existing UNIQUE (name) constraint.
-- IDs are left to the sequence (last_value=42) so no setval is required.

INSERT INTO public.clothing_categories (name, parent_category_id)
VALUES
  ('Dress', NULL),
  ('Skirt', 4),
  ('Bag', 12),
  ('Necklace', 12)
ON CONFLICT (name) DO UPDATE
  SET parent_category_id = EXCLUDED.parent_category_id;

-- In-place rename: preserves id 26 and the wardrobe_items rows referencing it.
UPDATE public.clothing_categories
SET name = 'Bangle'
WHERE name = 'Bracelet';
