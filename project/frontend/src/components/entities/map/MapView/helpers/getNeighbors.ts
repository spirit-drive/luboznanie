export type Elem = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const getNeighbors = <T, R extends Elem>(all: T[], selected: T[], getData: (item: T) => R): T[] => {
  all.forEach((_item) => {
    selected.forEach((_s) => {
      const item = getData(_item);
      const s = getData(_s);
      const iMinX = item.x;
      const iMaxX = item.x + item.width;
      const iMinY = item.y;
      const iMaxY = item.y + item.height;
      const sMinX = s.x;
      const sMaxX = s.x + s.width;
      const sMinY = s.y;
      const sMaxY = s.y + s.height;

      if (iMaxX < sMinX && iMinX < sMinX) return;
      if (iMinX > sMaxX && iMaxX > sMaxX) return;
      if (iMaxY < sMinY && iMinY < sMinY) return;
      if (iMinY > sMaxY && iMaxY > sMaxY) return;
      selected.push(_item);
    });
  });

  return selected;
};
