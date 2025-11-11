import { Point, PointID, Connection, AddingPoint } from '@/types/entities/point/point.types';
import {
  AddingBackgroundType,
  BackgroundItem,
  LoadedAsset,
  MapBackground,
  MapBackgroundItem,
  MapVisibleBackgroundItem,
} from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { Ref, RefObject } from 'react';
import { PointsAndBackgroundsManagerState } from '@/components/entities/map/MapView/helpers/types';

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
  shouldPreventScrolling?: (event: PIXI.FederatedPointerEvent) => boolean;
  shouldStartSelecting?: (editableMode: MapEditableMode, event: PIXI.FederatedPointerEvent) => boolean;
};

export type MapViewProps = {
  shouldUnselectByRect: (event: PIXI.FederatedPointerEvent) => boolean;
  shouldConnectPoints: (event: PIXI.FederatedPointerEvent) => boolean;
  addingElement: AddingElement | null;
  onAddedElement: (added: AddedElement) => void;
  ref?: Ref<MapViewController>;
  className?: string;
  points: Point[];
  backgroundItems?: BackgroundItem[];
  background?: MapBackground;
  width: number;
  height: number;
  onPointClick: (point: Point) => void;
  onBGItemClick: (bgItem: BackgroundItem) => void;
  editableMode?: MapEditableMode;
  onSelectPoints?: (selectedPoints: Point[]) => void;
  onChangePoints?: (points: Point[]) => void;
  onChangeBGItems?: (bgItems: BackgroundItem[]) => void;
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

export type BGItemVisuals = {
  container: PIXI.Container<ContainerChild>;
  sprite: PIXI.Sprite;
  bgItem: BackgroundItem;
  setEditableMode: (editableMode: MapEditableMode) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setActive: (active: boolean) => void;
  setIsHover: (isHover: boolean) => void;
};

export type PointsManagerOptions = {
  pointTypeIcon: LoadedAsset;
  pointPropsIcon: LoadedAsset;
  backgroundItems?: BackgroundItem[];
  backgroundAssets: Record<string, LoadedAsset>;
  drawFog: () => void;
} & Pick<
  MapViewProps,
  | 'onBGItemClick'
  | 'onChangeBGItems'
  | 'shouldUnselectByRect'
  | 'onAddedElement'
  | 'onPointClick'
  | 'shouldConnectPoints'
  | 'backgroundItems'
  | 'editableMode'
  | 'onSelectPoints'
  | 'onChangePoints'
>;

export type PointVisualOptions = {
  onPointClick?: (point: Point, event: PIXI.FederatedPointerEvent) => void;
  onPointDown?: (point: Point, event: PIXI.FederatedPointerEvent) => void;
} & Omit<PointsManagerOptions, 'onPointClick'>;

export type BGItemVisualOptions = {
  app: PIXI.Application;
  state: PointsAndBackgroundsManagerState;
  onBGItemClick?: (bgItem: BackgroundItem, event: PIXI.FederatedPointerEvent) => void;
  onBGItemMove?: (bgItem: BackgroundItem, event: PIXI.FederatedPointerEvent) => void;
  onBGItemOut?: (bgItem: BackgroundItem, event: PIXI.FederatedPointerEvent) => void;
  onBGItemDown?: (bgItem: BackgroundItem, event: PIXI.FederatedPointerEvent) => void;
} & Pick<PointsManagerOptions, 'backgroundAssets'>;

export type PointsManager = {
  setVisibleOfAddingElement: (visible: boolean) => void;
  selectPoints: (ids: PointID[]) => void;
  selectAllPoints: () => void;
  backgroundItemsMap: Map<string, MapBackgroundItem> | undefined;
  setAddingElement: (addingElement: AddingElement | null) => void;
  shouldMapPreventScrolling: (event: PIXI.FederatedPointerEvent) => boolean;
  selectPointsBySpace: OnSelectedSpace;
  selectBGItemsBySpace: OnSelectedSpace;
  setEditableMode: (editableMode: MapEditableMode) => void;
  destroy: () => void;
  updatePoints: (points: Point[]) => void;
  updateBGITems: (bgItems: BackgroundItem[]) => void;
  resetPointsSelecting: () => void;
  resetBGItemsSelecting: () => void;
  selectAllBGItems: () => void;
};

export type UseMapViewOptions = Pick<
  MapViewProps,
  | 'onBGItemClick'
  | 'onChangeBGItems'
  | 'shouldConnectPoints'
  | 'shouldUnselectByRect'
  | 'background'
  | 'addingElement'
  | 'onAddedElement'
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
} & Pick<PointsManager, 'selectAllPoints' | 'selectPoints' | 'setVisibleOfAddingElement'>;

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
  setAddingElement: (addingElement: AddingElement | null) => void;
} & Pick<
  PointsManager,
  'updatePoints' | 'updateBGITems' | 'selectAllPoints' | 'selectPoints' | 'setVisibleOfAddingElement'
>;

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
