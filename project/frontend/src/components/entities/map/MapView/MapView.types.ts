import { Point, PointID, Connection } from '@/types/entities/point/point.types';
import { BackgroundItem, LoadedSvg, MapBackground } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';

export type MapViewProps = {
  className?: string;
  points: Point[];
  backgroundItems?: BackgroundItem[];
  background?: MapBackground;
  width: number;
  height: number;
  onPointClick: (pointId: PointID) => void;
};

export type { Point, PointID, MapBackground, Connection };

export type PointVisuals = {
  container: PIXI.Container<ContainerChild>;
  graphics: PIXI.Graphics;
};

export type PointsManagerOptions = {
  pointTypeIcon: LoadedSvg;
  pointPropsIcon: LoadedSvg;
  onPointClick?: (point: Point) => void;
};
