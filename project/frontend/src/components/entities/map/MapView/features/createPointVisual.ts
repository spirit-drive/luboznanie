import * as PIXI from "pixi.js";
import {Point} from "../../../../../../../packages/types/entities/point/point.types";
import {PointsManagerOptions, PointVisuals} from "../MapView.types";
import { gsap } from 'gsap';
import {createTextContainer} from "./createTextContainer";
import {Graphics} from "pixi.js";

const PRACTICE_SVG_CODE = `
  <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(-464 -10)">
        <g transform="translate(462.75 8.827)">
            <path d="M11.2,1.25a37.524,37.524,0,0,0-4.6.16A4.786,4.786,0,0,0,3.667,2.685,4.874,4.874,0,0,0,2.408,5.641a38.752,38.752,0,0,0-.158,4.646v4.706c0,1.392,0,2.493.089,3.323a3.121,3.121,0,0,0,.812,2.054,2.759,2.759,0,0,0,1.556.713,3.065,3.065,0,0,0,2.074-.738c.677-.479,1.5-1.205,2.533-2.121l.034-.03c.48-.425.805-.711,1.076-.909A1.437,1.437,0,0,1,10.981,17a1.362,1.362,0,0,1,.538,0,1.437,1.437,0,0,1,.557.288c.271.2.6.485,1.076.909l.034.03c1.036.916,1.856,1.642,2.533,2.121a3.065,3.065,0,0,0,2.074.738,2.76,2.76,0,0,0,1.556-.713,3.122,3.122,0,0,0,.812-2.054c.089-.829.089-1.931.089-3.323V10.288a38.757,38.757,0,0,0-.158-4.646,4.874,4.874,0,0,0-1.259-2.956A4.786,4.786,0,0,0,15.9,1.41a37.524,37.524,0,0,0-4.6-.16ZM4.651,3.659a3.434,3.434,0,0,1,2.134-.877,37.034,37.034,0,0,1,4.465-.147,37.034,37.034,0,0,1,4.465.147,3.434,3.434,0,0,1,2.134.877,3.523,3.523,0,0,1,.87,2.165,38.272,38.272,0,0,1,.146,4.516v4.609c0,1.446,0,2.473-.081,3.22-.082.766-.233,1.053-.374,1.183a1.374,1.374,0,0,1-.775.356c-.184.021-.493-.05-1.116-.492-.608-.431-1.373-1.106-2.449-2.058l-.024-.021c-.45-.4-.823-.728-1.152-.969a2.782,2.782,0,0,0-1.1-.528,2.749,2.749,0,0,0-1.085,0,2.782,2.782,0,0,0-1.1.528c-.329.241-.7.571-1.152.969l-.024.021c-1.077.952-1.842,1.628-2.449,2.058-.623.442-.932.513-1.116.492a1.374,1.374,0,0,1-.775-.356c-.141-.13-.292-.417-.374-1.183-.08-.747-.081-1.774-.081-3.22V10.34a38.262,38.262,0,0,1,.146-4.516A3.523,3.523,0,0,1,4.651,3.659Z" transform="translate(1 1)" fill="#5f6369" fill-rule="evenodd"/>
            <path d="M11.2,1.25a37.524,37.524,0,0,0-4.6.16A4.786,4.786,0,0,0,3.667,2.685,4.874,4.874,0,0,0,2.408,5.641a38.752,38.752,0,0,0-.158,4.646v4.706c0,1.392,0,2.493.089,3.323a3.121,3.121,0,0,0,.812,2.054,2.759,2.759,0,0,0,1.556.713,3.065,3.065,0,0,0,2.074-.738c.677-.479,1.5-1.205,2.533-2.121l.034-.03c.48-.425.805-.711,1.076-.909A1.437,1.437,0,0,1,10.981,17a1.362,1.362,0,0,1,.538,0,1.437,1.437,0,0,1,.557.288c.271.2.6.485,1.076.909l.034.03c1.036.916,1.856,1.642,2.533,2.121a3.065,3.065,0,0,0,2.074.738,2.76,2.76,0,0,0,1.556-.713,3.122,3.122,0,0,0,.812-2.054c.089-.829.089-1.931.089-3.323V10.288a38.757,38.757,0,0,0-.158-4.646,4.874,4.874,0,0,0-1.259-2.956A4.786,4.786,0,0,0,15.9,1.41a37.524,37.524,0,0,0-4.6-.16Z" transform="translate(1 1)" fill="#cc1c14" stroke="#fff" stroke-width="1" fill-rule="evenodd"/>
        </g>
    </g>
  </svg>
`;

const SVG_ICON_SIZE = 60;


const INNER_CIRCLE_RADIUS = 50; // Диаметр 100px
const PROGRESS_BAR_RADIUS = 68; // Диаметр 136px
const PROGRESS_BAR_THICKNESS = 8;

const TEXT_BLOCK_OFFSET_X = INNER_CIRCLE_RADIUS + PROGRESS_BAR_THICKNESS / 2 + 34; // Расстояние от центра круга до начала текстового блока

const POINT_HOVER_SCALE = 1.2; // Масштаб при наведении

/**
 * Создает визуальное представление для одной точки.
 * В будущем сюда можно будет легко добавить текст, иконки, прогресс-бары.
 * @param point - Данные точки.
 * @param options - Опции, включая коллбэк клика.
 * @returns {PointVisuals} - Объект с контейнером и графикой точки.
 */
export const createPointVisual = (point: Point, options: PointsManagerOptions): PointVisuals => {
  // Главный контейнер для точки. Все элементы (круг, текст, иконки) будут в нем.
  const pointContainer = new PIXI.Container();
  // point.position указывает на центр круга, поэтому контейнер располагаем по этим координатам
  pointContainer.position.set(point.position.x, point.position.y);
  pointContainer.interactive = true;
  pointContainer.cursor = 'pointer';

  // Цвет точки по умолчанию или из данных
  const pointColor = point.color || '#eff';

  // Графика для внутреннего круга и прогресс-бара
  const graphics = new PIXI.Graphics();

  // Внутренний круг
  graphics.circle(0, 0, INNER_CIRCLE_RADIUS);
  graphics.fill(pointColor);

  pointContainer.addChild(graphics);

  const icon = new Graphics().svg(PRACTICE_SVG_CODE);
  icon.width = SVG_ICON_SIZE;
  icon.height = SVG_ICON_SIZE;

  // Располагаем иконку по центру. Так как pointContainer центрирован по point.position,
  // то для размещения по центру круга достаточно сместить иконку на -ширина/2 и -высота/2.
  icon.position.x = -icon.width / 2 - 4.5;
  icon.position.y = -icon.height / 2 - 2;
  pointContainer.addChild(icon);

  // Прогресс-бар (обводка)
  if (point.progress !== undefined && point.progress >= 0 && point.progress <= 100) {
    const startAngle = -Math.PI / 2; // Начало сверху
    const endAngle = startAngle + (2 * Math.PI * point.progress) / 100; // По часовой стрелке

    const progressGraphics = new PIXI.Graphics();
    progressGraphics.setStrokeStyle({ width: PROGRESS_BAR_THICKNESS, color: pointColor, cap: 'round' });
    progressGraphics.arc(0, 0, PROGRESS_BAR_RADIUS, startAngle, endAngle);
    progressGraphics.stroke();
    pointContainer.addChild(progressGraphics);
  }

  // --- Текстовый блок ---
  const { textContainer } = createTextContainer(point);

  textContainer.position.x = TEXT_BLOCK_OFFSET_X;
  textContainer.position.y = -textContainer.height / 2;
  pointContainer.addChild(textContainer);


  // --- Интерактивность ---
  pointContainer.on('pointertap', () => {
    options.onPointClick?.(point);
  });

  pointContainer.on('pointerover', () => {
    pointContainer.parent.addChild(pointContainer);
    gsap.to(pointContainer.scale, { x: POINT_HOVER_SCALE, y: POINT_HOVER_SCALE, duration: 0.2, ease: "power2.out" });
  });

  pointContainer.on('pointerout', () => {
    gsap.to(pointContainer.scale, { x: 1.0, y: 1.0, duration: 0.2, ease: "power2.out" });
  });

  return { container: pointContainer, graphics };
};