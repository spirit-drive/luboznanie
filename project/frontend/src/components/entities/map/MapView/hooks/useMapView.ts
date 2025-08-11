'use client';

import { RefObject, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { UseMapViewOptions } from '../MapView.types';
import { createPointsManager } from '../helpers/pointsManager';
import { createMapView } from '../helpers/createMapView';
import { Howl, Howler } from 'howler';
import { BACKGROUND_MUSIC_PLAYLIST } from '../constants/sounds';
import { backgroundItemsMap } from '@/components/entities/map/MapView/constants/backgroundItemsMap';

export const useMapView = ({ background, width, height, points, onPointClick, backgroundItems }: UseMapViewOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const pointsManagerRef = useRef<ReturnType<typeof createPointsManager> | null>(null);
  const currentTrackIndexRef = useRef(0);
  const backgroundMusicRef = useRef<Howl | null>(null);
  const backgroundItemMusicRef = useRef<Howl | null>(null);

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
      volume: 0.0,
      onend: () => {
        // Когда трек закончится, переключаемся на следующий
        currentTrackIndexRef.current = (currentTrackIndexRef.current + 1) % BACKGROUND_MUSIC_PLAYLIST.length;
        playNextTrack();
      },
    });

    backgroundMusicRef.current?.play();
  };

  // Метод для управления громкостью всей музыки
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

      let onChangeWorldTimeout: NodeJS.Timeout | undefined;

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
          clearTimeout(onChangeWorldTimeout);
          onChangeWorldTimeout = setTimeout(() => {
            const counts: Record<string, number> = {};
            visibleBackgorundItems.forEach((item) => {
              const [alias] = item.backgroundItem.type.split('/');
              const sound = backgroundItemsMap[alias]?.audio;
              counts[sound] = counts[sound] ? counts[sound] + 1 : 1;
            });

            const max = Math.max(...Object.values(counts));

            const src = Object.entries(counts).find((i) => i[1] === max)?.[0];

            if (!src) return;

            const currentMusic = backgroundItemMusicRef.current;
            // Проверяем, изменился ли источник
            const currentSrc = (backgroundItemMusicRef.current as { _src: string | string[] })?._src;

            if (currentSrc === src || (currentSrc && Array.isArray(currentSrc) && currentSrc.includes(src))) return;

            // Если есть текущая музыка, плавно уменьшаем громкость и выгружаем её
            if (currentMusic) {
              const fadeDuration = 1000;
              currentMusic.fade(currentMusic.volume(), 0, fadeDuration);
              currentMusic.once('fade', () => {
                currentMusic.unload();
              });
            }

            backgroundItemMusicRef.current = new Howl({
              src: [src], // src должен быть массивом
              html5: true,
              autoplay: true,
              loop: true,
              volume: 0.0, // Начинаем с 0
            });

            backgroundItemMusicRef.current?.fade(0, 1, 1000);
          }, 700);
        },
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
      backgroundMusicRef.current?.unload();
      backgroundItemMusicRef.current?.unload();
    };
  }, [background?.image, width, height, onPointClick]);

  // --- useEffect для обновления точек ---
  useEffect(() => {
    if (pointsManagerRef.current && points) {
      pointsManagerRef.current?.update(points);
    }
  }, [points]);

  return { containerRef, setVolume };
};
