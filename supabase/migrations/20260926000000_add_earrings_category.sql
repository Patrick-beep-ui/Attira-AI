-- Add Earrings under Accessories.
-- Idempotent via the existing UNIQUE (name) constraint.
-- The id is left to the sequence so no setval is required.

INSERT INTO public.clothing_categories (name, parent_category_id)
VALUES ('Earrings', 12)
ON CONFLICT (name) DO UPDATE
  SET parent_category_id = EXCLUDED.parent_category_id;
