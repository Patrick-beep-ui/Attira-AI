import { supabase } from "@/integrations/supabase/client";

export type ImageLayer = {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  rotation?: number;
  z?: number;
};

export type ImageCompositionConfig = {
  stageWidth: number;
  stageHeight: number;
  layers: ImageLayer[];
  backgroundColor?: string;
};

export type ImageCompositionResult = {
  imageUrl: string;
  width?: number;
  height?: number;
};

export interface ImageComposerClient {
  compose(config: ImageCompositionConfig): Promise<ImageCompositionResult>;
}

class CanvasOverlayClient implements ImageComposerClient {
  async compose(config: ImageCompositionConfig): Promise<ImageCompositionResult> {
    const {
      stageWidth,
      stageHeight,
      layers,
      backgroundColor = "#ffffff"
    } = config;

    // Sort layers by z-index (VERY IMPORTANT)
    const sortedLayers = [...layers].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

    const svgParts: string[] = [];

    svgParts.push(`
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="${stageWidth}" 
        height="${stageHeight}" 
        viewBox="0 0 ${stageWidth} ${stageHeight}"
      >
    `);

    svgParts.push(`<rect width="100%" height="100%" fill="${backgroundColor}"/>`);

    for (const layer of sortedLayers) {
      const w = layer.w ?? 200;
      const h = layer.h ?? 200;

      const transform =
        layer.rotation && layer.rotation !== 0
          ? ` transform="rotate(${layer.rotation} ${layer.x + w / 2} ${layer.y + h / 2})"`
          : "";

      console.log("🖼️ Rendering image:", layer.imageUrl);

      svgParts.push(`
        <image 
          xlink:href="${layer.imageUrl}"
          href="${layer.imageUrl}"
          x="${layer.x}" 
          y="${layer.y}" 
          width="${w}" 
          height="${h}"
          preserveAspectRatio="xMidYMid slice"
          ${transform}
        />
      `);
    }

    svgParts.push(`</svg>`);

    const svg = svgParts.join("\n");

    console.log("🎨 FINAL SVG GENERATED");

    return {
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      width: stageWidth,
      height: stageHeight
    };
  }
}

export class ImageCompositionService {
  constructor(
    private client: ImageComposerClient = new CanvasOverlayClient()
  ) {}

  async composeForOutfit(
    layers: ImageLayer[],
    stageWidth = 1000,
    stageHeight = 1000
  ): Promise<string> {
    const result = await this.client.compose({
      stageWidth,
      stageHeight,
      layers,
      backgroundColor: "#ffffff"
    });

    return result.imageUrl;
  }
}

export const defaultImageCompositionService =
  new ImageCompositionService();

  /*
export async function removeBackground(imageUrl: string): Promise<Blob> {
  const { data, error } = await supabase.functions.invoke(
    "process-image",
    {
      body: { imageUrl },
    }
  );

  if (error) {
    console.error("removeBackground error:", error);
    throw new Error(error.message || "Failed to remove background");
  }

  // IMPORTANT: Supabase returns raw data differently depending on config
  // We need to reconstruct the blob

  if (!data) {
    throw new Error("No data returned from process-image");
  }

  // If already a Blob (new SDK behavior)
  if (data instanceof Blob) {
    return data;
  }

  // If ArrayBuffer (common case)
  return new Blob([data], { type: "image/png" });
}
  */

export const removeBackground = async (imageBase64: string): Promise<Blob> => {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(
    "https://hpmcnchtqancomrlgxpu.supabase.co/functions/v1/process-image",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ imageUrl: imageBase64 }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  // ✅ THIS is the key
  const blob = await res.blob();

  return blob;
};