import * as PIXI from 'pixi.js';
import { MapEditableMode, MapViewOptions, Point } from '@/components/entities/map/MapView/MapView.types';
import { loadingAssets } from '@/components/entities/map/MapView/helpers/loadingAssets';
import { setupBackground } from '@/components/entities/map/MapView/helpers/background';
import { createFogManager } from '@/components/entities/map/MapView/helpers/createFogManager';
import { createPointsAndBackgroundsManager } from '@/components/entities/map/MapView/helpers/createPointsAndBackgroundsManager';
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
    onAddedElement,
    shouldUnselectByRect,
    shouldConnectPoints,
  } = options;

  // Центрируем мир
  world.width = width;
  world.height = height;
  world.x = app.screen.width / 2 - width / 2;
  world.y = app.screen.height / 2 - height / 2;

  // 1. Загрузка ассетов
  const { pointTypeIcon, pointPropsIcon, backgroundAssets, fogAssets } = await loadingAssets({ backgroundItems });

  // 2. Настройка фона
  await setupBackground(world, { image: background!.image!, width, height });

  // 4. Создание тумана и прокси-функции для обновления точек
  const fogManager = createFogManager(world, { width, height, fogAssets });
  const onChangePointsWithFog = (newPoints: Point[]) => {
    fogManager.updateFogMask(newPoints);
    onChangePoints?.(newPoints);
  };

  // 5. Создание менеджера точек
  const pointsAndBackgroundsManager = createPointsAndBackgroundsManager(app, world, {
    onPointClick,
    pointTypeIcon,
    pointPropsIcon,
    onSelectPoints,
    onAddedElement,
    drawFog: fogManager.drawFog,
    onChangePoints: onChangePointsWithFog,
    shouldUnselectByRect,
    shouldConnectPoints,
    backgroundItems,
    backgroundAssets,
  });

  pointsAndBackgroundsManager.updatePoints(points);
  fogManager.updateFogMask(points);

  // 6. Создание контроллера карты
  const mapController = createMapController(app, world, {
    onChangeWorld: createOnChangeWorld({
      onChangeWorld,
      app,
      backgroundItemsMap: pointsAndBackgroundsManager.backgroundItemsMap,
    }),
    onSelectedSpace: pointsAndBackgroundsManager.selectPointsBySpace,
    shouldPreventScrolling: pointsAndBackgroundsManager.shouldMapPreventScrolling,
  });

  const setEditableMode = (mode: MapEditableMode) => {
    fogManager.setEditableMode(mode);
    pointsAndBackgroundsManager.setEditableMode(mode);
  };

  return { pointsAndBackgroundsManager, mapController, setEditableMode };
};
