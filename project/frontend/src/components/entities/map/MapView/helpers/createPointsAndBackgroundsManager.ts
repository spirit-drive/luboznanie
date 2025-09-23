import * as PIXI from 'pixi.js';
import {
  MapEditableMode,
  OnSelectedSpace,
  Point,
  PointID,
  PointsManager,
  PointsManagerOptions,
  PointVisuals,
} from '../MapView.types';
import { createPointVisual } from './createPointVisual';
import { createUpdateConnections } from '@/components/entities/map/MapView/helpers/createUpdateConnections';
import { getAllChildren } from '@/components/entities/map/MapView/helpers/helpers';
import { AddingPoint } from '@/types/entities/point/point.types';
import { deepCopy } from '@/utils/deepCopy';
import { createSingleDoubleAction } from '@/utils/createSingleDoubleAction';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { createAddingPoint } from '@/components/entities/map/MapView/helpers/createAddingPoint';
import { isAnyPointerEvent } from '@/components/entities/map/MapView/helpers/isAnyPointerEvent';
import { PointsAndBackgroundsManagerState } from '@/components/entities/map/MapView/helpers/types';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/createPointsManager';

export const createPointsAndBackgroundsManager = (
  app: PIXI.Application,
  world: PIXI.Container<ContainerChild>,
  options: PointsManagerOptions,
): PointsManager => {
  const { onAddedElement } = options;

  // Контейнеры для раздельной отрисовки, линии под точками
  const connectionsContainer = new PIXI.Container();
  const pointItemsContainer = new PIXI.Container();
  const pointContainer = new PIXI.Container();
  pointContainer.addChild(connectionsContainer, pointItemsContainer);
  world.addChild(pointContainer);

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
  };

  const {
    resetPointsSelecting,
    selectPointsBySpace,
    selectAllPoints,
    mountAddingPoint,
    unmountAddingPoint,
    applyPointChanges,
    updatePoints,
  } = createPointsManager({ state, world, options, app, connectionsContainer, pointItemsContainer });

  const onKeyDown = (event: KeyboardEvent) => {
    if (state.editableMode === 'points' && state.selectedPoints.size > 0) {
      let deltaX = 0;
      let deltaY = 0;
      const shift = event.shiftKey ? 10 : 1;

      switch (event.key) {
        case 'ArrowUp':
          deltaY = -shift;
          break;
        case 'ArrowDown':
          deltaY = shift;
          break;
        case 'ArrowLeft':
          deltaX = -shift;
          break;
        case 'ArrowRight':
          deltaX = shift;
          break;
        default:
          return;
      }

      event.preventDefault();

      state.selectedPoints.forEach((pointVisual) => {
        pointVisual.container.position.x += deltaX;
        pointVisual.container.position.y += deltaY;
      });

      applyPointChanges();
    }
  };

  const onAppPointerUp = createSingleDoubleAction<PIXI.FederatedPointerEvent>({
    alwaysHandler: (): boolean => {
      switch (state.editableMode) {
        case 'points': {
          if (!state.addingPoint?.container.visible) return false;
          const id = Math.random().toString(16);
          const value: Point = {
            ...deepCopy(state.addingPoint.point),
            id,
            position: {
              x: state.addingPoint.container.position.x,
              y: state.addingPoint.container.position.y,
            },
          };
          onAddedElement?.({ type: 'point', value });
          // Чтобы сработало после добавления
          setTimeout(applyPointChanges);
          return true;
        }

        default:
          return false;
      }
    },
    doubleHandler: (event) => {
      switch (state.editableMode) {
        case 'points': {
          const isPointerClick = isAnyPointerEvent(event, state.renderedPoints);
          if (isPointerClick) return;

          if (state.selectedPoints.size) resetPointsSelecting();
          else selectAllPoints();

          break;
        }

        default:
          break;
      }
    },
  });

  const destroy = () => {
    world.removeChild(connectionsContainer, pointItemsContainer);
    connectionsContainer.destroy({ children: true });
    pointItemsContainer.destroy({ children: true });
    state.renderedPoints.clear();
    state.selectedPoints.clear();
    app.stage.off('pointerup', onAppPointerUp);
    document.removeEventListener('keydown', onKeyDown);
    unmountAddingPoint();
  };

  // Инициализация: добавляем слушатель клавиатуры
  document.addEventListener('keydown', onKeyDown);

  app.stage.on('pointerup', onAppPointerUp);

  return {
    updatePoints,
    destroy,
    setEditableMode: (mode: MapEditableMode) => {
      state.renderedPoints.forEach((item) => {
        item.setEditableMode(mode);
      });
      state.editableMode = mode;
    },
    resetPointsSelecting,
    selectPointsBySpace,
    pointContainer,
    setAddingElement: (addingElement) => {
      if (state.editableMode === 'points') {
        if (!addingElement) {
          if (state.addingPoint) {
            state.addingPoint.container.visible = state.addingPointVisible = false;
          }
          return;
        }

        if (state.addingPoint) {
          state.addingPoint.container.visible = state.addingPointVisible = true;
        } else {
          state.addingPointVisible = true;
          mountAddingPoint(state.editableMode, addingElement);
        }
      }
    },
    shouldMapPreventScrolling: () => {
      return !!state.addingPoint?.container.visible;
    },
    selectAllPoints: () => {
      if (state.editableMode !== 'points') return;
      state.selectedPoints = new Map(state.renderedPoints);
      state.selectedPoints.values().forEach((i) => {
        i.setActive(true);
      });
    },
    setVisibleOfAddingElement: (visible) => {
      if (state.editableMode !== 'points' && state.editableMode !== 'backgrounds') return;
      if (state.addingPoint) state.addingPoint.container.visible = state.addingPointVisible = visible;
    },
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
  };
};
