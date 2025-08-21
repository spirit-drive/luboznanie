import * as PIXI from 'pixi.js';
import { MapEditableMode, PointVisualOptions, PointVisuals } from '../MapView.types';
import { gsap } from 'gsap';
import { createTextContainer } from './createTextContainer';
import { Point } from '@/types/entities/point/point.types';
import { EntityType } from '@/types/shared';
import { ACTIVE_COLOR, SELECT_COLOR } from '@/components/entities/map/MapView/constants/style';

// --- Константы ---
const SVG_ICON_SIZE = 60;

const CIRCLE_RADIUS = 50;
const PROGRESS_BAR_RADIUS = 68;
const PROGRESS_BAR_THICKNESS = 8;
const HOVER_CIRCLE_RADIUS = 54;
const HOVER_CIRCLE_WIDTH = 4;
const ACTIVE_CIRCLE_RADIUS = PROGRESS_BAR_RADIUS;
const ACTIVE_CIRCLE_WIDTH = PROGRESS_BAR_THICKNESS;
const TEXT_BLOCK_OFFSET_X = CIRCLE_RADIUS + PROGRESS_BAR_THICKNESS / 2 + 34;
const HOVER_SCALE = 1.2;

const ICON_SHIFT_MAP: Record<EntityType, number> = {
  practice: 0,
  article: 1,
  map: 2,
};

// Интерфейс для внутреннего состояния
interface PointVisualState {
  editableMode: MapEditableMode;
  isActive: boolean;
  isHovered: boolean;
}

/**
 * Создает основной круг и прогресс-бар для точки.
 */
const createPointGraphics = (point: Point): Record<'progress' | 'circle', PIXI.Graphics> => {
  const progress = new PIXI.Graphics();
  const circle = new PIXI.Graphics();
  circle.circle(0, 0, CIRCLE_RADIUS);
  circle.fill(point.color || '#eff');

  if (point.progress !== undefined && point.progress >= 0 && point.progress <= 100) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI * point.progress) / 100;
    progress.setStrokeStyle({ width: PROGRESS_BAR_THICKNESS, color: point.color || '#eff', cap: 'round' });
    progress.arc(0, 0, PROGRESS_BAR_RADIUS, startAngle, endAngle);
    progress.stroke();
  }
  return { circle, progress };
};

/**
 * Создает круг-обводку для состояний 'hover' и 'active'.
 */
const createSelectionCircle = (color: number, width: number, radius: number): PIXI.Graphics => {
  const circle = new PIXI.Graphics();
  circle.circle(0, 0, radius);
  circle.stroke({ color, width });
  circle.visible = false;
  return circle;
};

/**
 * Создает визуальное представление для одной точки.
 */
export const createPointVisual = (point: Point, options: PointVisualOptions): PointVisuals => {
  const state: PointVisualState = {
    editableMode: 'points',
    isActive: false,
    isHovered: false,
  };

  const pointContainer = new PIXI.Container();
  pointContainer.position.set(point.position.x, point.position.y);
  pointContainer.interactive = true;
  pointContainer.cursor = 'pointer';

  // Создаем все визуальные компоненты
  const { circle, progress } = createPointGraphics(point);
  const hoverCircle = createSelectionCircle(SELECT_COLOR, HOVER_CIRCLE_WIDTH, HOVER_CIRCLE_RADIUS);
  const activeCircle = createSelectionCircle(ACTIVE_COLOR, ACTIVE_CIRCLE_WIDTH, ACTIVE_CIRCLE_RADIUS);

  // Определяем область иконки и создаём спрайт
  const frame = new PIXI.Rectangle(
    options.pointTypeIcon.frame.height * ICON_SHIFT_MAP[point.entity.type],
    0,
    options.pointTypeIcon.frame.height,
    options.pointTypeIcon.frame.height,
  );
  const croppedTexture = new PIXI.Texture({ source: options.pointTypeIcon.source, frame });
  const icon = new PIXI.Sprite(croppedTexture);
  icon.width = SVG_ICON_SIZE;
  icon.height = SVG_ICON_SIZE;
  icon.anchor.set(0.5); // Устанавливаем якорь в центр для простоты позиционирования

  // Создаём текстовый блок
  const { textContainer } = createTextContainer(point, options);
  textContainer.position.x = TEXT_BLOCK_OFFSET_X;
  textContainer.position.y = -textContainer.height / 2;

  // Добавляем все элементы в контейнер
  pointContainer.addChild(circle, progress, activeCircle, hoverCircle, icon, textContainer);

  /**
   * --- ОБРАБОТЧИКИ СОБЫТИЙ ---
   */
  pointContainer.on('pointertap', (event) => {
    // Поднимаем элемент на верхний слой при взаимодействии
    pointContainer.parent.addChild(pointContainer);
    options.onPointClick?.(point, event);
  });

  pointContainer.on('pointerdown', (event) => {
    pointContainer.parent.addChild(pointContainer);
    options.onPointDown?.(point, event);
  });

  const updateVisualState = () => {
    hoverCircle.visible = state.isHovered && state.editableMode !== 'none' && !state.isActive;
    activeCircle.visible = state.isActive;
    if (state.editableMode === 'none') {
      gsap.to(pointContainer.scale, {
        x: state.isHovered ? HOVER_SCALE : 1.0,
        y: state.isHovered ? HOVER_SCALE : 1.0,
        duration: 0.2,
        ease: 'power2.out',
      });
      pointContainer.cursor = 'pointer';
    } else {
      gsap.to(pointContainer.scale, { x: 1.0, y: 1.0, duration: 0.2, ease: 'power2.out' });
      pointContainer.cursor = state.isHovered ? 'grab' : 'pointer';
    }
  };

  pointContainer.on('pointerover', () => {
    state.isHovered = true;
    updateVisualState();
  });

  pointContainer.on('pointerout', () => {
    state.isHovered = false;
    updateVisualState();
  });

  // --- МЕТОДЫ УПРАВЛЕНИЯ ---
  const setEditableMode = (mode: MapEditableMode) => {
    state.editableMode = mode;
    updateVisualState();
  };

  const setActive = (active: boolean) => {
    state.isActive = active;
    updateVisualState();
  };

  return { container: pointContainer, progress, circle, setEditableMode, setActive, point };
};
