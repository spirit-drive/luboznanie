import { MapViewOptions } from '@/components/entities/map/MapView/MapView.types';
import { MapBackgroundItem, MapVisibleBackgroundItem } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';

export const createOnChangeWorld = ({
  onChangeWorld,
  itemsMap,
  app,
}: Pick<MapViewOptions, 'onChangeWorld'> & { itemsMap: Map<string, MapBackgroundItem>; app: PIXI.Application }) => {
  return () => {
    const visibleBackgorundItems: Array<MapVisibleBackgroundItem> = [];
    const screenBounds = app.screen;

    itemsMap.entries().forEach(([_, item]) => {
      const { sprite } = item;
      const spriteBounds = sprite.getBounds();

      // Находим пересечение между границами спрайта и экрана
      const intersectionX = Math.max(
        0,
        Math.min(spriteBounds.right, screenBounds.right) - Math.max(spriteBounds.left, screenBounds.left),
      );
      const intersectionY = Math.max(
        0,
        Math.min(spriteBounds.bottom, screenBounds.bottom) - Math.max(spriteBounds.top, screenBounds.top),
      );

      const visibleSpace = intersectionX * intersectionY;

      // Если площадь пересечения больше 0, значит, спрайт виден
      if (visibleSpace > 0) {
        visibleBackgorundItems.push({ ...item, visibleSpace });
      }
    });

    onChangeWorld?.({ visibleBackgorundItems });
  };
};
