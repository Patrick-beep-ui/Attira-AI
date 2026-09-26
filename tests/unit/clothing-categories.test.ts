import { describe, it, expect } from 'vitest';
import { normalizeCategory, getMainCategory } from '../../supabase/functions/ai/modules/categories';
import { buildOutfitLayout, OutfitItem } from '../../supabase/functions/ai/modules/OutfitLayout';
import { outfitGenerationPrompt } from '../../supabase/functions/ai/prompts/outfit-generation';

const item = (id: string, category: string): OutfitItem => ({
  id,
  category,
  imageUrl: `https://example.com/${id}.png`
});

describe('normalizeCategory', () => {
  it('maps top-level database categories to outfit buckets', () => {
    expect(normalizeCategory('Top')).toBe('tops');
    expect(normalizeCategory('Bottom')).toBe('bottoms');
    expect(normalizeCategory('Shoes')).toBe('shoes');
    expect(normalizeCategory('Accessories')).toBe('accessories');
    expect(normalizeCategory('Outerwear')).toBe('outerwear');
  });

  it('maps the Dress category to the dresses bucket', () => {
    expect(normalizeCategory('Dress')).toBe('dresses');
    expect(normalizeCategory('dress')).toBe('dresses');
  });

  it('is idempotent for already-normalized bucket names', () => {
    expect(normalizeCategory('tops')).toBe('tops');
    expect(normalizeCategory('bottoms')).toBe('bottoms');
    expect(normalizeCategory('dresses')).toBe('dresses');
    expect(normalizeCategory('accessories')).toBe('accessories');
  });

  it('returns null for an empty category and passes unknown names through', () => {
    expect(normalizeCategory(null)).toBeNull();
    expect(normalizeCategory('Blazer')).toBe('blazer');
  });
});

describe('getMainCategory', () => {
  it('resolves Dress to dresses when it is a top-level category', () => {
    const dress = { clothing_categories: { name: 'Dress', parent: null } };
    expect(getMainCategory(dress)).toBe('dresses');
  });

  it('inherits the parent bucket for Skirt under Bottom', () => {
    const skirt = { clothing_categories: { name: 'Skirt', parent: { name: 'Bottom' } } };
    expect(getMainCategory(skirt)).toBe('bottoms');
  });

  it('inherits the parent bucket for the new accessory categories', () => {
    for (const name of ['Bag', 'Necklace', 'Bangle']) {
      const accessory = { clothing_categories: { name, parent: { name: 'Accessories' } } };
      expect(getMainCategory(accessory)).toBe('accessories');
    }
  });
});

describe('buildOutfitLayout', () => {
  it('renders a dress in the anchor slot and suppresses tops and bottoms', () => {
    const { layers } = buildOutfitLayout([
      item('dress-1', 'dresses'),
      item('top-1', 'tops'),
      item('bottom-1', 'bottoms')
    ]);

    const ids = layers.map(l => l.id);
    expect(ids).toContain('dress-1');
    expect(ids).not.toContain('top-1');
    expect(ids).not.toContain('bottom-1');

    const dress = layers.find(l => l.id === 'dress-1')!;
    expect(dress.w).toBe(320);
    expect(dress.h).toBe(420);
    expect(dress.z).toBe(20);
  });

  it('still renders tops and bottoms when no dress is present', () => {
    const { layers } = buildOutfitLayout([
      item('top-1', 'tops'),
      item('bottom-1', 'bottoms')
    ]);

    const ids = layers.map(l => l.id);
    expect(ids).toContain('top-1');
    expect(ids).toContain('bottom-1');
  });
});

describe('outfitGenerationPrompt', () => {
  const promptFor = (item: Record<string, unknown>) =>
    outfitGenerationPrompt({
      wardrobe: [item],
      profile: null,
      weather: null,
      occasion: 'casual',
      formality: 'balanced',
      generationHistory: []
    });

  it('passes the specific subcategory through alongside the outfit bucket', () => {
    const prompt = promptFor({
      id: '1',
      name: 'Collar de perlas',
      category: 'accessories',
      subcategory: 'Necklace'
    });

    expect(prompt).toContain('category: accessories');
    expect(prompt).toContain('subcategory: Necklace');
  });

  it('surfaces a top-level category as its own subcategory', () => {
    const prompt = promptFor({
      id: '2',
      name: 'Vestido de flores',
      category: 'dresses',
      subcategory: 'Dress'
    });

    expect(prompt).toContain('category: dresses');
    expect(prompt).toContain('subcategory: Dress');
  });

  it('forwards brand and size, which used to be dropped before the prompt', () => {
    const prompt = promptFor({
      id: '3',
      name: 'Bolso de cuero',
      category: 'accessories',
      subcategory: 'Bag',
      brand: 'Coach',
      size: 'M'
    });

    expect(prompt).toContain('brand: Coach');
    expect(prompt).toContain('size: M');
  });

  it('advertises the dresses bucket in the response schema and the one-piece rule', () => {
    const prompt = promptFor({ id: '4', name: 'x', category: 'dresses', subcategory: 'Dress' });

    expect(prompt).toContain('tops | bottoms | dresses | shoes | accessories | outerwear');
    expect(prompt).toContain('one-piece garment');
  });
});
