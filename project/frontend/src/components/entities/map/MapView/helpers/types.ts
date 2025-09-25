import { BGItemVisuals, MapEditableMode, PointID, PointVisuals } from '@/components/entities/map/MapView/MapView.types';
import * as PIXI from 'pixi.js';

export type PointsAndBackgroundsManagerState = {
  addingPoint: PointVisuals | null;
  addingPointVisible: boolean;
  editableMode: MapEditableMode;
  isDragging: boolean;
  moved: boolean;
  dragStartGlobal: PIXI.Point | null;
  dragOffset: PIXI.Point | null;
  movablePoint: PointVisuals | null;
  renderedPoints: Map<PointID, PointVisuals>;
  selectedPoints: Map<PointID, PointVisuals>;
  renderedBGItems: Map<PointID, BGItemVisuals>;
  selectedBGItems: Map<PointID, BGItemVisuals>;
};
