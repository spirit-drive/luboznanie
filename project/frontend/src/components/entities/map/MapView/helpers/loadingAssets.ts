import { loadingPointAssets } from './loadingAssetsHelpers/loadingPointAssets';
import { ProgressCallback } from 'pixi.js/lib/assets/Assets';
import { BackgroundItem } from '@/types/entities/map/map.types';
import { loadBackgroundItemsAssets } from './loadingAssetsHelpers/loadBackgroundItemsAssets';

export type LoadingAssetsData = {
  backgroundItems?: BackgroundItem[];
};

export type LoadingAssetsOptions = {
  onBackgroundLoadProgress?: ProgressCallback;
  onPointLoadProgress?: ProgressCallback;
};

export const loadingAssets = async (data: LoadingAssetsData, options?: LoadingAssetsOptions) => {
  const pointAssets = await loadingPointAssets();
  const backgroundAssets = await loadBackgroundItemsAssets(data.backgroundItems, options?.onBackgroundLoadProgress);
  return {
    ...pointAssets,
    backgroundAssets,
  };
};
