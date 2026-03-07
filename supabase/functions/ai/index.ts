import { GeminiClient } from "./clients/GeminiClient.ts";
import { AIService } from "./services/AIService.ts";
import { OutfitModule } from "./modules/OutfitModule.ts";

const client = new GeminiClient();
const aiService = new AIService(client);

export const outfitModule = new OutfitModule(aiService);