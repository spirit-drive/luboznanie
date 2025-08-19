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

export const createPointsManager = (
  app: PIXI.Application,
  world: PIXI.Container,
  options: PointsManagerOptions,
): PointsManager => {
  let editableMode: MapEditableMode = 'points';

  // Контейнеры для раздельной отрисовки линий и точек
  const connectionsContainer = new PIXI.Container();
  const pointsContainer = new PIXI.Container();
  world.addChild(connectionsContainer, pointsContainer); // Линии будут под точками

  const renderedPoints = new Map<PointID, PointVisuals>();
  const selectedPoints = new Map<PointID, PointVisuals>();

  let isDragging = false;
  let startPosition: PIXI.Point | null = null;
  let dragOffset: PIXI.Point | null = null;

  /**
   * Основная функция обновления. Сравнивает новые данные с отрисованными и применяет изменения.
   * @param points - Новый массив точек для отображения.
   */
  const updatePoints = (points: Point[]) => {
    const currentIds = new Set(renderedPoints.keys());
    const newIds = new Set(points.map((item) => item.id));

    // 1. Удаление старых точек, которых нет в новом массиве
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        const pointVisual = renderedPoints.get(id);
        if (pointVisual) {
          pointsContainer.removeChild(pointVisual.container);
          pointVisual.container.destroy({ children: true });
        }
        renderedPoints.delete(id);
      }
    }

    // 2. Добавление и обновление существующих точек
    for (const pointData of points) {
      const existingVisual = renderedPoints.get(pointData.id);

      if (existingVisual) {
        // --- Логика обновления ---
        existingVisual.container.position.set(pointData.position.x, pointData.position.y);
      } else {
        // --- Логика создания ---
        const newVisual = createPointVisual(pointData, {
          ...options,
          onPointDown: (point, event) => {
            event.stopPropagation();
            if (editableMode === 'points' && selectedPoints.has(point.id)) {
              console.log('onPointDown');
              isDragging = true;
              startPosition = event.global.clone();

              const localMousePosition = world.toLocal(event.global);
              dragOffset = new PIXI.Point(
                localMousePosition.x - point.position.x,
                localMousePosition.y - point.position.y,
              );

              app.stage.on('pointermove', onMouseMove);
              app.stage.on('pointerup', onMouseUp);
            }
          },
          onPointClick: (point) => {
            if (isDragging) return;
            options.onPointClick?.(point);
            if (editableMode === 'points') {
              if (selectedPoints.has(point.id)) {
                selectedPoints.get(point.id)?.setActive(false);
                selectedPoints.delete(point.id);
              } else {
                selectedPoints.set(point.id, newVisual);
                newVisual.setActive(true);
              }
            }
          },
        });
        renderedPoints.set(pointData.id, newVisual);
        pointsContainer.addChild(newVisual.container);
      }
    }

    // 3. Вызов новой функции для обновления связей
    updateConnections(connectionsContainer, renderedPoints)(points);
  };

  const onMouseMove = (event: PIXI.FederatedMouseEvent) => {
    if (isDragging && startPosition && dragOffset) {
      event.stopPropagation();

      const newLocalPosition = world.toLocal(event.global);

      const newPositionX = newLocalPosition.x - dragOffset.x;
      const newPositionY = newLocalPosition.y - dragOffset.y;

      const deltaX = newPositionX - selectedPoints.values().next().value.container.position.x;
      const deltaY = newPositionY - selectedPoints.values().next().value.container.position.y;

      selectedPoints.forEach((pointVisual) => {
        pointVisual.container.position.x += deltaX;
        pointVisual.container.position.y += deltaY;
      });
    }
  };
  const onMouseUp = () => {
    if (isDragging) {
      setTimeout(() => {
        isDragging = false;
        startPosition = null;
        dragOffset = null;
      });
      // Удаляем слушатели, чтобы не засорять память
      app.stage.off('pointermove', onMouseMove);
      app.stage.off('pointerup', onMouseUp);
    }
  };

  const destroy = () => {
    world.removeChild(connectionsContainer, pointsContainer);
    connectionsContainer.destroy({ children: true });
    pointsContainer.destroy({ children: true });
    renderedPoints.clear();
    selectedPoints.clear();
  };

  const setEditableMode = (mode: MapEditableMode) => {
    renderedPoints.forEach((item) => {
      item.setEditableMode(mode);
    });
    editableMode = mode;
  };

  const selectPiintsBySpace: OnSelectedSpace = (space, phase, event) => {
    if (phase === 'end') {
      const selected = renderedPoints.entries().reduce<{ id: PointID; point: PointVisuals }[]>((acc, [id, point]) => {
        const { x, y } = point.container.position;
        if (x < space.minX || x > space.maxX || y < space.minY || y > space.maxY) return acc;
        acc.push({ id, point });
        return acc;
      }, []);

      if (event.ctrlKey) {
        selected.forEach((item) => {
          item.point.setActive(false);
          selectedPoints.delete(item.id);
        });
      } else {
        selected.forEach((item) => {
          item.point.setActive(true);
          selectedPoints.set(item.id, item.point);
        });
      }
    }
  };

  return {
    updatePoints,
    destroy,
    setEditableMode,
    resetPointsSelecting: () => {
      selectedPoints.forEach((item) => {
        item.setActive(false);
      });
      selectedPoints.clear();
    },
    selectPiintsBySpace,
  };
};
