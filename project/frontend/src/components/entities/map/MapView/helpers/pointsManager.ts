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
import { updateConnections } from '@/components/entities/map/MapView/helpers/updateConnections';

// Интерфейс для внутреннего состояния менеджера
interface PointsManagerState {
  editableMode: MapEditableMode;
  isDragging: boolean;
  moved: boolean;
  timestampAppDoubleTap: number;
  timestampPointTapDoubleTap: number;
  timeoutPointTap: number;
  dragStartGlobal: PIXI.Point | null;
  dragOffset: PIXI.Point | null;
  movablePoint: PointVisuals | null;
  renderedPoints: Map<PointID, PointVisuals>;
  selectedPoints: Map<PointID, PointVisuals>;
}

const TIMEOUT = 200;

export const createPointsManager = (
  app: PIXI.Application,
  world: PIXI.Container,
  options: PointsManagerOptions,
): PointsManager => {
  const { shouldUnselect = (e: PIXI.FederatedPointerEvent) => e.metaKey || e.ctrlKey, onChangePoints } = options;

  // Контейнеры для раздельной отрисовки, линии под точками
  const connectionsContainer = new PIXI.Container();
  const pointsContainer = new PIXI.Container();
  world.addChild(connectionsContainer, pointsContainer);

  const state: PointsManagerState = {
    timeoutPointTap: 0,
    timestampAppDoubleTap: 0,
    timestampPointTapDoubleTap: 0,
    editableMode: 'points',
    isDragging: false,
    moved: false,
    dragStartGlobal: null,
    dragOffset: null,
    movablePoint: null,
    renderedPoints: new Map<PointID, PointVisuals>(),
    selectedPoints: new Map<PointID, PointVisuals>(),
  };

  /**
   * Применяет изменения к данным точек и обновляет визуализацию.
   * Вызывается при перемещении точек мышью или клавиатурой.
   */
  const applyPointChanges = () => {
    const newPoints = Array.from(state.renderedPoints.values()).map((visual) => ({
      ...visual.point,
      position: {
        x: visual.container.position.x,
        y: visual.container.position.y,
      },
    }));
    onChangePoints?.(newPoints);
  };

  /**
   * --- ОБРАБОТЧИКИ СОБЫТИЙ МЫШИ И КЛАВИАТУРЫ ---
   */

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
      state.moved = false;
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
  };

  const selectPoints = (points: PointVisuals[]) => {
    points.forEach((pointVisual) => {
      pointVisual.setActive(true);
      state.selectedPoints.set(pointVisual.point.id, pointVisual);
    });
  };

  const onPointClick = (point: Point) => {
    if (state.moved) return;

    options.onPointClick?.(point);
    if (state.editableMode !== 'points') return;

    const pointVisual = state.renderedPoints.get(point.id);
    if (!pointVisual) return;

    if (Date.now() - state.timestampPointTapDoubleTap >= TIMEOUT) {
      state.timestampPointTapDoubleTap = Date.now();

      clearTimeout(state.timeoutPointTap);
      state.timeoutPointTap = setTimeout(() => {
        if (state.selectedPoints.has(point.id)) unselectPoints([pointVisual]);
        else selectPoints([pointVisual]);
      }, TIMEOUT) as number;

      return;
    }

    clearTimeout(state.timeoutPointTap);

    const children = point.connections
      .map((i) => state.renderedPoints.get(i.pointId))
      .filter(Boolean) as PointVisuals[];
    if (state.selectedPoints.has(point.id)) unselectPoints([...children, pointVisual]);
    else selectPoints([...children, pointVisual]);
  };

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

  const onAppPointerUp = (event: PIXI.FederatedPointerEvent) => {
    if (Date.now() - state.timestampAppDoubleTap >= TIMEOUT) {
      state.timestampAppDoubleTap = Date.now();
      return;
    }

    const isPointerClick = state.renderedPoints.values().some((i) => i.container === event.target);
    if (isPointerClick) return;

    if (state.selectedPoints.size) resetPointsSelecting();
    else selectAll();
  };

  /**
   * --- ОСНОВНЫЕ МЕТОДЫ МЕНЕДЖЕРА ---
   */

  /**
   * Сравнивает новые данные с отрисованными и применяет изменения.
   */
  const updatePoints = (points: Point[]) => {
    const currentIds = new Set(state.renderedPoints.keys());
    const newIds = new Set(points.map((item) => item.id));

    // 1. Удаление старых точек
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        const pointVisual = state.renderedPoints.get(id);
        if (pointVisual) {
          pointsContainer.removeChild(pointVisual.container);
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
          onPointClick: onPointClick,
        });
        state.renderedPoints.set(pointData.id, newVisual);
        pointsContainer.addChild(newVisual.container);
      }
    }

    // 3. Обновление связей
    updateConnections(connectionsContainer, state.renderedPoints)(points);
  };

  const setEditableMode = (mode: MapEditableMode) => {
    state.renderedPoints.forEach((item) => {
      item.setEditableMode(mode);
    });
    state.editableMode = mode;
  };

  const resetPointsSelecting = () => {
    state.selectedPoints.forEach((item) => {
      item.setActive(false);
    });
    state.selectedPoints.clear();
  };

  const selectAll = () => {
    state.selectedPoints = new Map<PointID, PointVisuals>(state.renderedPoints);
    state.selectedPoints.forEach((item) => {
      item.setActive(true);
    });
  };

  const selectPiintsBySpace: OnSelectedSpace = (space, phase, event) => {
    if (phase === 'end') {
      const pointsInSpace = Array.from(state.renderedPoints.entries()).filter(([id, point]) => {
        const { x, y } = point.container.position;
        return x >= space.minX && x <= space.maxX && y >= space.minY && y <= space.maxY;
      });

      if (shouldUnselect!(event)) {
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
    }
  };

  /**
   * Очистка ресурсов
   */
  const destroy = () => {
    world.removeChild(connectionsContainer, pointsContainer);
    connectionsContainer.destroy({ children: true });
    pointsContainer.destroy({ children: true });
    state.renderedPoints.clear();
    state.selectedPoints.clear();
    app.stage.off('pointerup', onAppPointerUp);
    document.removeEventListener('keydown', onKeyDown);
  };

  // Инициализация: добавляем слушатель клавиатуры
  document.addEventListener('keydown', onKeyDown);

  app.stage.on('pointerup', onAppPointerUp);

  return {
    updatePoints,
    destroy,
    setEditableMode,
    resetPointsSelecting,
    selectPiintsBySpace,
  };
};
