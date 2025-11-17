import * as PIXI from 'pixi.js';
import { AddingPoint } from '@/types/entities/point/point.types';
import { PointVisualOptions, PointVisuals } from '@/components/entities/map/MapView/MapView.types';
import { createPointVisual } from '@/components/entities/map/MapView/helpers/createPointVisual';

export const createAddingPoint = (
  position: PIXI.PointData,
  addingPoint: AddingPoint,
  options: PointVisualOptions,
): PointVisuals => {
  const visual = createPointVisual({ ...addingPoint, position }, options);
  visual.container.alpha = 0.5; // Делаем ее полупрозрачной
  visual.container.eventMode = 'none';
  return visual;
};
