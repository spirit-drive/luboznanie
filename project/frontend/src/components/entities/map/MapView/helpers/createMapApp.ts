import * as PIXI from 'pixi.js';
import { loadingAssets } from '@/components/entities/map/MapView/helpers/loadingAssets';
import { setupBackground } from '@/components/entities/map/MapView/helpers/background';
import { createMapController } from '@/components/entities/map/MapView/helpers/mapController';
import { setupBackgroundItems } from '@/components/entities/map/MapView/helpers/setupBackgroundItems';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/pointsManager';
import { MapViewOptions, MapApp, MapEditableMode } from '@/components/entities/map/MapView/MapView.types';
import { MapBackgroundItem } from '@/types/entities/map/map.types';
import { createFog } from '@/components/entities/map/MapView/helpers/createFog';
import { createOnChangeWorld } from '@/components/entities/map/MapView/helpers/createOnChangeWorld';

export const createMapApp = async ({
  container,
  appRef,
  width,
  height,
  backgroundItems,
  background,
  onPointClick,
  points,
  onChangeWorld,
  onSelectPoints,
  onChangePoints,
}: MapViewOptions): Promise<MapApp> => {
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

  world.addChild(backgroundContainer);

  const { updateFogMask } = createFog(world, { width, height });

  // Создаем и сохраняем экземпляр менеджера точек
  const pointsManager = createPointsManager(world, { onPointClick, pointTypeIcon, pointPropsIcon, onSelectPoints });
  pointsManager.updatePoints(points);

  updateFogMask(points);

  // 4. Делегирование создания контроллеров управления
  const mapController = createMapController(app, world, {
    onChangeWorld: createOnChangeWorld({ onChangeWorld, app, itemsMap }),
    onSelectedSpace: pointsManager.selectPiintsBySpace,
  });

  const onBlur = () => {
    app.ticker.stop();
  };

  const onFocus = () => {
    app.ticker.start();
  };

  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);

  return {
    setEditableMode: (mode: MapEditableMode) => {
      mapController.setEditableMode(mode);
      pointsManager.setEditableMode(mode);
    },
    updatePoints: (points) => {
      pointsManager.updatePoints(points);
    },
    cleanup: () => {
      // Очищаем все менеджеры
      pointsManager.destroy();
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
    },
  };
};
