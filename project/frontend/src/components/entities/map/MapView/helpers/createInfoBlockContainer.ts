import * as PIXI from 'pixi.js';
import { Point } from '@/types/entities/point/point.types';
import { PointsManagerOptions } from '@/components/entities/map/MapView/MapView.types';
import { LoadedSvg } from '@/types/entities/map/map.types';

const PROGRESS_TEXT_FONT_SIZE = 12;
const ICON_SIZE = 22;
const ICON_SPACING = 4; // Между иконками
const TEXT_COLOR = '#000000'; // Черный цвет для текста

enum IconPropsType {
  bookmark,
  required,
  success,
  locked,
}

export const createGenIcon = (raw: LoadedSvg) => (type: IconPropsType, x: number) => {
  const frame = new PIXI.Rectangle(raw.frame.height * type, 0, raw.frame.height, raw.frame.height);

  // Создаем новую текстуру с обрезанной областью
  const croppedTexture = new PIXI.Texture({ source: raw.source, frame });

  // Создаем спрайт с обрезанной текстурой
  const icon = new PIXI.Sprite(croppedTexture);

  icon.width = ICON_SIZE;
  icon.height = ICON_SIZE;
  icon.position.x = x;
  icon.position.y = 0;

  return icon;
};

export const createInfoBlockContainer = (point: Point, options: PointsManagerOptions) => {
  const infoBlockContainer = new PIXI.Container();
  let currentIconX = 0;
  const genIcon = createGenIcon(options.pointPropsIcon);

  // Красная закладка - bookmarked
  if (point.bookmarked) {
    // Создаем спрайт с обрезанной текстурой
    const icon = genIcon(IconPropsType.bookmark, currentIconX);

    infoBlockContainer.addChild(icon);
    currentIconX += ICON_SIZE + ICON_SPACING;
  }

  // Оранжевая корона - required
  if (point.required) {
    const icon = genIcon(IconPropsType.required, currentIconX);

    infoBlockContainer.addChild(icon);
    currentIconX += ICON_SIZE + ICON_SPACING;
  }

  // Зеленая галочка - success
  if (point.success) {
    const icon = genIcon(IconPropsType.success, currentIconX);

    infoBlockContainer.addChild(icon);
    currentIconX += ICON_SIZE + ICON_SPACING;
  }

  // Серый замок - locked
  if (point.locked) {
    const icon = genIcon(IconPropsType.locked, currentIconX);

    infoBlockContainer.addChild(icon);
    currentIconX += ICON_SIZE + ICON_SPACING;
  }

  // Текст прогресса (10% 100/1000)
  if (point.progress !== undefined && point.progress >= 0 && point.progress <= 100) {
    // Предполагаем, что максимальное значение для 100/1000 это 1000,
    // и текущее значение рассчитывается как progress * (max / 100)
    // Если у вас есть `totalValue` и `currentValue`, используйте их.
    const totalValue = 1000; // Пример, если нет в Point
    const currentValue = Math.round((point.progress / 100) * totalValue);

    const textStyle = new PIXI.TextStyle({
      fontFamily: 'Montserrat',
      fontSize: PROGRESS_TEXT_FONT_SIZE,
      fontWeight: 'normal', // Regular
      fill: TEXT_COLOR,
      align: 'left',
    });

    const progressText = new PIXI.Text({ style: textStyle, text: `${point.progress}% ${currentValue}/${totalValue}` });

    progressText.position.x = currentIconX; // Размещаем после иконок
    progressText.position.y = infoBlockContainer.height / 2 - progressText.height / 2;
    infoBlockContainer.addChild(progressText);
  }

  return { infoBlockContainer };
};
