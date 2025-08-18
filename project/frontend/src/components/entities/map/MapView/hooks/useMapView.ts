import { RefObject, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { MapApp, UseMapViewOptions } from '../MapView.types';
import { createMapApp } from '../helpers/createMapApp';
import { useSounds } from '@/components/entities/map/MapView/helpers/useSounds';

export const useMapView = ({
  background,
  width,
  height,
  points,
  onPointClick,
  backgroundItems,
  editableMode,
  onSelectPoints,
  onChangePoints,
}: UseMapViewOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const mapController = useRef<MapApp | null>(null);

  const { playBackgroundMusic, updateBackgroundItemMusic, setVolume } = useSounds();

  // Основной useEffect для инициализации
  useEffect(() => {
    const init = async () => {
      const container = containerRef.current;
      if (!container || appRef.current) {
        return;
      }

      mapController.current = await createMapApp({
        container,
        backgroundItems,
        height,
        points,
        onPointClick,
        background,
        width,
        appRef: appRef as RefObject<PIXI.Application>,
        onChangeWorld: ({ visibleBackgorundItems }) => {
          updateBackgroundItemMusic(visibleBackgorundItems);
        },
        onSelectPoints,
        onChangePoints,
      });

      return () => {
        mapController.current?.cleanup?.();
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
  }, [
    background?.image,
    width,
    height,
    onPointClick,
    playBackgroundMusic,
    updateBackgroundItemMusic,
    onSelectPoints,
    onChangePoints,
  ]);

  // --- useEffect для обновления точек ---
  useEffect(() => {
    if (mapController.current && points) {
      mapController.current?.updatePoints(points);
    }
  }, [points]);

  useEffect(() => {
    console.log('editableMode', editableMode);
    mapController.current?.setEditableMode(editableMode!);
  }, [editableMode]);

  return { containerRef, setVolume };
};
