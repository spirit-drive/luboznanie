import { Point, PointID, Connection } from '@/types/entities/point/point.types';
import { BackgroundItem, LoadedAsset, MapBackground, MapVisibleBackgroundItem } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { RefObject } from 'react';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/pointsManager';

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
  pointTypeIcon: LoadedAsset;
  pointPropsIcon: LoadedAsset;
  onPointClick?: (point: Point) => void;
};

export type UseMapViewOptions = Pick<
  MapViewProps,
  'background' | 'width' | 'height' | 'points' | 'onPointClick' | 'backgroundItems'
>;

export type CreateMapOptions = {
  container: HTMLDivElement;
  appRef: RefObject<PIXI.Application>;
  pointsManagerRef: RefObject<ReturnType<typeof createPointsManager> | null>;
  onChangeWorld?: (params: { visibleBackgorundItems: MapVisibleBackgroundItem[] }) => void;
} & UseMapViewOptions;
