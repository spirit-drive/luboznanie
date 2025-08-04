import * as PIXI from 'pixi.js';
import pointSprite from '@/components/entities/map/MapView/assets/point/point.sprite.svg';
import pointPropsSprite from '@/components/entities/map/MapView/assets/point/point.props.sprite.svg';
import { LoadedAsset } from '@/types/entities/map/map.types';

export const loadingPointAssets = async () => {
  const pointTypeIcon = (await PIXI.Assets.load({
    src: pointSprite.src,
    data: {
      resolution: 4,
    },
  })) as LoadedAsset;

  const pointPropsIcon = (await PIXI.Assets.load({
    src: pointPropsSprite.src,
    data: {
      resolution: 4,
    },
  })) as LoadedAsset;

  return {
    pointTypeIcon,
    pointPropsIcon,
  };
};
