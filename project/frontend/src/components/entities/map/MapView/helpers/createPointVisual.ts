import * as PIXI from 'pixi.js';
import { MapEditableMode, PointVisualOptions, PointVisuals } from '../MapView.types';
import { gsap } from 'gsap';
import { createTextContainer } from './createTextContainer';
import { Point } from '@/types/entities/point/point.types';
import { EntityType } from '@/types/shared';
import { ACTIVE_COLOR, SELECT_COLOR } from '@/components/entities/map/MapView/constants/style';

const SVG_ICON_SIZE = 60;

const INNER_CIRCLE_RADIUS = 50; // Диаметр 100px
const PROGRESS_BAR_RADIUS = 68; // Диаметр 136px
const PROGRESS_BAR_THICKNESS = 8;

const HOVER_CIRCLE_RADIUS = 54; // Радиус голубого круга при наведении
const HOVER_CIRCLE_WIDTH = 4;

const ACTIVE_CIRCLE_RADIUS = 60; // Радиус голубого круга при наведении
const ACTIVE_CIRCLE_WIDTH = 6;

const TEXT_BLOCK_OFFSET_X = INNER_CIRCLE_RADIUS + PROGRESS_BAR_THICKNESS / 2 + 34; // Расстояние от центра круга до начала текстового блока

const POINT_HOVER_SCALE = 1.2; // Масштаб при наведении

const iconShiftMap: Record<EntityType, number> = {
  practice: 0,
  article: 1,
  map: 2,
};

/**
 * Создает визуальное представление для одной точки.
 * В будущем сюда можно будет легко добавить текст, иконки, прогресс-бары.
 * @param point - Данные точки.
 * @param options - Опции, включая коллбэк клика.
 * @returns {PointVisuals} - Объект с контейнером и графикой точки.
 */
export const createPointVisual = (point: Point, options: PointVisualOptions): PointVisuals => {
  let editableMode: MapEditableMode = 'points';

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

  // Определяем область обрезки для нужной иконки
  const frame = new PIXI.Rectangle(
    options.pointTypeIcon.frame.height * iconShiftMap[point.entity.type],
    0,
    options.pointTypeIcon.frame.height,
    options.pointTypeIcon.frame.height,
  );

  // Создаем новую текстуру с обрезанной областью
  const croppedTexture = new PIXI.Texture({ source: options.pointTypeIcon.source, frame });

  // Создаем спрайт с обрезанной текстурой
  const icon = new PIXI.Sprite(croppedTexture);

  icon.width = SVG_ICON_SIZE;
  icon.height = SVG_ICON_SIZE;

  // Располагаем иконку по центру. Так как pointContainer центрирован по point.position,
  // то для размещения по центру круга достаточно сместить иконку на -ширина/2 и -высота/2.
  icon.position.x = -icon.width / 2;
  icon.position.y = -icon.height / 2;
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
  const { textContainer } = createTextContainer(point, options);

  textContainer.position.x = TEXT_BLOCK_OFFSET_X;
  textContainer.position.y = -textContainer.height / 2;
  pointContainer.addChild(textContainer);

  // --- Интерактивность ---
  pointContainer.on('pointertap', (event) => {
    pointContainer.parent.addChild(pointContainer);
    options.onPointClick?.(point, event);
  });
  // --- Интерактивность ---
  pointContainer.on('pointerdown', (event) => {
    pointContainer.parent.addChild(pointContainer);
    options.onPointDown?.(point, event);
  });

  // Голубой круг для выделения при наведении
  const hoverCircle = new PIXI.Graphics();
  hoverCircle.circle(0, 0, HOVER_CIRCLE_RADIUS);
  hoverCircle.stroke({ color: SELECT_COLOR, width: HOVER_CIRCLE_WIDTH });
  hoverCircle.visible = false; // Скрываем по умолчанию
  pointContainer.addChildAt(hoverCircle, 0); // Размещаем под остальными элементами

  const activeCircle = new PIXI.Graphics();
  activeCircle.circle(0, 0, ACTIVE_CIRCLE_RADIUS);
  activeCircle.stroke({ color: ACTIVE_COLOR, width: ACTIVE_CIRCLE_WIDTH });
  activeCircle.visible = false; // Скрываем по умолчанию
  pointContainer.addChildAt(activeCircle, 0); // Размещаем под остальными элементами

  pointContainer.on('pointerover', () => {
    if (editableMode === 'none') {
      pointContainer.parent.addChild(pointContainer);
      gsap.to(pointContainer.scale, {
        x: POINT_HOVER_SCALE,
        y: POINT_HOVER_SCALE,
        duration: 0.2,
        ease: 'power2.out',
      });
    } else {
      hoverCircle.visible = true;
    }
  });

  pointContainer.on('pointerout', () => {
    if (editableMode === 'none') {
      gsap.to(pointContainer.scale, { x: 1.0, y: 1.0, duration: 0.2, ease: 'power2.out' });
    } else {
      hoverCircle.visible = false;
    }
  });

  const setEditableMode = (mode: MapEditableMode) => {
    editableMode = mode;
  };

  const setActive = (active: boolean) => {
    activeCircle.visible = active;
  };

  return { container: pointContainer, graphics, setEditableMode, setActive, point };
};
