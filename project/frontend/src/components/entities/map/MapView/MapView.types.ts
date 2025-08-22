import { Point, PointID, Connection, AddingPoint } from '@/types/entities/point/point.types';
import {
  AddingBackgroundType,
  BackgroundItem,
  LoadedAsset,
  MapBackground,
  MapVisibleBackgroundItem,
} from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { Ref, RefObject } from 'react';

export type MapEditableMode = 'none' | 'points' | 'backgrounds';
export type PointEditableState = 'default' | 'selected' | 'hover';
export type MapPoint = Point & { state: PointEditableState };

export type SelectedSpace = { minX: number; minY: number; maxX: number; maxY: number };
export type SelectedPhase = 'move' | 'end';

export type OnSelectedSpace = (space: SelectedSpace, phase: SelectedPhase, event: PIXI.FederatedPointerEvent) => void;

export type MapControllerOptions = {
  onChangeZoom?: (newScale: number, zoomCenter: PIXI.Point) => void;
  onChangeWorld?: () => void;
  onSelectedSpace?: OnSelectedSpace;
  shouldStartSelecting?: (editableMode: MapEditableMode, event: PIXI.FederatedPointerEvent) => boolean;
};

export type MapViewProps = {
  addingElement: AddingElement;
  onAddedElement: (added: AddedElement) => void;
  ref?: Ref<MapViewController>;
  className?: string;
  points: Point[];
  backgroundItems?: BackgroundItem[];
  background?: MapBackground;
  width: number;
  height: number;
  onPointClick: (point: Point) => void;
  editableMode?: MapEditableMode;
  onSelectPoints?: (selectedPoints: Point[]) => void;
  onChangePoints?: (points: Point[]) => void;
};

export type { Point, PointID, MapBackground, Connection };

export type PointVisuals = {
  container: PIXI.Container<ContainerChild>;
  circle: PIXI.Graphics;
  progress: PIXI.Graphics;
  setEditableMode: (editableMode: MapEditableMode) => void;
  point: Point;
  setActive: (active: boolean) => void;
};

export type PointsManagerOptions = {
  shouldUnselect?: (event: PIXI.FederatedPointerEvent) => boolean;
  pointTypeIcon: LoadedAsset;
  pointPropsIcon: LoadedAsset;
} & Pick<MapViewProps, 'onPointClick' | 'backgroundItems' | 'editableMode' | 'onSelectPoints' | 'onChangePoints'>;

export type PointVisualOptions = {
  onPointClick?: (point: Point, event: PIXI.FederatedPointerEvent) => void;
  onPointDown?: (point: Point, event: PIXI.FederatedPointerEvent) => void;
} & Omit<PointsManagerOptions, 'onPointClick'>;

export type PointsManager = {
  selectPoints: (ids: PointID[]) => void;
  selectAllPoints: () => void;
  pointContainer: PIXI.Container;
  selectPointsBySpace: OnSelectedSpace;
  setEditableMode: (editableMode: MapEditableMode) => void;
  destroy: () => void;
  updatePoints: (points: Point[]) => void;
  resetPointsSelecting: () => void;
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

export type MapViewController = {
  setVolume: (volume: number) => void;
} & Pick<PointsManager, 'selectAllPoints' | 'selectPoints'>;

export type TMapView = {
  containerRef: RefObject<HTMLDivElement>;
} & MapViewController;

export type MapViewOptions = {
  container: HTMLDivElement;
  appRef: RefObject<PIXI.Application>;
  onChangeWorld?: (params: { visibleBackgorundItems: MapVisibleBackgroundItem[] }) => void;
} & UseMapViewOptions;

export type MapApp = {
  cleanup: () => void;
  setEditableMode: (editableMode: MapEditableMode) => void;
} & Pick<PointsManager, 'updatePoints' | 'selectAllPoints' | 'selectPoints'>;

export type AddingPointType = {
  type: 'point';
  value: AddingPoint;
};

export type AddingBackgroundItemType = {
  type: 'background';
  value: AddingBackgroundType;
};

export type AddingElement = AddingPointType | AddingBackgroundItemType;

export type AddedPointType = {
  type: 'point';
  value: Point;
};

export type AddedBackgroundItemType = {
  type: 'background';
  value: BackgroundItem;
};

export type AddedElement = AddedPointType | AddedBackgroundItemType;
