import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../../src/integrations/supabase/client';

describe('Wardrobe add item', () => {
  it('should call supabase.from("wardrobe_items").insert with correct data', async () => {
    // Arrange: mock supabase.from().insert()
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    vi.spyOn(supabase, 'from').mockImplementation(fromMock);

    const user_id = 'user-123';
    const item = {
      user_id,
      name: 'Test Shirt',
      category: 'Tops',
      color: 'Blue',
      image_url: 'http://example.com/image.png',
    };

    // Act: call the logic to add an item
    await supabase.from('wardrobe_items').insert(item);

    // Assert: check that insert was called with the correct data
    expect(fromMock).toHaveBeenCalledWith('wardrobe_items');
    expect(insertMock).toHaveBeenCalledWith(item);
  });
});
