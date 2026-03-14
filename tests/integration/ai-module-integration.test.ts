import { describe, it, expect } from 'vitest';
import { AIService } from '../../supabase/functions/ai/services/AIService';

// Mock AIClientInterface for isolated AIService testing
class MockAIClient {
  async generate(prompt: string, timeout = 30) {
    return {
      text: `Echo: ${prompt}`,
      modelVersion: 'mock-v1',
      responseId: 'mock-id',
      usageMetadata: { mock: true }
    };
  }
}

describe('AIService integration', () => {
  it('should process prompt and return AI response', async () => {
    const mockClient = new MockAIClient();
    const aiService = new AIService(mockClient);
    const prompt = 'Test prompt for AI module';
    const response = await aiService.run(prompt);
    expect(response).toBeDefined();
    expect(response.text).toContain('Echo: Test prompt for AI module');
    expect(response.modelVersion).toBe('mock-v1');
    expect(response.responseId).toBe('mock-id');
    expect(response.usageMetadata).toHaveProperty('mock', true);
  });
});
