// src/components/entities/map/MapView/helpers/setupBackgroundItems.ts

import * as PIXI from 'pixi.js';
import { BackgroundItem, LoadedAsset } from '@/types/entities/map/map.types';

/**
 * Создает и добавляет спрайты фоновых элементов на карту.
 * @param container PIXI.Container, в который будут добавлены спрайты.
 * @param backgroundItems Массив данных о фоновых элементах.
 * @param backgroundAssets Загруженные ассеты фоновых элементов.
 */
export const setupBackgroundItems = (
  container: PIXI.Container,
  backgroundItems: BackgroundItem[],
  backgroundAssets: Record<string, LoadedAsset>,
) => {
  const itemsMap = new Map<string, PIXI.Sprite>();

  backgroundItems.forEach((item) => {
    // Получаем загруженный ассет по алиасу (item.type.split('/')[0])
    // Предполагается, что алиас - это часть строки до '/'
    const alias = item.type.split('/')[0];
    const asset = backgroundAssets[alias];

    if (asset instanceof PIXI.Texture) {
      const sprite = new PIXI.Sprite(asset);
      sprite.x = item.x;
      sprite.y = item.y;
      sprite.name = item.id; // Устанавливаем id элемента как имя спрайта для удобного поиска
      sprite.visible = !item.hidden; // Устанавливаем видимость
      container.addChild(sprite);
      itemsMap.set(item.id, sprite);
    } else {
      console.warn(`Asset for item with id ${item.id} is not a valid Texture.`);
    }
  });

  return {
    itemsMap, // Возвращаем Map для удобного доступа к спрайтам по id
    updateItem: (id: string, updates: Partial<PIXI.Sprite>) => {
      const sprite = itemsMap.get(id);
      if (sprite) {
        Object.assign(sprite, updates);
      }
    },
  };
};
