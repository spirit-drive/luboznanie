export const BACKGROUND_MUSIC_PLAYLIST = [
  '/sounds/epic-1.mp3',
  '/sounds/warn-1.mp3',
  '/sounds/diving-1.mp3',
  '/sounds/diving-2.mp3',
  '/sounds/epic-2.webm',
  '/sounds/epic-3.webm',
  '/sounds/flute-1.webm',
  '/sounds/flute-2.webm',
  '/sounds/flute-3.mp3',
  '/sounds/flute-4.webm',
  '/sounds/flute-5.webm',
  '/sounds/flute-6.webm',
  '/sounds/flute-7.webm',
  '/sounds/flute-8.webm',
  '/sounds/flute-9.mp3',
  '/sounds/flute-10.mp3',
  '/sounds/flute-11.mp3',
  '/sounds/warn-2.webm',
  '/sounds/warn-3.webm',
];

export const getRandomPlaylistIndex = () => {
  return Math.round(Math.random() * (BACKGROUND_MUSIC_PLAYLIST.length - 1));
};
