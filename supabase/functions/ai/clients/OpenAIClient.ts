import { AIClientInterface, AIResponse } from "../AIClientInterface";

export class OpenAIClient implements AIClientInterface {

  async generate(prompt: string, timeout = 30): Promise<AIResponse> {

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const json = await response.json();

    return {
      text: json.output?.[0]?.content?.[0]?.text || "",
      modelVersion: json.model,
      usageMetadata: json.usage
    };
  }
}