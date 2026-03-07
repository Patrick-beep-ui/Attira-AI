/// <reference lib="deno.ns" />

import { AIClientInterface, AIResponse } from "../AIClientInterface.ts";

export class GeminiClient implements AIClientInterface {

  async generate(prompt: string, timeout=30): Promise<AIResponse> {

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": Deno.env.get("PERSONAL_GEMINI_KEY")!
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    )

    const json = await response.json()

    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    return {
      text,
      modelVersion: json?.modelVersion,
      responseId: json?.responseId,
      usageMetadata: json?.usageMetadata
    }
  }
}