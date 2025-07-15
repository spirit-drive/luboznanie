import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { MapViewProps } from '../MapView.types';
import { setupBackground } from '../features/background';
import { createMapController } from '../features/mapController';
import { createPointsManager } from '../features/pointsManager';

type UseMapViewOptions = Pick<MapViewProps, 'background' | 'width' | 'height' | 'items' | 'onPointClick'>;

export const useMapView = ({ background, width, height, items, onPointClick }: UseMapViewOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  // Реф для хранения экземпляра менеджера точек
  const pointsManagerRef = useRef<ReturnType<typeof createPointsManager> | null>(null);

  // Основной useEffect для инициализации
  useEffect(() => {
    const init = async () => {
      const container = containerRef.current;
      if (!container || appRef.current) {
        return;
      }

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

      // Начальное центрирование мира на экране
      world.x = app.screen.width / 2 - width / 2;
      world.y = app.screen.height / 2 - height / 2;

      // 3. Делегирование создания фона
      await setupBackground(world, { image: background?.image, width, height });

      // 4. Делегирование создания контроллеров управления
      const mapController = createMapController(app, world);

      // Создаем и сохраняем экземпляр менеджера точек
      pointsManagerRef.current = createPointsManager(world, { onPointClick });
      pointsManagerRef.current.update(items);

      const onBlur = () => {
        app.ticker.stop();
      };

      const onFocus = () => {
        app.ticker.start();
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
      }

      return () => {
        // Очищаем все менеджеры
        pointsManagerRef.current?.destroy();
        mapController.destroy();

        if (typeof window !== 'undefined') {
          window.removeEventListener('blur', onBlur);
          window.removeEventListener('focus', onFocus);
        }

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

    let cleanup: (() => void) | undefined;
    init().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
    // onPointClick добавлен в зависимости, чтобы менеджер пересоздался, если изменится коллбэк
  }, [background?.image, width, height, onPointClick]);

  // --- useEffect для обновления точек ---
  // Этот хук будет срабатывать ТОЛЬКО при изменении массива `items`.
  useEffect(() => {
    if (pointsManagerRef.current && items) {
      pointsManagerRef.current.update(items);
    }
  }, [items]); // Зависимость - массив `items`

  return { containerRef };
};
