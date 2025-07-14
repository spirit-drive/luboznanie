import {EntityType, ID} from "../../shared";

export type PointID = ID;

export type Connection = {
  id: ID;
  pointId: PointID;
  width?: number;
  color?: string;
}

export type Point = {
  id: PointID;
  name: string;
  color?: string;
  required?: boolean;
  position: {
    x: number;
    y: number;
  };
  connections: Connection[];
  locked?: boolean;
  bookmarked?: boolean;
  success?: boolean;
  progress?: number;
  entity: {
    id: ID;
    type: EntityType
  }
}