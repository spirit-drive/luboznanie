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

// --- Типы для менеджера ---

const DEFAULT_CONNECTION_WIDTH = 3;
const DEFAULT_CONNECTION_COLOR = '#ccc';

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

  // Словарь для хранения созданных визуальных представлений точек.
  // Ключ - point.id, значение - PIXI-объект. Это нужно для быстрого доступа и обновления.
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
        // Точка уже существует. В будущем здесь будет код для обновления ее вида
        // (например, смена цвета, статуса locked/success).
        // Пока что просто убедимся, что позиция актуальна (для режима редактирования).
        existingVisual.container.position.set(pointData.position.x, pointData.position.y);
      } else {
        // --- Логика создания ---
        // Точки еще нет, создаем ее.
        const newVisual = createPointVisual(pointData, {
          ...options,
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

    // 3. Перерисовка всех соединений
    // Проще и надежнее перерисовывать линии каждый раз, чем пытаться их "сверять".
    connectionsContainer.removeChildren();
    const lineGraphics = new PIXI.Graphics();
    connectionsContainer.addChild(lineGraphics);

    for (const pointData of points) {
      const startPointVisual = renderedPoints.get(pointData.id);
      if (!startPointVisual) continue; // Пропускаем, если начальная точка не найдена

      for (const connection of pointData.connections) {
        const endPointVisual = renderedPoints.get(connection.pointId);

        // Проверка целостности данных
        if (!endPointVisual) {
          console.warn(`Не найдена точка с id=${connection.pointId} для создания соединения.`);
          continue;
        }

        lineGraphics
          .moveTo(startPointVisual.container.x, startPointVisual.container.y)
          .lineTo(endPointVisual.container.x, endPointVisual.container.y)
          .stroke({
            width: connection.width ?? DEFAULT_CONNECTION_WIDTH,
            color: connection.color ?? DEFAULT_CONNECTION_COLOR,
          });
      }
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
