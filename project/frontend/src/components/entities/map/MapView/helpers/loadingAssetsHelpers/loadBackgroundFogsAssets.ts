import { LoadedAsset } from '@/types/entities/map/map.types';
import * as PIXI from 'pixi.js';
import { ProgressCallback } from 'pixi.js/lib/assets/Assets';
import fog1 from '@/components/entities/map/MapView/assets/fogs/fog1.jpeg';

export const loadBackgroundFogsAssets = async (onFogLoadProgress?: ProgressCallback) => {
  const image = { src: fog1, alias: 'fog1' };
  // 2. Добавьте их в менеджер активов
  await PIXI.Assets.add(image);

  // 3. Загрузите ресурсы по их алиасам
  const assets = await PIXI.Assets.load(image, onFogLoadProgress);

  return assets as LoadedAsset;
};
