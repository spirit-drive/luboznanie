import * as PIXI from 'pixi.js';

interface BackgroundOptions {
  image: string;
  width: number;
  height: number;
}

/**
 * Асинхронно загружает текстуру и создает тайловый спрайт для фона.
 * @param world - Контейнер PIXI, в который будет добавлен фон.
 * @param options - Опции для фона (URL изображения, ширина, высота).
 */
export const setupBackground = async (world: PIXI.Container, options: BackgroundOptions): Promise<void> => {
  if (!options.image) return;

  try {
    const texture = await PIXI.Assets.load(options.image);
    const tilingSprite = new PIXI.TilingSprite({
      texture,
      width: options.width,
      height: options.height,
    });

    // Добавляем фон внутрь 'world', чтобы он двигался и масштабировался вместе с картой.
    //addChildAt(..., 0) помещает спрайт на самый задний план.
    world.addChildAt(tilingSprite, 0);
  } catch (error) {
    console.error('Не удалось загрузить текстуру фона:', error);
  }
};
