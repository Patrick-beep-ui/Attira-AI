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


export function buildOutfitLayout(items: OutfitItem[]) {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 600;

  const centerX = CANVAS_WIDTH / 2;

  const sizeMap: Record<string, { w: number; h: number }> = {
    outerwear: { w: 260, h: 260 },
    tops: { w: 240, h: 240 },
    bottoms: { w: 240, h: 260 },
    shoes: { w: 200, h: 130 },
    accessories: { w: 80, h: 80 }
  };

  const layers: ImageLayer[] = [];

  const rand = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const getRotation = () => rand(-3, 3);

  // 👉 Extract
  const shoes = items.find(i => i.category === "shoes");
  const tops = items.find(i => i.category === "tops");
  const bottoms = items.find(i => i.category === "bottoms");
  const outerwear = items.find(i => i.category === "outerwear");
  const accessories = items.filter(i => i.category === "accessories");

  /*
    🎯 1. BOTTOMS (anchor piece)
  */
  if (bottoms) {
    const size = sizeMap.bottoms;

    layers.push({
      id: bottoms.id,
      imageUrl: bottoms.imageUrl,
      x: centerX - size.w / 2 + rand(-10, 10),
      y: 250,
      w: size.w,
      h: size.h,
      z: 20,
      rotation: getRotation()
    });
  }

  /*
    🎯 2. TOP (slightly above + overlap)
  */
  if (tops) {
    const size = sizeMap.tops;

    layers.push({
      id: tops.id,
      imageUrl: tops.imageUrl,
      x: centerX - size.w / 2 + rand(-20, 20),
      y: 100,
      w: size.w,
      h: size.h,
      z: 30,
      rotation: getRotation()
    });
  }

  /*
    🎯 3. OUTERWEAR (optional top layer)
  */
  if (outerwear) {
    const size = sizeMap.outerwear;

    layers.push({
      id: outerwear.id,
      imageUrl: outerwear.imageUrl,
      x: centerX - size.w / 2 + rand(-15, 15),
      y: 80,
      w: size.w,
      h: size.h,
      z: 40,
      rotation: getRotation()
    });
  }

  /*
    🎯 4. SHOES (slight horizontal split)
  */
  if (shoes) {
    const size = sizeMap.shoes;

    layers.push({
      id: shoes.id,
      imageUrl: shoes.imageUrl,
      x: centerX - size.w / 2 + (Math.random() * 20 - 10), // slight offset
      y: 480,
      w: size.w,
      h: size.h,
      z: 10,
      rotation: getRotation()
    });
  }

  /*
    🎯 5. ACCESSORIES (floating, dynamic)
  */
  accessories.forEach((item, i) => {
    const size = sizeMap.accessories;

    layers.push({
      id: item.id,
      imageUrl: item.imageUrl,
      x: centerX + 100 + rand(-20, 20),
      y: 40 + i * 90,
      w: size.w,
      h: size.h,
      z: 100 + i,
      rotation: getRotation()
    });
  });

  return {
    layers,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
  };
}