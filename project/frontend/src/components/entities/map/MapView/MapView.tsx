import React, { useImperativeHandle } from 'react';
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
  onChangePoints,
  onSelectPoints,
  ref,
  addingElement,
  onAddedElement,
}: MapViewProps) => {
  const { containerRef, ...mapViewController } = useMapView({
    addingElement,
    onAddedElement,
    editableMode,
    onPointClick,
    points,
    backgroundItems,
    width,
    height,
    background,
    onChangePoints,
    onSelectPoints,
  });

  useImperativeHandle(ref, () => mapViewController);

  return <div ref={containerRef} className={clsx(s.root, className)} />;
};
