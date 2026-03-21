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
    tops: { w: 320, h: 320 },
    bottoms: { w: 300, h: 350 },
    shoes: { w: 230, h: 250 },
    accessories: { w: 250, h: 250 }
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
      BASE X SHIFT (move outfit to the left)
  */
  const baseX = centerX - 60;

  /*
    🎯 1. BOTTOMS (anchor piece)
  */
  if (bottoms) {
    const size = sizeMap.bottoms;

    layers.push({
      id: bottoms.id,
      imageUrl: bottoms.imageUrl,
      x: baseX - size.w / 2 + 40 + rand(-10, 10),
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
      //x: baseX - size.w / 2 - 10 + rand(-10, 10),
      //y: 140,
      x: 10,
      y: 20,
      w: size.w,
      h: size.h,
      z: 40,
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
      x: baseX - size.w / 2 + rand(-10, 10),
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

    const sideOffset = Math.random() > 0.5 ? -40 : 40;

    layers.push({
      id: shoes.id,
      imageUrl: shoes.imageUrl,
      //x: baseX - size.w / 2 + sideOffset + rand(-10, 10),
      x: 10,
      y: 380,
      w: size.w,
      h: size.h,
      z: 30,
      rotation: getRotation() + 1
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
      x: centerX + 20 + rand(-15, 15),
      y: 80 + i * 150 + rand(-10, 10),
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