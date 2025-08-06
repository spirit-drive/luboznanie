'use client';

import { RefObject, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { UseMapViewOptions } from '../MapView.types';
import { createPointsManager } from '@/components/entities/map/MapView/helpers/pointsManager';
import { createMapView } from '@/components/entities/map/MapView/hooks/createMapView';
import { createMapView } from '@/components/entities/map/MapView/helpers/createMapView';

export const useMapView = ({ background, width, height, points, onPointClick, backgroundItems }: UseMapViewOptions) => {
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

      return createMapView({
        container,
        backgroundItems,
        height,
        points,
        onPointClick,
        background,
        width,
        appRef: appRef as RefObject<PIXI.Application>,
        pointsManagerRef,
      });
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
  // Этот хук будет срабатывать ТОЛЬКО при изменении массива `points`.
  useEffect(() => {
    if (pointsManagerRef.current && points) {
      pointsManagerRef.current.update(points);
    }
  }, [points]); // Зависимость - массив `points`

  return { containerRef };
};
