import * as PIXI from 'pixi.js';
import { Point } from '@/types/entities/point/point.types';

export const createFog = (world: PIXI.Container, { width, height }: { width: number; height: number }) => {
  // Создаем графический объект, который будет представлять сам туман.
  // Заполняем его полупрозрачным цветом.
  const fog = new PIXI.Graphics();
  fog.rect(0, 0, width, height).fill(0xcccccc, 0.9);
  world.addChild(fog);

  // Создаем графический объект, который будет использоваться как маска
  // Это "дырки" в тумане
  const mask = new PIXI.Graphics();
  fog.setMask({ mask, inverse: true });

  world.addChild(mask);

  const updateFogMask = (points: Point[]) => {
    mask.clear();
    points.forEach((point) => {
      if (point.success) {
        // Радиус "дырки" в тумане
        const radius = point.lightRadius || 300;
        mask.circle(point.position.x, point.position.y, radius).fill(0x000000);
      }
    });
  };

  return { updateFogMask };
};
