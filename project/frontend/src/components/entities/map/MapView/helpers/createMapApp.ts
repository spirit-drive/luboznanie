import { MapViewOptions, MapApp, MapEditableMode } from '@/components/entities/map/MapView/MapView.types';
import { setupPixiApp } from '@/components/entities/map/MapView/helpers/setupPixiApp';
import { setupViewComponents } from '@/components/entities/map/MapView/helpers/setupViewComponents';

export const createMapApp = async ({ container, appRef, ...options }: MapViewOptions): Promise<MapApp> => {
  // 1. Инициализация PIXI App и мира
  const { app, world } = await setupPixiApp(container, appRef);

  // 2. Настройка всех компонентов и получение менеджеров
  const { pointsManager, mapController } = await setupViewComponents({ app, world, options });

  // 3. Настройка обработки событий окна
  const onBlur = () => app.ticker.stop();
  const onFocus = () => app.ticker.start();
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);

  // 4. Возвращаем публичный API
  return {
    setEditableMode: (mode: MapEditableMode) => {
      mapController.setEditableMode(mode);
      pointsManager.setEditableMode(mode);
    },
    updatePoints: (points) => {
      pointsManager.updatePoints(points);
    },
    cleanup: () => {
      pointsManager.destroy();
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
