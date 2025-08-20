import * as PIXI from 'pixi.js';
import { MapViewOptions, Point } from '@/components/entities/map/MapView/MapView.types';
import { loadingAssets } from '@/components/entities/map/MapView/helpers/loadingAssets';
import { setupBackground } from '@/components/entities/map/MapView/helpers/background';
import { MapBackgroundItem } from '@/types/entities/map/map.types';
import { setupBackgroundItems } from '@/components/entities/map/MapView/helpers/setupBackgroundItems';
import { createFog } from '@/components/entities/map/MapView/helpers/createFog';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/pointsManager';
import { createMapController } from '@/components/entities/map/MapView/helpers/mapController';
import { createOnChangeWorld } from '@/components/entities/map/MapView/helpers/createOnChangeWorld';

interface MapDependencies {
  app: PIXI.Application;
  world: PIXI.Container;
  options: MapViewOptions;
}

/**
 * Настраивает все визуальные компоненты и менеджеры.
 */
export const setupViewComponents = async ({ app, world, options }: MapDependencies) => {
  const {
    width,
    height,
    background,
    backgroundItems,
    points,
    onPointClick,
    onSelectPoints,
    onChangePoints,
    onChangeWorld,
  } = options;

  // Центрируем мир
  world.width = width;
  world.height = height;
  world.x = app.screen.width / 2 - width / 2;
  world.y = app.screen.height / 2 - height / 2;

  // 1. Загрузка ассетов
  const { pointTypeIcon, pointPropsIcon, backgroundAssets } = await loadingAssets({ backgroundItems });

  // 2. Настройка фона
  await setupBackground(world, { image: background!.image!, width, height });

  // 3. Настройка предметов фона
  const backgroundContainer = new PIXI.Container();
  let itemsMap: Map<string, MapBackgroundItem> | undefined;
  if (backgroundItems) {
    itemsMap = setupBackgroundItems(backgroundContainer, backgroundItems, backgroundAssets).itemsMap;
  }
  world.addChild(backgroundContainer);

  // 4. Создание тумана и прокси-функции для обновления точек
  const { updateFogMask } = createFog(world, { width, height });
  const onChangePointsWithFog = (newPoints: Point[]) => {
    updateFogMask(newPoints);
    onChangePoints?.(newPoints);
  };

  // 5. Создание менеджера точек
  const pointsManager = createPointsManager(app, world, {
    onPointClick,
    pointTypeIcon,
    pointPropsIcon,
    onSelectPoints,
    onChangePoints: onChangePointsWithFog,
  });
  pointsManager.updatePoints(points);
  updateFogMask(points);

  // 6. Создание контроллера карты
  const mapController = createMapController(app, world, {
    onChangeWorld: createOnChangeWorld({ onChangeWorld, app, itemsMap }),
    onSelectedSpace: pointsManager.selectPiintsBySpace,
  });

  return { pointsManager, mapController };
};
