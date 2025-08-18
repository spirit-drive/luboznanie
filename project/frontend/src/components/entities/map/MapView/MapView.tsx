import React from 'react';
import clsx from 'clsx';
import s from './MapView.module.scss';
import { MapViewProps } from './MapView.types';
import { useMapView } from './hooks/useMapView';
import image from './assets/img.png';

export const MapView = ({
  className,
  width,
  height,
  background = { image: image.src },
  points,
  onPointClick,
  backgroundItems,
  editableMode = 'points',
}: MapViewProps) => {
  const { containerRef } = useMapView({
    editableMode,
    onPointClick,
    points,
    backgroundItems,
    width,
    height,
    background,
  });
  return <div ref={containerRef} className={clsx(s.root, className)} />;
};
