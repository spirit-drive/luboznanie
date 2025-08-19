import * as PIXI from 'pixi.js';
import { Point, PointID } from '@/types/entities/point/point.types';
import { PointVisuals } from '@/components/entities/map/MapView/MapView.types';

const DEFAULT_CONNECTION_WIDTH = 3;
const DEFAULT_CONNECTION_COLOR = '#ccc';

export const updateConnections =
  (connectionsContainer: PIXI.Container, renderedPoints: Map<PointID, PointVisuals>) => (points: Point[]) => {
    // 1. Очистка старых линий
    connectionsContainer.removeChildren();
    const lineGraphics = new PIXI.Graphics();
    connectionsContainer.addChild(lineGraphics);

    // 2. Построение новых линий
    for (const pointData of points) {
      const startPointVisual = renderedPoints.get(pointData.id);
      if (!startPointVisual) continue;

      for (const connection of pointData.connections) {
        const endPointVisual = renderedPoints.get(connection.pointId);

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
