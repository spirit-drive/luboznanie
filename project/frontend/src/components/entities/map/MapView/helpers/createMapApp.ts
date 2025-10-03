import { MapViewOptions, MapApp, MapEditableMode } from '@/components/entities/map/MapView/MapView.types';
import { setupPixiApp } from '@/components/entities/map/MapView/helpers/setupPixiApp';
import { setupViewComponents } from '@/components/entities/map/MapView/helpers/setupViewComponents';
import { AddingPoint } from '@/types/entities/point/point.types';

export const createMapApp = async ({ container, appRef, ...options }: MapViewOptions): Promise<MapApp> => {
  // 1. Инициализация PIXI App и мира
  const { app, world } = await setupPixiApp(container, appRef);

  // 2. Настройка всех компонентов и получение менеджеров
  const { pointsAndBackgroundsManager, mapController, setEditableMode } = await setupViewComponents({
    app,
    world,
    options,
  });

  // 3. Настройка обработки событий окна
  const onBlur = () => app.ticker.stop();
  const onFocus = () => app.ticker.start();
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);

  // 4. Возвращаем публичный API
  return {
    setVisibleOfAddingElement: (v) => pointsAndBackgroundsManager.setVisibleOfAddingElement(v),
    setAddingElement: (addingElement) => {
      if (!addingElement) {
        pointsAndBackgroundsManager.setAddingElement(null);
      } else if (addingElement.type === 'point') {
        pointsAndBackgroundsManager.setAddingElement(addingElement.value as AddingPoint);
      }
    },
    selectAllPoints: () => {
      pointsAndBackgroundsManager.selectAllPoints();
    },
    selectPoints: (ids) => pointsAndBackgroundsManager.selectPoints(ids),
    setEditableMode: (mode: MapEditableMode) => {
      mapController.setEditableMode(mode);
      pointsAndBackgroundsManager.setEditableMode(mode);
      setEditableMode(mode);
    },
    updatePoints: (points) => {
      pointsAndBackgroundsManager.updatePoints(points);
    },
    updateBGITems: (bgItems) => {
      pointsAndBackgroundsManager.updateBGITems(bgItems);
    },
    cleanup: () => {
      pointsAndBackgroundsManager.destroy();
      mapController.destroy();
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);

      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
      if (container.contains(app.canvas)) {
        container.removeChild(app.canvas);
      }
    },
  };
};
