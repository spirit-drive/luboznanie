import * as PIXI from 'pixi.js';
import { Point } from '@/types/entities/point/point.types';
import { LoadedAsset } from '@/types/entities/map/map.types';

export const createFog = (
  world: PIXI.Container,
  { width, height, fogAssets }: { width: number; height: number; fogAssets: LoadedAsset },
) => {
  const fog = new PIXI.TilingSprite(fogAssets as PIXI.Texture, width, height);
  fog.alpha = 0.9;
  world.addChild(fog);

  const mask = new PIXI.Graphics();
  fog.setMask({ mask, inverse: true });

  world.addChild(mask);

  const updateFogMask = (points: Point[]) => {
    mask.clear();
    points.forEach((point) => {
      if (point.success) {
        const radius = point.lightRadius || 300;
        mask.circle(point.position.x, point.position.y, radius).fill(0x000000);
      }
    });
  };

  return { updateFogMask, fog };
};
