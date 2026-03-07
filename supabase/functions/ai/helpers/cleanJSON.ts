export function extractJSON(text: string) {
    if (!text) return null;
  
    let cleaned = text.trim();
  
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
    }
  
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
  
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  
    return cleaned;
  }