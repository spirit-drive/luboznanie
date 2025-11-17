import * as PIXI from 'pixi.js';
import { Point } from '@/types/entities/point/point.types';
import { LoadedAsset } from '@/types/entities/map/map.types';
import { MapEditableMode } from '@/components/entities/map/MapView/MapView.types';

export const createFogManager = (
  world: PIXI.Container,
  { width, height, fogAssets }: { width: number; height: number; fogAssets: LoadedAsset },
) => {
  const fog = new PIXI.TilingSprite(fogAssets as PIXI.Texture, width, height);
  fog.alpha = 0.9;

  const mask = new PIXI.Graphics();
  fog.setMask({ mask, inverse: true });

  const updateFogMask = (points: Point[]) => {
    mask.clear();
    points.forEach((point) => {
      if (point.success) {
        const radius = point.lightRadius || 300;
        mask.circle(point.position.x, point.position.y, radius).fill(0x000000);
      }
    });
  };

  return {
    drawFog() {
      world.addChild(fog);
      world.addChild(mask);
    },
    updateFogMask,
    setEditableMode: (mode: MapEditableMode) => {
      fog.visible = mode !== 'backgrounds';
    },
  };
};
