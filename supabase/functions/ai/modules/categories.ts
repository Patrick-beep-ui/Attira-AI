/*
  CATEGORY NORMALIZER

  Maps database category names onto the fixed set of outfit buckets that
  OutfitLayout and the generation prompt understand.

  Subcategories inherit their parent's bucket, so any category whose parent is
  one of the top-level categories below resolves without extra mapping.
*/

export const OUTFIT_CATEGORIES = [
  "tops",
  "bottoms",
  "dresses",
  "shoes",
  "accessories",
  "outerwear"
] as const;

export type OutfitCategory = (typeof OUTFIT_CATEGORIES)[number];

const ALIASES: Record<string, OutfitCategory> = {
  top: "tops",
  tops: "tops",
  bottom: "bottoms",
  bottoms: "bottoms",
  dress: "dresses",
  dresses: "dresses",
  shoe: "shoes",
  shoes: "shoes",
  accessory: "accessories",
  accessories: "accessories",
  outerwear: "outerwear"
};

export const normalizeCategory = (cat: string | null): string | null => {
  if (!cat) return null;

  return ALIASES[cat.toLowerCase()] ?? cat.toLowerCase();
};

export const isOutfitCategory = (cat: string | null): cat is OutfitCategory =>
  cat != null && (OUTFIT_CATEGORIES as readonly string[]).includes(cat);

/*
  Resolves the bucket for a wardrobe item by preferring the parent category name,
  falling back to the item's own category when it is a top-level category
  (e.g. Dress).
*/
type WardrobeCategoryNode = {
  name?: string | null;
  parent?: { name?: string | null } | null;
};

export const getMainCategory = (item: {
  clothing_categories?: WardrobeCategoryNode | null;
}): string | null => {
  const category = item?.clothing_categories;
  const parent = category?.parent;

  return normalizeCategory(parent?.name || category?.name);
};
