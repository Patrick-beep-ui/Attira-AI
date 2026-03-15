import { describe, it, expect } from 'vitest';
import { OutfitModule } from '../../supabase/functions/ai/modules/OutfitModule';
import { AIService } from '../../supabase/functions/ai/services/AIService';

// Mock AIService to simulate AI response
class MockAIService {
  async run(prompt: string) {
    // Simulate a valid AI JSON response
    return {
      text: JSON.stringify({
        items: [
          {
            id: '1',
            name: 'Blue Shirt',
            category: 'tops',
            color: '#0000FF',
          },
          {
            id: '2',
            name: 'Black Jeans',
            category: 'bottoms',
            color: '#000000',
          }
        ],
        stylingNotes: 'A classic blue and black combo for a casual outing.',
        confidence: 0.9
      })
    };
  }
}

describe('OutfitModule.generateOutfit', () => {
  it('should generate an outfit from wardrobe and profile', async () => {
    const mockAI = new MockAIService();
    const module = new OutfitModule(mockAI as unknown as AIService);
    const wardrobe = [
      { id: '1', name: 'Blue Shirt', category: 'tops', color: '#0000FF' },
      { id: '2', name: 'Black Jeans', category: 'bottoms', color: '#000000' }
    ];
    const profile = { body_type: 'athletic', preferred_fit: 'slim', climate: 'temperate', style_preferences: ['casual'] };
    const result = await module.generateOutfit({
      wardrobe,
      profile,
      occasion: 'casual',
      formality: 'balanced',
      climate: 'temperate'
    });
    expect(result).toBeDefined();
    expect(result.text).toContain('Blue Shirt');
    expect(result.text).toContain('Black Jeans');
    expect(result.text).toContain('confidence');
  });
});
