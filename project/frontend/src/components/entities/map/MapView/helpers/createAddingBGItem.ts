import * as PIXI from 'pixi.js';
import { BGItemVisualOptions, BGItemVisuals } from '@/components/entities/map/MapView/MapView.types';
import { AddingBackgroundType } from '@/types/entities/map/map.types';
import { createBGItemVisual } from '@/components/entities/map/MapView/helpers/createBGItemVisual';

export const createAddingBGItem = (
  position: PIXI.PointData,
  addingBGItem: AddingBackgroundType,
  options: BGItemVisualOptions,
): BGItemVisuals => {
  const visual = createBGItemVisual({ ...addingBGItem, position }, options);
  visual.container.alpha = 0.5; // Делаем ее полупрозрачной
  visual.container.eventMode = 'none';
  return visual;
};
