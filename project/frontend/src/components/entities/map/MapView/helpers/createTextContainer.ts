import { createInfoBlockContainer } from './createInfoBlockContainer';
import * as PIXI from 'pixi.js';
import { Point } from '@/types/entities/point/point.types';
import { PointsManagerOptions } from '@/components/entities/map/MapView/MapView.types';

const TITLE_FONT_SIZE = 16;
const TEXT_COLOR = '#000000'; // Черный цвет для текста
const ICON_BLOCK_TITLE_SPACING = 8; // Между иконками и заголовком

export const createTextContainer = (point: Point, options: PointsManagerOptions) => {
  const textContainer = new PIXI.Container();

  const { infoBlockContainer } = createInfoBlockContainer(point, options);
  textContainer.addChild(infoBlockContainer);

  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Montserrat', // Предполагаем, что Montserrat доступен
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 'bold',
    fill: TEXT_COLOR,
    align: 'left', // Выравнивание по левому краю внутри текстового блока
    wordWrap: true, // Включаем перенос слов
    wordWrapWidth: 200, // Устанавливаем максимальную ширину в 200px
  });

  const titleText = new PIXI.Text({ style: textStyle, text: point.name });

  titleText.position.y = infoBlockContainer.height ? infoBlockContainer.height + ICON_BLOCK_TITLE_SPACING : 0;
  textContainer.addChild(titleText);

  return { textContainer, infoBlockContainer };
};
