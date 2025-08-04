import { BackgroundItem, LoadedAsset } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import mapSet1 from '@/components/entities/map/MapView/assets/background/map-set-1.webp';
import { ProgressCallback } from 'pixi.js/lib/assets/Assets';

const map = {
  'map-set-1': mapSet1,
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
