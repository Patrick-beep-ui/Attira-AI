export type OutfitItem = {
  id: string;
  imageUrl: string;
  category: string;
};

export type ImageLayer = {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  rotation?: number;
};

// Replace your buildOutfitLayout logic with this coordinate system
export function buildOutfitLayout(items: OutfitItem[]) {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 600;

  const centerX = CANVAS_WIDTH / 2;

  const sizeMap: Record<string, { w: number; h: number }> = {
    outerwear: { w: 260, h: 260 },
    tops: { w: 240, h: 240 },
    bottoms: { w: 240, h: 260 },
    shoes: { w: 220, h: 140 },
    accessories: { w: 90, h: 90 }
  };

  const layers: ImageLayer[] = [];
  const getRotation = () => (Math.random() - 0.5) * 5;

  // 👉 Extract items
  const shoes = items.find(i => i.category === "shoes");
  const tops = items.find(i => i.category === "tops");
  const bottoms = items.find(i => i.category === "bottoms");
  const outerwear = items.find(i => i.category === "outerwear");
  const accessories = items.filter(i => i.category === "accessories");

  if (!tops) console.warn("⚠️ No tops found", items);
  if (!bottoms) console.warn("⚠️ No bottoms found", items);

  // 👉 1. SHOES (always bottom)
  let shoesTopY = CANVAS_HEIGHT - 160;

  if (shoes) {
    const size = sizeMap.shoes;

    layers.push({
      id: shoes.id,
      imageUrl: shoes.imageUrl,
      x: centerX - size.w / 2,
      y: shoesTopY,
      w: size.w,
      h: size.h,
      z: 10,
      rotation: getRotation()
    });
  }

  // 👉 2. ACCESSORIES (top right)
  accessories.forEach((item, idx) => {
    const size = sizeMap.accessories;

    layers.push({
      id: item.id,
      imageUrl: item.imageUrl,
      x: centerX + 90,
      y: 40 + idx * 100,
      w: size.w,
      h: size.h,
      z: 100 + idx,
      rotation: getRotation()
    });
  });

  // 👉 3. CENTER STACK (tops, bottoms, outerwear)
  const centerItems = [outerwear, tops, bottoms].filter(Boolean);

  const totalHeight = centerItems.reduce((acc, item) => {
    const size = sizeMap[item!.category];
    return acc + size.h;
  }, 0);

  const spacing = 10;

  const totalSpacing = spacing * (centerItems.length - 1);

  const availableTop = 40; // below accessories
  const availableBottom = shoesTopY - 20;

  const availableHeight = availableBottom - availableTop;

  // 👉 Center vertically
  let currentY =
    availableTop + (availableHeight - (totalHeight + totalSpacing)) / 2;

  centerItems.forEach((item, index) => {
    const size = sizeMap[item!.category];

    layers.push({
      id: item!.id,
      imageUrl: item!.imageUrl,
      x: centerX - size.w / 2,
      y: currentY,
      w: size.w,
      h: size.h,
      z: 20 + index * 10,
      rotation: getRotation()
    });

    currentY += size.h + spacing;
  });

  return {
    layers,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
  };
}