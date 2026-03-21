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

export function composeOutfitSVG(
  layers: ImageLayer[],
  width: number = 500,
  height: number = 600
): string {
  const sortedLayers = [...layers].sort(
    (a, b) => (a.z ?? 0) - (b.z ?? 0)
  );

  const parts: string[] = [];

  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);

  parts.push(`
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${width}" 
      height="${height}" 
      viewBox="0 0 ${width} ${height}"
    >
  `);

  // 🔥 shadow filter
  parts.push(`
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.15"/>
      </filter>
    </defs>
  `);

  // background 
  // //last fill = f6f6f6
  parts.push(`
    <rect x="0" y="0" width="100%" height="100%" fill="#DEDAD9"/>
  `);

  sortedLayers.forEach((l) => {
    if (!l.imageUrl) return;

    const w = l.w ?? 120;
    const h = l.h ?? 120;

    const transform = l.rotation
      ? `rotate(${l.rotation} ${l.x + w / 2} ${l.y + h / 2})`
      : "";

    parts.push(`
      <g transform="${transform}" filter="url(#shadow)">
        <image 
          xlink:href="${l.imageUrl}"
          href="${l.imageUrl}"
          x="${l.x}" 
          y="${l.y}" 
          width="${w}" 
          height="${h}"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    `);
  });

  parts.push(`</svg>`);

  return `data:image/svg+xml;utf8,${encodeURIComponent(
    parts.join("\n")
  )}`;
}