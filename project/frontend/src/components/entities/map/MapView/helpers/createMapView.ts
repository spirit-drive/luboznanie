import * as PIXI from 'pixi.js';
import { loadingAssets } from '@/components/entities/map/MapView/helpers/loadingAssets';
import { setupBackground } from '@/components/entities/map/MapView/helpers/background';
import { createMapController } from '@/components/entities/map/MapView/helpers/mapController';
import { setupBackgroundItems } from '@/components/entities/map/MapView/helpers/setupBackgroundItems';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/pointsManager';
import { RefObject } from 'react';
import { UseMapViewOptions } from '@/components/entities/map/MapView/MapView.types';

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
}: {
  container: HTMLDivElement;
  appRef: RefObject<PIXI.Application>;
  pointsManagerRef: RefObject<ReturnType<typeof createPointsManager> | null>;
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

  // 4. Делегирование создания контроллеров управления
  const mapController = createMapController(app, world);

  const backgroundContainer = new PIXI.Container();

  if (backgroundItems) {
    setupBackgroundItems(backgroundContainer, backgroundItems, backgroundAssets);
  }

  world.addChild(backgroundContainer);

  // Создаем и сохраняем экземпляр менеджера точек
  pointsManagerRef.current = createPointsManager(world, { onPointClick, pointTypeIcon, pointPropsIcon });
  pointsManagerRef.current.update(points);

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
