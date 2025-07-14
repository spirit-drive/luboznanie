import * as PIXI from 'pixi.js';
import { Point, PointID, PointsManagerOptions, PointVisuals } from '../MapView.types';
import { createPointVisual } from "./createPointVisual";

// --- Типы для менеджера ---

const DEFAULT_CONNECTION_WIDTH = 3;
const DEFAULT_CONNECTION_COLOR = '#ccc';

/**
 * Создает менеджер для управления точками и соединениями на карте.
 * @param world - Главный PIXI-контейнер карты.
 * @param options - Конфигурация менеджера (например, обработчики событий).
 * @returns Объект с методами `update` и `destroy`.
 */
export const createPointsManager = (world: PIXI.Container, options: PointsManagerOptions) => {
  // Контейнеры для раздельной отрисовки линий и точек
  const connectionsContainer = new PIXI.Container();
  const pointsContainer = new PIXI.Container();
  world.addChild(connectionsContainer, pointsContainer); // Линии будут под точками

  // Словарь для хранения созданных визуальных представлений точек.
  // Ключ - point.id, значение - PIXI-объект. Это нужно для быстрого доступа и обновления.
  const renderedPoints = new Map<PointID, PointVisuals>();

  /**
   * Основная функция обновления. Сравнивает новые данные с отрисованными и применяет изменения.
   * @param items - Новый массив точек для отображения.
   */
  const update = (items: Point[]) => {
    const currentIds = new Set(renderedPoints.keys());
    const newIds = new Set(items.map(item => item.id));

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
    for (const pointData of items) {
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
        const newVisual = createPointVisual(pointData, options);
        renderedPoints.set(pointData.id, newVisual);
        pointsContainer.addChild(newVisual.container);
      }
    }

    // 3. Перерисовка всех соединений
    // Проще и надежнее перерисовывать линии каждый раз, чем пытаться их "сверять".
    connectionsContainer.removeChildren();
    const lineGraphics = new PIXI.Graphics();
    connectionsContainer.addChild(lineGraphics);

    for (const pointData of items) {
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
    connectionsContainer.destroy({children: true});
    pointsContainer.destroy({children: true});
    renderedPoints.clear();
  }

  return { update, destroy };
};