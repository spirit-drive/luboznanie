'use client';

import { RefObject, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { UseMapViewOptions } from '../MapView.types';
import { createPointsManager } from '../helpers/pointsManager';
import { createMapView } from '../helpers/createMapView';
import { Howl, Howler } from 'howler';
import { BACKGROUND_MUSIC_PLAYLIST } from '../constants/sounds';

export const useMapView = ({ background, width, height, points, onPointClick, backgroundItems }: UseMapViewOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const pointsManagerRef = useRef<ReturnType<typeof createPointsManager> | null>(null);
  const currentTrackIndexRef = useRef(0);
  const backgroundMusicRef = useRef<Howl | null>(null);

  // Функция для воспроизведения следующей мелодии в плейлисте
  const playNextTrack = () => {
    // Останавливаем предыдущий трек, если он существует
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current?.unload();
    }

    const nextTrack = BACKGROUND_MUSIC_PLAYLIST[currentTrackIndexRef.current];

    backgroundMusicRef.current = new Howl({
      src: [nextTrack],
      html5: true, // Рекомендуется для длинных файлов
      autoplay: false,
      loop: false,
      onend: () => {
        // Когда трек закончится, переключаемся на следующий
        currentTrackIndexRef.current = (currentTrackIndexRef.current + 1) % BACKGROUND_MUSIC_PLAYLIST.length;
        playNextTrack();
      },
    });

    backgroundMusicRef.current?.play();
  };

  // Метод для управления громкостью фоновой музыки
  const setVolume = (volume: number) => {
    Howler.volume(volume);
  };

  // Основной useEffect для инициализации
  useEffect(() => {
    const init = async () => {
      const container = containerRef.current;
      if (!container || appRef.current) {
        return;
      }

      // Запуск фоновой музыки по первому клику пользователя на документе
      const handleUserInteraction = () => {
        playNextTrack();
        document.removeEventListener('click', handleUserInteraction);
      };
      document.addEventListener('click', handleUserInteraction);

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
      });

      return () => {
        cleanup?.();
        document.removeEventListener('click', handleUserInteraction);
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();

      // Останавливаем музыку, если она играет
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current?.unload();
      }
    };
  }, [background?.image, width, height, onPointClick]);

  // --- useEffect для обновления точек ---
  // Этот хук будет срабатывать ТОЛЬКО при изменении массива `points`.
  useEffect(() => {
    if (pointsManagerRef.current && points) {
      pointsManagerRef.current?.update(points);
    }
  }, [points]); // Зависимость - массив `points`

  return { containerRef, setVolume };
};
