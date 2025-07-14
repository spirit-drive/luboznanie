import {Point, PointID, Connection} from "../../../../../../packages/types/entities/point/point.types";
import {MapBackground} from "../../../../../../packages/types/entities/map/map.types";
import * as PIXI from "pixi.js";

export type MapViewProps = {
  className?: string;
  items: Point[];
  background?: MapBackground;
  width: number;
  height: number;
  onPointClick: (pointId: PointID) => void;
};

export type { Point, PointID, MapBackground, Connection }


export type PointVisuals  = {
  container: PIXI.Container;
  graphics: PIXI.Graphics;
}

export type PointsManagerOptions =  {
  onPointClick?: (point: Point) => void;
}