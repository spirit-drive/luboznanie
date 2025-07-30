import { Point, PointID, Connection } from '@/types/entities/point/point.types';
import { LoadedSvg, MapBackground } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';

export type MapViewProps = {
  className?: string;
  items: Point[];
  background?: MapBackground;
  width: number;
  height: number;
  onPointClick: (pointId: PointID) => void;
};

export type { Point, PointID, MapBackground, Connection };

export type PointVisuals = {
  container: PIXI.Container;
  graphics: PIXI.Graphics;
};

export type PointsManagerOptions = {
  pointTypeIcon: LoadedSvg;
  onPointClick?: (point: Point) => void;
};
