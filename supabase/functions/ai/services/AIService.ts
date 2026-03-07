import { AIClientInterface } from "../AIClientInterface.ts";

export class AIService {

  private client: AIClientInterface;

  constructor(client: AIClientInterface) {
    this.client = client;
  }

  async run(prompt: string, /*params: Record<string, any>,*/ timeout = 30) {

    /*
    let content = promptTemplate;

    for (const key in params) {
      const value =
        typeof params[key] === "object"
          ? JSON.stringify(params[key])
          : params[key];

      content = content.replace(`{{${key}}}`, value);
    }
      */

    return this.client.generate(prompt, timeout);
  }
}