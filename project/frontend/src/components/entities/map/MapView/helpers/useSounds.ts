'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { BACKGROUND_MUSIC_PLAYLIST, getRandomPlaylistIndex } from '../constants/sounds';
import { backgroundItemsMap } from '@/components/entities/map/MapView/constants/backgroundItemsMap';
import { MapVisibleBackgroundItem } from '@/types/entities/map/map.types';

export const useSounds = () => {
  const currentTrackIndexRef = useRef(getRandomPlaylistIndex());
  const backgroundMusicRef = useRef<Howl | null>(null);
  const backgroundItemMusicRef = useRef<Howl | null>(null);

  // useRef для таймаута, чтобы управлять им внутри хука
  const onChangeWorldTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Функция для воспроизведения следующей мелодии в плейлисте
  const playNextTrack = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current?.unload();
    }

    const nextTrack = BACKGROUND_MUSIC_PLAYLIST[currentTrackIndexRef.current];

    backgroundMusicRef.current = new Howl({
      src: [nextTrack],
      html5: true,
      autoplay: false,
      loop: false,
      volume: 0.1,
      onend: () => {
        currentTrackIndexRef.current = getRandomPlaylistIndex();
        playNextTrack();
      },
    });

    backgroundMusicRef.current?.play();
  }, []);

  const playBackgroundMusic = useCallback(() => {
    playNextTrack();
  }, [playNextTrack]);

  // Функция для воспроизведения музыки, связанной с элементами на карте
  const playBackgroundItemMusic = useCallback((src: string) => {
    const currentMusic = backgroundItemMusicRef.current;
    const currentSrc = (currentMusic as { _src?: string | string[] })?._src;

    if (currentSrc === src || (currentSrc && Array.isArray(currentSrc) && currentSrc.includes(src))) {
      return;
    }

    if (currentMusic) {
      const fadeDuration = 1000;
      currentMusic.fade(currentMusic.volume(), 0, fadeDuration);
      currentMusic.once('fade', () => {
        currentMusic.unload();
      });
    }

    backgroundItemMusicRef.current = new Howl({
      src: [src],
      html5: true,
      autoplay: true,
      loop: true,
      volume: 0.0,
    });

    backgroundItemMusicRef.current?.fade(0, 1, 1000);
  }, []);

  // Новая функция, которая принимает видимые элементы и решает, что играть
  const updateBackgroundItemMusic = useCallback(
    (visibleBackgroundItems: MapVisibleBackgroundItem[]) => {
      clearTimeout(onChangeWorldTimeoutRef.current);
      onChangeWorldTimeoutRef.current = setTimeout(() => {
        const counts: Record<string, number> = {};
        visibleBackgroundItems.forEach((item) => {
          const [alias] = item.backgroundItem.type.split('/');
          const sound = backgroundItemsMap[alias]?.audio;
          if (sound) {
            counts[sound] = (counts[sound] || 0) + item.visibleSpace;
          }
        });

        const max = Math.max(...Object.values(counts));
        const src = Object.entries(counts).find((i) => i[1] === max)?.[0];

        if (!src) return;

        playBackgroundItemMusic(src);
      }, 700);
    },
    [playBackgroundItemMusic],
  );

  // Метод для управления общей громкостью
  const setVolume = useCallback((volume: number) => {
    Howler.volume(volume);
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      playBackgroundMusic();
      document.removeEventListener('click', handleUserInteraction);
    };
    document.addEventListener('click', handleUserInteraction);

    return () => {
      backgroundMusicRef.current?.unload();
      backgroundItemMusicRef.current?.unload();
      clearTimeout(onChangeWorldTimeoutRef.current);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [playBackgroundMusic]);

  return { playBackgroundMusic, updateBackgroundItemMusic, setVolume };
};
