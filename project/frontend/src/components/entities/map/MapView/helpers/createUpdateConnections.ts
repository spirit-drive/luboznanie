import * as PIXI from 'pixi.js';
import { PointID } from '@/types/entities/point/point.types';
import { PointVisuals } from '@/components/entities/map/MapView/MapView.types';
import { ACTIVE_COLOR } from '@/components/entities/map/MapView/constants/style';

const DEFAULT_CONNECTION_WIDTH = 3;
const SELECTED_CONNECTION_WIDTH = 3;
const DEFAULT_CONNECTION_COLOR = '#ccc';

export const createUpdateConnections =
  (
    connectionsContainer: PIXI.Container,
    state: {
      renderedPoints: Map<PointID, PointVisuals>;
      selectedPoints: Map<PointID, PointVisuals>;
    },
  ) =>
  () => {
    const { renderedPoints, selectedPoints } = state;
    const points = Array.from(renderedPoints.values(), (i) => i.point);
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

        const isSelected = selectedPoints.has(startPointVisual.point.id);

        lineGraphics
          .moveTo(startPointVisual.container.x, startPointVisual.container.y)
          .lineTo(endPointVisual.container.x, endPointVisual.container.y)
          .stroke({
            width: isSelected ? SELECTED_CONNECTION_WIDTH : (connection.width ?? DEFAULT_CONNECTION_WIDTH),
            color: isSelected ? ACTIVE_COLOR : (connection.color ?? DEFAULT_CONNECTION_COLOR),
          });
      }
    }
  };
