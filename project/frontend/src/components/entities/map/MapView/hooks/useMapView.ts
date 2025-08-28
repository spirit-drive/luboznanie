import { RefObject, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { MapApp, TMapView, UseMapViewOptions } from '../MapView.types';
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
  addingElement,
  onAddedElement,
  shouldUnselectByRect,
  shouldConnectPoints,
}: UseMapViewOptions): TMapView => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const mapController = useRef<MapApp | null>(null);

  const { playBackgroundMusic, updateBackgroundItemMusic, setVolume, onAddPoint } = useSounds();

  // Основной useEffect для инициализации
  useEffect(() => {
    const init = async () => {
      const container = containerRef.current;
      if (!container || appRef.current) {
        return;
      }

      mapController.current = await createMapApp({
        shouldUnselectByRect,
        shouldConnectPoints,
        container,
        backgroundItems,
        onAddedElement: (args) => {
          onAddedElement?.(args);
          onAddPoint();
        },
        height,
        points,
        onPointClick,
        background,
        width,
        addingElement,
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
    mapController.current?.setEditableMode(editableMode!);
  }, [editableMode]);

  useEffect(() => {
    mapController.current?.setAddingElement(addingElement!);
  }, [addingElement]);

  return {
    containerRef,
    setVolume,
    setVisibleOfAddingElement: (v) => mapController.current?.setVisibleOfAddingElement(v),
    selectAllPoints: () => {
      mapController.current?.selectAllPoints();
    },
    selectPoints: (ids) => {
      mapController.current?.selectPoints(ids);
    },
  };
};
