import * as PIXI from 'pixi.js';
import { loadingAssets } from '@/components/entities/map/MapView/helpers/loadingAssets';
import { setupBackground } from '@/components/entities/map/MapView/helpers/background';
import { createMapController } from '@/components/entities/map/MapView/helpers/mapController';
import { setupBackgroundItems } from '@/components/entities/map/MapView/helpers/setupBackgroundItems';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/pointsManager';
import { RefObject } from 'react';
import { UseMapViewOptions } from '@/components/entities/map/MapView/MapView.types';
import { MapBackgroundItem, MapVisibleBackgroundItem } from '@/types/entities/map/map.types';
import { createFog } from '@/components/entities/map/MapView/helpers/createFog';

export const createMapView = async ({
  container,
  appRef,
  width,
  height,
  backgroundItems,
  background,
  onPointClick,
  points,
  pointsManagerRef,
  onChangeWorld,
}: {
  container: HTMLDivElement;
  appRef: RefObject<PIXI.Application>;
  pointsManagerRef: RefObject<ReturnType<typeof createPointsManager> | null>;
  onChangeWorld?: (params: { visibleBackgorundItems: MapVisibleBackgroundItem[] }) => void;
} & UseMapViewOptions) => {
  // 1. Инициализация PIXI.Application
  const app = new PIXI.Application();
  await app.init({
    resizeTo: container,
    autoDensity: true,
    backgroundColor: '#ccc',
    resolution: window.devicePixelRatio || 1,
  });
  appRef.current = app;
  container.appendChild(app.canvas);

  // 2. Создание главного контейнера 'world'
  // Все игровые объекты (карта, точки, персонажи) будут внутри него.
  const world = new PIXI.Container();
  world.width = width;
  world.height = height;
  app.stage.addChild(world);

  const { pointTypeIcon, pointPropsIcon, backgroundAssets } = await loadingAssets({ backgroundItems });

  // Начальное центрирование мира на экране
  world.x = app.screen.width / 2 - width / 2;
  world.y = app.screen.height / 2 - height / 2;

  // 3. Делегирование создания фона
  await setupBackground(world, { image: background!.image!, width, height });

  const backgroundContainer = new PIXI.Container();

  let itemsMap: Map<string, MapBackgroundItem>;
  if (backgroundItems) {
    itemsMap = setupBackgroundItems(backgroundContainer, backgroundItems, backgroundAssets).itemsMap;
  }

  // 4. Делегирование создания контроллеров управления
  const mapController = createMapController(app, world, {
    onChangeWorld: () => {
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
    },
  });

  world.addChild(backgroundContainer);

  const { updateFogMask } = createFog(world, { width, height });

  // Создаем и сохраняем экземпляр менеджера точек
  pointsManagerRef.current = createPointsManager(world, { onPointClick, pointTypeIcon, pointPropsIcon });
  pointsManagerRef.current!.update(points);

  updateFogMask(points);

  const onBlur = () => {
    app.ticker.stop();
  };

  const onFocus = () => {
    app.ticker.start();
  };

  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);

  return () => {
    // Очищаем все менеджеры
    pointsManagerRef.current?.destroy();
    mapController.destroy();

    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);

    if (appRef.current) {
      appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
      appRef.current = null;
    }
    // Убедимся, что canvas удален из DOM
    if (container.contains(app.canvas)) {
      container.removeChild(app.canvas);
    }
  };
};
