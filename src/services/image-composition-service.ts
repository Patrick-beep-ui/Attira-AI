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