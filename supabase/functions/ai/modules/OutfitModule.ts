import { AIService } from "../services/AIService.ts";
import { outfitGenerationPrompt } from "../prompts/outfit-generation.ts";

export class OutfitModule {

  constructor(private ai: AIService) {}

  async generateOutfit(data: any) {

    const prompt = outfitGenerationPrompt({
      wardrobe: data.wardrobe,
      profile: data.profile,
      weather: data.weather,
      occasion: data.occasion,
      formality: data.formality,
      generationHistory: data.generationHistory || [],
      stylePreferences: data.stylePreferences || []
    });
    return this.ai.run(prompt);
  }
}