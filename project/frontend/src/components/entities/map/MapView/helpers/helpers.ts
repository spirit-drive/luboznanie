import { Point, PointID } from '@/types/entities/point/point.types';
import { PointVisuals } from '@/components/entities/map/MapView/MapView.types';

export const getChildren = (point: Point, renderedPoints: Map<PointID, PointVisuals>) => {
  return getPointVisualsByIds(
    point.connections.map((i) => i.pointId),
    renderedPoints,
  );
};

export const getPointVisualsByIds = (ids: PointID[], renderedPoints: Map<PointID, PointVisuals>): PointVisuals[] => {
  return ids.map((i) => renderedPoints.get(i)).filter(Boolean) as PointVisuals[];
};
export const getAllChildrenIds = (points: Point[], renderedPoints: Map<PointID, PointVisuals>): PointID[] => {
  const childrenIds = new Set<PointID>();
  points.forEach((point) => {
    childrenIds.add(point.id);
    if (point.connections?.length) {
      const children = getChildren(point, renderedPoints).map((i) => i.point);
      getAllChildrenIds(children, renderedPoints).forEach((i) => childrenIds.add(i));
    }
  });
  return [...childrenIds.values()].filter(Boolean);
};
export const getAllChildren = (point: Point, renderedPoints: Map<PointID, PointVisuals>): PointVisuals[] => {
  const ids = getAllChildrenIds([point], renderedPoints);
  return getPointVisualsByIds(ids, renderedPoints);
};
