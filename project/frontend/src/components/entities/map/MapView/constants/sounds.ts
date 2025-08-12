export const BACKGROUND_MUSIC_PLAYLIST = [
  '/sounds/epic-1.mp3',
  '/sounds/warn-1.mp3',
  '/sounds/diving-1.mp3',
  '/sounds/diving-2.mp3',
];

export const getRandomPlaylistIndex = () => {
  return Math.round(Math.random() * (BACKGROUND_MUSIC_PLAYLIST.length - 1));
};
