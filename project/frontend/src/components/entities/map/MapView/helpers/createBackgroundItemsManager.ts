import { createUpdateConnections } from '@/components/entities/map/MapView/helpers/createUpdateConnections';
import * as PIXI from 'pixi.js';
import { isAnyPointerEvent } from '@/components/entities/map/MapView/helpers/isAnyPointerEvent';
import {
  MapEditableMode,
  OnSelectedSpace,
  Point,
  PointsManagerOptions,
  PointVisuals,
} from '@/components/entities/map/MapView/MapView.types';
import { AddingPoint } from '@/types/entities/point/point.types';
import { createAddingPoint } from '@/components/entities/map/MapView/helpers/createAddingPoint';
import { deepCopy } from '@/utils/deepCopy';
import { createSingleDoubleAction } from '@/utils/createSingleDoubleAction';
import { getAllChildren } from '@/components/entities/map/MapView/helpers/helpers';
import { createPointVisual } from '@/components/entities/map/MapView/helpers/createPointVisual';
import { PointsAndBackgroundsManagerState } from '@/components/entities/map/MapView/helpers/types';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { MapBackgroundItem } from '@/types/entities/map/map.types';
import { createBGItemVisual } from '@/components/entities/map/MapView/helpers/createBGItemVisual';

export const createBackgroundItemsManager = ({
  app,
  world,
  options,
  state,
}: {
  state: PointsAndBackgroundsManagerState;
  app: PIXI.Application;
  world: PIXI.Container<ContainerChild>;
  options: PointsManagerOptions;
}) => {
  const { shouldUnselectByRect, onChangePoints, shouldConnectPoints, backgroundItems, backgroundAssets } = options;

  const backgroundContainer = new PIXI.Container();
  const backgroundItemsMap = new Map<string, MapBackgroundItem>();
  if (backgroundItems) {
    backgroundItems.forEach((item) => {
      try {
        const { container } = createBGItemVisual(item, {
          backgroundAssets,
          onPointClick: () => {},
          onPointDown: () => {},
        });
        backgroundContainer.addChild(container);
        backgroundItemsMap.set(item.id, { container, backgroundItem: item });
      } catch (e) {
        console.warn(e);
      }
    });
  }

  world.addChild(backgroundContainer);

  return {
    backgroundItemsMap,
  };

  const connectionsContainer = new PIXI.Container();
  const pointItemsContainer = new PIXI.Container();
  const pointsContainer = new PIXI.Container();
  pointsContainer.addChild(connectionsContainer, pointItemsContainer);
  world.addChild(pointsContainer);

  const updateConnections = createUpdateConnections(connectionsContainer, state);

  const onMoveAddingPoint = (event: PIXI.FederatedPointerEvent) => {
    if (state.addingPoint) {
      state.addingPoint.container.visible = state.addingPointVisible && !isAnyPointerEvent(event, state.renderedPoints);
      const localPosition = world.toLocal(event.global);
      state.addingPoint.container.position.copyFrom(localPosition);
    }
  };

  const unmountAddingPoint = () => {
    if (state.addingPoint) {
      pointItemsContainer.removeChild(state.addingPoint.container);
      state.addingPoint.container.destroy({ children: true });
      state.addingPoint = null;
    }
    app.stage.off('pointermove', onMoveAddingPoint);
  };

  const mountAddingPoint = (mode: MapEditableMode, addingPoint: AddingPoint) => {
    state.addingPoint = createAddingPoint({ x: 0, y: 0 }, addingPoint, options); // Начальная позиция
    pointItemsContainer.addChild(state.addingPoint.container);
    app.stage.on('pointermove', onMoveAddingPoint);
  };

  const applyPointChanges = () => {
    const newPoints = Array.from(state.renderedPoints.values()).map((visual) => ({
      ...deepCopy(visual.point),
      position: {
        x: visual.container.position.x,
        y: visual.container.position.y,
      },
    }));
    onChangePoints?.(newPoints);
  };

  const onPointerDown = (pointVisual: PointVisuals, event: PIXI.FederatedPointerEvent) => {
    event.stopPropagation();
    if (state.editableMode === 'points' && state.selectedPoints.has(pointVisual.point.id)) {
      state.isDragging = true;
      state.dragStartGlobal = event.global.clone();

      const localMousePosition = world.toLocal(event.global);
      state.dragOffset = new PIXI.Point(
        localMousePosition.x - pointVisual.point.position.x,
        localMousePosition.y - pointVisual.point.position.y,
      );

      state.movablePoint = pointVisual;

      // Привязываем обработчики к сцене, чтобы отслеживать движение за пределами точки
      app.stage.on('pointermove', onPointerMove);
      app.stage.on('pointerup', onPointerUp);
    }
  };

  const onPointerMove = (event: PIXI.FederatedPointerEvent) => {
    if (!state.isDragging || !state.dragStartGlobal || !state.dragOffset || !state.movablePoint) {
      return;
    }

    state.moved = true;
    const newLocalPosition = world.toLocal(event.global);

    const deltaX = newLocalPosition.x - state.dragOffset.x - state.movablePoint.container.position.x;
    const deltaY = newLocalPosition.y - state.dragOffset.y - state.movablePoint.container.position.y;

    state.selectedPoints.forEach((pointVisual) => {
      pointVisual.container.position.x += deltaX;
      pointVisual.container.position.y += deltaY;
    });

    applyPointChanges();
  };

  const onPointerUp = () => {
    if (!state.isDragging) return;

    // Сбрасываем состояние после задержки, чтобы избежать ложных 'clicks'
    setTimeout(() => {
      state.isDragging = false;
      state.dragStartGlobal = null;
      state.dragOffset = null;
      state.movablePoint = null;
    });

    app.stage.off('pointermove', onPointerMove);
    app.stage.off('pointerup', onPointerUp);
  };

  const unselectPoints = (points: PointVisuals[]) => {
    points.forEach((pointVisual) => {
      pointVisual.setActive(false);
      state.selectedPoints.delete(pointVisual.point.id);
    });
    updateConnections();
  };

  const selectPoints = (points: PointVisuals[]) => {
    points.forEach((pointVisual) => {
      pointVisual.setActive(true);
      state.selectedPoints.set(pointVisual.point.id, pointVisual);
    });
    updateConnections();
  };

  const onPointClick = createSingleDoubleAction<PIXI.FederatedPointerEvent>({
    alwaysHandler: (_, point: Point) => {
      options.onPointClick?.(point);

      return false;
    },
    singleHandler: (event, point: Point) => {
      if (state.moved) {
        state.moved = false;
        return;
      }

      if (state.editableMode !== 'points') return;

      if (state.selectedPoints.size === 1) {
        const selected = [...state.selectedPoints.values()][0] as PointVisuals;
        if (point.id !== selected.point.id && shouldConnectPoints(event)) {
          if (
            !point.connections.some((i) => i.pointId === selected.point.id) &&
            !selected.point.connections.some((i) => i.pointId === point.id)
          ) {
            selected.point.connections.push({ id: Math.random().toString(), pointId: point.id });
          } else {
            selected.point.connections = selected.point.connections.filter((i) => i.pointId !== point.id);
          }
          updateConnections();
          return;
        }
      }

      const pointVisual = state.renderedPoints.get(point.id);
      if (!pointVisual) return;

      if (state.selectedPoints.has(point.id)) unselectPoints([pointVisual]);
      else selectPoints([pointVisual]);
    },
    doubleHandler: (event, point: Point) => {
      const pointVisual = state.renderedPoints.get(point.id);
      if (!pointVisual) return;

      const children = getAllChildren(point, state.renderedPoints);
      if (state.selectedPoints.has(point.id)) unselectPoints([...children, pointVisual]);
      else selectPoints([...children, pointVisual]);
    },
  });

  const updatePoints = (points: Point[]) => {
    const currentIds = new Set(state.renderedPoints.keys());
    const newIds = new Set(points.map((item) => item.id));

    // 1. Удаление старых точек
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        const pointVisual = state.renderedPoints.get(id);
        if (pointVisual) {
          pointItemsContainer.removeChild(pointVisual.container);
          pointVisual.container.destroy({ children: true });
        }
        state.renderedPoints.delete(id);
        state.selectedPoints.delete(id); // Важно: удаляем из selected
      }
    }

    // 2. Добавление и обновление существующих точек
    for (const pointData of points) {
      const existingVisual = state.renderedPoints.get(pointData.id);

      if (existingVisual) {
        existingVisual.container.position.set(pointData.position.x, pointData.position.y);
        existingVisual.point.position = pointData.position;
      } else {
        const newVisual = createPointVisual(pointData, {
          ...options,
          onPointDown: (point, event) => onPointerDown(newVisual, event),
          onPointClick: (point, event) => onPointClick(event, point),
        });
        newVisual.setEditableMode(state.editableMode);
        state.renderedPoints.set(pointData.id, newVisual);
        pointItemsContainer.addChild(newVisual.container);
      }
    }

    // 3. Обновление связей
    updateConnections();
  };

  const resetPointsSelecting = () => {
    unselectPoints(Array.from(state.selectedPoints.values()));
    state.selectedPoints.clear();
  };

  const selectAllPoints = () => {
    selectPoints(Array.from(state.renderedPoints.values()));
    state.selectedPoints = new Map(state.renderedPoints);
  };

  const selectPointsBySpace: OnSelectedSpace = (space, phase, event) => {
    if (phase === 'end') {
      const pointsInSpace = Array.from(state.renderedPoints.entries()).filter(([, point]) => {
        const { x, y } = point.container.position;
        return x >= space.minX && x <= space.maxX && y >= space.minY && y <= space.maxY;
      });

      if (shouldUnselectByRect!(event)) {
        pointsInSpace.forEach(([id, point]) => {
          point.setActive(false);
          state.selectedPoints.delete(id);
        });
      } else {
        pointsInSpace.forEach(([id, point]) => {
          point.setActive(true);
          state.selectedPoints.set(id, point);
        });
      }
      updateConnections();
    }
  };

  const destroyPoints = () => {
    world.removeChild(connectionsContainer, pointItemsContainer);
    connectionsContainer.destroy({ children: true });
    pointItemsContainer.destroy({ children: true });
    state.renderedPoints.clear();
    state.selectedPoints.clear();
    unmountAddingPoint();
  };

  return {
    destroyPoints,
    pointsContainer,
    selectAllPoints,
    selectPointsBySpace,
    resetPointsSelecting,
    updatePoints,
    selectPoints,
    unselectPoints,
    onPointerUp,
    updateConnections,
    onMoveAddingPoint,
    unmountAddingPoint,
    mountAddingPoint,
    applyPointChanges,
    onPointerDown,
    onPointerMove,
  };
};
