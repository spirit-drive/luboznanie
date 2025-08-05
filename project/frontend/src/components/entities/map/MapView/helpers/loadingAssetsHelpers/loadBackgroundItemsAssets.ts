import { BackgroundItem, LoadedAsset } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import { ProgressCallback } from 'pixi.js/lib/assets/Assets';

import mapSet1 from '@/components/entities/map/MapView/assets/background/map-set-1.webp';
import mapSet2 from '@/components/entities/map/MapView/assets/background/map-set-2.webp';
import mapSet3 from '@/components/entities/map/MapView/assets/background/map-set-3.webp';
import mapSetCastles2 from '@/components/entities/map/MapView/assets/background/map-set-castles-2.webp';
import mapSetCristals1 from '@/components/entities/map/MapView/assets/background/map-set-cristals-1.webp';
import mapSetLakes2 from '@/components/entities/map/MapView/assets/background/map-set-lakes-2.webp';
import mapSetLakes3 from '@/components/entities/map/MapView/assets/background/map-set-lakes-3.webp';
import mapSetLandscape1 from '@/components/entities/map/MapView/assets/background/map-set-landscape-1.webp';
import mapSetLandscape2 from '@/components/entities/map/MapView/assets/background/map-set-landscape-2.webp';
import mapSetLandscape3 from '@/components/entities/map/MapView/assets/background/map-set-landscape-3.webp';
import mapSetLandscape4 from '@/components/entities/map/MapView/assets/background/map-set-landscape-4.webp';
import mapSetLandscape5 from '@/components/entities/map/MapView/assets/background/map-set-landscape-5.webp';
import mapSetLandscape6 from '@/components/entities/map/MapView/assets/background/map-set-landscape-6.webp';
import mapSetLandscape7 from '@/components/entities/map/MapView/assets/background/map-set-landscape-7.webp';
import mapSetLandscape8 from '@/components/entities/map/MapView/assets/background/map-set-landscape-8.webp';
import mapSetLandscape9 from '@/components/entities/map/MapView/assets/background/map-set-landscape-9.webp';
import mapSetLandscape10 from '@/components/entities/map/MapView/assets/background/map-set-landscape-10.webp';
import mapSetMountains1 from '@/components/entities/map/MapView/assets/background/map-set-mountains-1.webp';
import castles3 from '@/components/entities/map/MapView/assets/background/castles-3.webp';
import castles4 from '@/components/entities/map/MapView/assets/background/castles-4.webp';
import castles5 from '@/components/entities/map/MapView/assets/background/castles-5.webp';
import forest from '@/components/entities/map/MapView/assets/background/forest.webp';
import mountains3 from '@/components/entities/map/MapView/assets/background/mountains-3.webp';
import mountains4 from '@/components/entities/map/MapView/assets/background/mountains-4.webp';
import mountainsCircle from '@/components/entities/map/MapView/assets/background/mountains-circle.webp';
import mountainsCircle2 from '@/components/entities/map/MapView/assets/background/mountains-circle-2.webp';
import trees from '@/components/entities/map/MapView/assets/background/trees.webp';

const map = {
  'map-set-1': mapSet1,
  'map-set-2': mapSet2,
  'map-set-3': mapSet3,
  'map-set-castles-2': mapSetCastles2,
  'map-set-cristals-1': mapSetCristals1,
  'map-set-lakes-2': mapSetLakes2,
  'map-set-lakes-3': mapSetLakes3,
  'map-set-landscape-1': mapSetLandscape1,
  'map-set-landscape-2': mapSetLandscape2,
  'map-set-landscape-3': mapSetLandscape3,
  'map-set-landscape-4': mapSetLandscape4,
  'map-set-landscape-5': mapSetLandscape5,
  'map-set-landscape-6': mapSetLandscape6,
  'map-set-landscape-7': mapSetLandscape7,
  'map-set-landscape-8': mapSetLandscape8,
  'map-set-landscape-9': mapSetLandscape9,
  'map-set-landscape-10': mapSetLandscape10,
  'map-set-mountains-1': mapSetMountains1,
  'castles-3': castles3,
  'castles-4': castles4,
  'castles-5': castles5,
  forest,
  'mountains-3': mountains3,
  'mountains-4': mountains4,
  'mountains-circle': mountainsCircle,
  'mountains-circle-2': mountainsCircle2,
  trees,
};

export const loadBackgroundItemsAssets = async (
  items?: BackgroundItem[],
  onBackgroundLoadProgress?: ProgressCallback,
) => {
  if (!items?.length) return {} as Record<string, LoadedAsset>;
  const set = new Set(items.map((i) => i.type.split('/')[0]));

  // 1. Сформируйте массив ресурсов
  const resources = Array.from(set, (i) => ({ src: map[i], alias: i })).filter((i) => Boolean(i.src));

  // 2. Добавьте их в менеджер активов
  await PIXI.Assets.add(resources);

  // 3. Загрузите ресурсы по их алиасам
  const assets = await PIXI.Assets.load(Array.from(set), onBackgroundLoadProgress);

  return assets as Record<string, LoadedAsset>;
};
