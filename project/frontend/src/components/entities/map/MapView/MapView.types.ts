import { Point, PointID, Connection } from '@/types/entities/point/point.types';
import { BackgroundItem, LoadedAsset, MapBackground, MapVisibleBackgroundItem } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { RefObject } from 'react';

export type MapEditableMode = 'none' | 'points' | 'backgrounds';
export type PointEditableState = 'default' | 'selected' | 'hover';
export type MapPoint = Point & { state: PointEditableState };

export type MapViewProps = {
  className?: string;
  points: Point[];
  backgroundItems?: BackgroundItem[];
  background?: MapBackground;
  width: number;
  height: number;
  onPointClick: (pointId: PointID) => void;
  editableMode?: MapEditableMode;
  onSelectPoints?: (selectedPoints: Point[]) => void;
  onChangePoints?: (points: Point[]) => void;
};

export type { Point, PointID, MapBackground, Connection };

export type PointVisuals = {
  container: PIXI.Container<ContainerChild>;
  graphics: PIXI.Graphics;
  setEditableMode: (editableMode: MapEditableMode) => void;
};

export type PointsManagerOptions = {
  pointTypeIcon: LoadedAsset;
  pointPropsIcon: LoadedAsset;
} & Pick<MapViewProps, 'onPointClick' | 'backgroundItems' | 'editableMode' | 'onSelectPoints' | 'onChangePoints'>;

export type PointsManager = {
  setEditableMode: (editableMode: MapEditableMode) => void;
  destroy: () => void;
  updatePoints: (points: Point[]) => void;
};

export type UseMapViewOptions = Pick<
  MapViewProps,
  | 'background'
  | 'width'
  | 'height'
  | 'points'
  | 'onPointClick'
  | 'backgroundItems'
  | 'editableMode'
  | 'onSelectPoints'
  | 'onChangePoints'
>;

export type MapViewOptions = {
  container: HTMLDivElement;
  appRef: RefObject<PIXI.Application>;
  onChangeWorld?: (params: { visibleBackgorundItems: MapVisibleBackgroundItem[] }) => void;
} & UseMapViewOptions;

export type MapApp = {
  cleanup: () => void;
  setEditableMode: (editableMode: MapEditableMode) => void;
} & Pick<PointsManager, 'updatePoints'>;
