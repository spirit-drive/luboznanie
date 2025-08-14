'use client';

import { RefObject, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { UseMapViewOptions } from '../MapView.types';
import { createPointsManager } from '../helpers/pointsManager';
import { createMapView } from '../helpers/createMapView';
import { useSounds } from '@/components/entities/map/MapView/helpers/useSounds';

export const useMapView = ({ background, width, height, points, onPointClick, backgroundItems }: UseMapViewOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const pointsManagerRef = useRef<ReturnType<typeof createPointsManager> | null>(null);

  const { playBackgroundMusic, updateBackgroundItemMusic, setVolume } = useSounds();

  // Основной useEffect для инициализации
  useEffect(() => {
    const init = async () => {
      const container = containerRef.current;
      if (!container || appRef.current) {
        return;
      }

      const cleanup = await createMapView({
        container,
        backgroundItems,
        height,
        points,
        onPointClick,
        background,
        width,
        appRef: appRef as RefObject<PIXI.Application>,
        pointsManagerRef,
        onChangeWorld: ({ visibleBackgorundItems }) => {
          updateBackgroundItemMusic(visibleBackgorundItems);
        },
      });

      return () => {
        cleanup?.();
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
  }, [background?.image, width, height, onPointClick, playBackgroundMusic, updateBackgroundItemMusic]);

  // --- useEffect для обновления точек ---
  useEffect(() => {
    if (pointsManagerRef.current && points) {
      pointsManagerRef.current?.update(points);
    }
  }, [points]);

  return { containerRef, setVolume };
};
