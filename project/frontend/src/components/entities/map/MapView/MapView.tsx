import React, { useEffect, useImperativeHandle } from 'react';
import clsx from 'clsx';
import s from './MapView.module.scss';
import { MapViewProps } from './MapView.types';
import { useMapView } from './hooks/useMapView';
import image from './assets/img.png';

const HIDE_ADDING_KEYS = [
  'ShiftLeft',
  'ShiftRight',
  'AltLeft',
  'AltRight',
  'ControlLeft',
  'ControlRight',
  'MetaRight',
  'MetaLeft',
  'Space',
];

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
  shouldUnselectByRect,
  shouldConnectPoints,
  onBGItemClick,
  onChangeBGItems,
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
    shouldUnselectByRect,
    shouldConnectPoints,
    onBGItemClick,
    onChangeBGItems,
  });

  useImperativeHandle(ref, () => mapViewController);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (HIDE_ADDING_KEYS.some((i) => e.code === i)) {
        mapViewController.setVisibleOfAddingElement(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (HIDE_ADDING_KEYS.some((i) => e.code === i)) {
        mapViewController.setVisibleOfAddingElement(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <div ref={containerRef} className={clsx(s.root, className)} />;
};
