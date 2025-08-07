// src/components/entities/map/MapView/helpers/setupBackgroundItems.ts

import * as PIXI from 'pixi.js';
import { BackgroundItem, LoadedAsset, MapBackgroundItem } from '@/types/entities/map/map.types';

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
  const itemsMap = new Map<string, MapBackgroundItem>();

  backgroundItems.forEach((item) => {
    // Получаем загруженный ассет по алиасу (item.type.split('/')[0])
    // Предполагается, что алиас - это часть строки до '/'
    const [alias, index] = item.type.split('/');
    const asset = backgroundAssets[alias];

    try {
      if (Number.isNaN(parseInt(index))) {
        throw `Некорректный индекс изображения в спрайте ${item.type} в пункте с id ${item.id}`;
      }
      if (!(asset instanceof PIXI.Texture)) throw `Asset for item with id ${item.id} is not a valid Texture.`;

      const size = asset.frame.height;
      // Определяем область обрезки для нужной иконки
      const frame = new PIXI.Rectangle(size * parseInt(index), 0, size, size);

      // Создаем новую текстуру с обрезанной областью
      const croppedTexture = new PIXI.Texture({ source: asset.source, frame });

      const sprite = new PIXI.Sprite(croppedTexture);
      sprite.x = item.x;
      sprite.y = item.y;
      sprite.height = sprite.height / 2;
      sprite.width = sprite.width / 2;
      sprite.label = item.id; // Устанавливаем id элемента как имя спрайта для удобного поиска
      sprite.visible = !item.hidden; // Устанавливаем видимость
      container.addChild(sprite);
      itemsMap.set(item.id, { sprite, backgroundItem: item });
    } catch (e) {
      console.warn(e);
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
