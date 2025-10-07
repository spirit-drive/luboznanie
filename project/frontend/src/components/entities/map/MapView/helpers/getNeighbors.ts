export type Elem = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const getNeighbors = <T, R extends Elem>(
  all: T[],
  target: T,
  getData: (item: T) => R,
  map = new Map<T, R>(),
  founds = new Set<T>(),
): T[] => {
  founds.add(target);

  if (!map.has(target)) map.set(target, getData(target));
  const s = map.get(target)!;

  const newNeighbors = new Set<T>();

  all
    .filter((i) => !founds.has(i))
    .forEach((_item) => {
      if (!map.has(_item)) map.set(_item, getData(_item));
      const item = map.get(_item)!;

      const iMinX = item.x,
        iMaxX = item.x + item.width,
        iMinY = item.y,
        iMaxY = item.y + item.height;
      const sMinX = s.x,
        sMaxX = s.x + s.width,
        sMinY = s.y,
        sMaxY = s.y + s.height;

      if (!(iMaxX < sMinX || iMinX > sMaxX || iMaxY < sMinY || iMinY > sMaxY)) {
        newNeighbors.add(_item);
        founds.add(_item);
      }
    });

  Array.from(newNeighbors).forEach((item) => getNeighbors(all, item, getData, map, founds));

  return Array.from(founds);
};
