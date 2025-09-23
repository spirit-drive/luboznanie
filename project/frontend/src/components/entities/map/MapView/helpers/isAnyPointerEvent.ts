import * as PIXI from 'pixi.js';
import { PointID } from '@/types/entities/point/point.types';
import { PointVisuals } from '@/components/entities/map/MapView/MapView.types';

export const isAnyPointerEvent = (
  event: PIXI.FederatedPointerEvent,
  renderedPoints: Map<PointID, PointVisuals>,
): boolean => {
  return renderedPoints.values().some((i) => i.container === event.target);
};
