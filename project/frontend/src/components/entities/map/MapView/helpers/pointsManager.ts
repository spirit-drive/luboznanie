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

/**
 * Создает менеджер для управления точками и соединениями на карте.
 * @param world - Главный PIXI-контейнер карты.
 * @param options - Конфигурация менеджера (например, обработчики событий).
 * @returns Объект с методами `update` и `destroy`.
 */
export const createPointsManager = (world: PIXI.Container, options: PointsManagerOptions): PointsManager => {
  let editableMode: MapEditableMode = 'points';

  // Контейнеры для раздельной отрисовки линий и точек
  const connectionsContainer = new PIXI.Container();
  const pointsContainer = new PIXI.Container();
  world.addChild(connectionsContainer, pointsContainer); // Линии будут под точками

  const renderedPoints = new Map<PointID, PointVisuals>();
  const selectedPoints = new Map<PointID, PointVisuals>();

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
          },
          onPointClick: (point) => {
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
