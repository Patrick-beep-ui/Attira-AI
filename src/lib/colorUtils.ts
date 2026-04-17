import namer from "color-namer";

/**
 * Convert RGB → HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * HEX → RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

/**
 * Validate HEX
 */
export function isValidHex(hex: string): boolean {
  return /^#?([a-fA-F0-9]{6})$/.test(hex);
}

/**
 * Normalize HEX (#ABC → #AABBCC)
 */
export function normalizeHex(hex: string): string {
  let h = hex.replace("#", "").toUpperCase();

  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }

  return `#${h}`;
}

/**
 * HEX → Human-readable name
 */
export function getColorNameFromHex(hex: string): string | null {
  if (!isValidHex(hex)) return null;

  try {
    const normalized = normalizeHex(hex);
    const result = namer(normalized);

    return result.ntc?.[0]?.name || null;
  } catch {
    return null;
  }
}

/**
 * Name → HEX
 */
export function getColorFromName(name: string): string | null {
  if (!name || !name.trim()) return null;

  try {
    const result = namer(name.trim());

    return result.ntc?.[0]?.hex?.toUpperCase() || null;
  } catch {
    return null;
  }
}

export function isValidColorName(name: string): boolean {
  return !!getColorFromName(name);
}