import { loadingPointAssets } from './loadingAssetsHelpers/loadingPointAssets';
import { ProgressCallback } from 'pixi.js/lib/assets/Assets';
import { BackgroundItem } from '@/types/entities/map/map.types';
import { loadBackgroundItemsAssets } from './loadingAssetsHelpers/loadBackgroundItemsAssets';
import { loadBackgroundFogsAssets } from '@/components/entities/map/MapView/helpers/loadingAssetsHelpers/loadBackgroundFogsAssets';

export type LoadingAssetsData = {
  backgroundItems?: BackgroundItem[];
};

export type LoadingAssetsOptions = {
  onBackgroundLoadProgress?: ProgressCallback;
  onPointLoadProgress?: ProgressCallback;
  onFogLoadProgress?: ProgressCallback;
};

export const loadingAssets = async (data: LoadingAssetsData, options?: LoadingAssetsOptions) => {
  const pointAssets = await loadingPointAssets();
  const backgroundAssets = await loadBackgroundItemsAssets(data.backgroundItems, options?.onBackgroundLoadProgress);
  const fogAssets = await loadBackgroundFogsAssets(options?.onFogLoadProgress);
  return {
    ...pointAssets,
    backgroundAssets,
    fogAssets,
  };
};
