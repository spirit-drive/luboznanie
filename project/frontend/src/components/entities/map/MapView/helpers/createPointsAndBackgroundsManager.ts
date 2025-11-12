import * as PIXI from 'pixi.js';
import {
  BGItemVisuals,
  MapEditableMode,
  PointID,
  PointsManager,
  PointsManagerOptions,
  PointVisuals,
} from '../MapView.types';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { PointsAndBackgroundsManagerState } from '@/components/entities/map/MapView/helpers/types';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/createPointsManager';
import { createBackgroundItemsManager } from '@/components/entities/map/MapView/helpers/createBackgroundItemsManager';

export const createPointsAndBackgroundsManager = (
  app: PIXI.Application,
  world: PIXI.Container<ContainerChild>,
  options: PointsManagerOptions,
): PointsManager => {
  const state: PointsAndBackgroundsManagerState = {
    addingPoint: null,
    addingPointVisible: false,
    editableMode: 'none',
    isDragging: false,
    moved: false,
    dragStartGlobal: null,
    dragOffset: null,
    movablePoint: null,
    renderedPoints: new Map<PointID, PointVisuals>(),
    selectedPoints: new Map<PointID, PointVisuals>(),
    renderedBGItems: new Map<PointID, BGItemVisuals>(),
    selectedBGItems: new Map<PointID, BGItemVisuals>(),
    movableBGItem: null,
    addingBGItemVisible: false,
    addingBGItem: null,
  };

  const {
    backgroundItemsMap,
    backgroundContainer,
    destroyBackgroundItemsManager,
    updateBGITems,
    resetBGItemsSelecting,
    selectAllBGItems,
    selectBGItemsBySpace,
    mountAddingBGItem,
    onUpZIndex,
    onDownZIndexActive,
    onDownZIndex,
    onUpZIndexActive,
    unmountAddingBGItem,
    onMoveAddingBGItem,
  } = createBackgroundItemsManager({
    state,
    world,
    options,
    app,
  });

  options.drawFog();

  const { resetPointsSelecting, selectPointsBySpace, mountAddingPoint, pointsContainer, updatePoints, destroyPoints } =
    createPointsManager({ state, world, options, app });

  const destroy = () => {
    destroyBackgroundItemsManager();
    destroyPoints();
  };

  return {
    updateBGITems,
    updatePoints,
    destroy,
    onUpZIndexBGItems: onUpZIndex,
    onDownZIndexActiveBGItems: onDownZIndexActive,
    onDownZIndexBGItems: onDownZIndex,
    onUpZIndexActiveBGItems: onUpZIndexActive,
    unmountAddingBGItem,
    onMoveAddingBGItem,
    setEditableMode: (mode: MapEditableMode) => {
      state.renderedPoints.forEach((item) => {
        item.setEditableMode(mode);
      });
      state.renderedBGItems.forEach((item) => {
        item.setEditableMode(mode);
      });
      state.editableMode = mode;
      pointsContainer.alpha = mode === 'backgrounds' ? 0.2 : 1;
      pointsContainer.eventMode = mode === 'backgrounds' ? 'none' : 'auto';
      backgroundContainer.eventMode = mode === 'backgrounds' ? 'auto' : 'none';
    },
    resetPointsSelecting,
    selectBGItemsBySpace,
    selectPointsBySpace,
    setAddingElement: (addingElement) => {
      switch (state.editableMode) {
        case 'points': {
          if (!addingElement) {
            if (state.addingPoint) {
              state.addingPoint.container.visible = state.addingPointVisible = false;
            }
            return;
          }

          if (state.addingPoint) {
            state.addingPoint.container.visible = state.addingPointVisible = true;
          } else if (addingElement.type === 'point') {
            state.addingPointVisible = true;
            mountAddingPoint(state.editableMode, addingElement.value);
          }
          break;
        }

        case 'backgrounds': {
          if (!addingElement) {
            if (state.addingBGItem) {
              state.addingBGItem.container.visible = state.addingBGItemVisible = false;
            }
            return;
          }

          if (state.addingBGItem) {
            state.addingBGItem.container.visible = state.addingBGItemVisible = true;
          } else if (addingElement.type === 'background') {
            state.addingBGItemVisible = true;
            mountAddingBGItem(state.editableMode, addingElement.value);
          }
          break;
        }
      }
    },
    shouldMapPreventScrolling: () => {
      return !!state.addingPoint?.container.visible || !!state.addingBGItem?.container.visible;
    },
    selectAllPoints: () => {
      if (state.editableMode !== 'points') return;
      state.selectedPoints = new Map(state.renderedPoints);
      state.selectedPoints.values().forEach((i) => {
        i.setActive(true);
      });
    },
    setVisibleOfAddingElement: (visible) => {
      switch (state.editableMode) {
        case 'points': {
          if (state.addingPoint) state.addingPoint.container.visible = state.addingPointVisible = visible;
          break;
        }

        case 'backgrounds': {
          if (state.addingBGItem) state.addingBGItem.container.visible = state.addingBGItemVisible = visible;
          break;
        }
      }
    },
    backgroundItemsMap,
    selectPoints: (ids) => {
      if (state.editableMode !== 'points') return;
      ids.forEach((i) => {
        if (state.renderedPoints.has(i)) {
          const point = state.renderedPoints.get(i)!;
          state.selectedPoints.set(i, point);
          point.setActive(true);
        }
      });
    },
    resetBGItemsSelecting,
    selectAllBGItems,
  };
};
