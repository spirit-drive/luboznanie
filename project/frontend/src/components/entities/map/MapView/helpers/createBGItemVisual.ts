import * as PIXI from 'pixi.js';
import { BGItemVisualOptions, BGItemVisuals, MapEditableMode } from '../MapView.types';
import { ACTIVE_COLOR, SELECT_COLOR } from '@/components/entities/map/MapView/constants/style';
import { BackgroundItem } from '@/types/entities/map/map.types';

const BORDER_THICKNESS = 4;

// Интерфейс для внутреннего состояния
interface BGItemVisualState {
  editableMode: MapEditableMode;
  isActive: boolean;
  isHovered: boolean;
}

const createSelectionSquare = (
  color: string,
  width: number,
  size: number,
  { x, y }: { x: number; y: number },
): PIXI.Graphics => {
  const square = new PIXI.Graphics();
  const halfSize = size / 2;
  // Рисуем квадрат с центром в (0, 0)
  square.rect(-halfSize, -halfSize, size, size);
  square.x = x;
  square.y = y;
  square.stroke({ color, width });
  square.visible = false;
  return square;
};

/**
 * Создает визуальное представление для одного фонового элемента.
 */
export const createBGItemVisual = (item: BackgroundItem, options: BGItemVisualOptions): BGItemVisuals => {
  const state: BGItemVisualState = {
    editableMode: 'none',
    isActive: false,
    isHovered: false,
  };

  const { backgroundAssets } = options;

  // Получаем загруженный ассет и определяем область обрезки
  const [alias, indexStr] = item.type.split('/');
  const index = parseInt(indexStr);

  if (Number.isNaN(index)) {
    throw `Некорректный индекс изображения в спрайте ${item.type} в пункте с id ${item.id}`;
  }
  const asset = backgroundAssets[alias];
  if (!(asset instanceof PIXI.Texture)) throw `Asset for item with id ${item.id} is not a valid Texture.`;

  const assetFrameSize = asset.frame.height; // Предполагаем, что иконки в спрайте квадратные
  // Определяем область обрезки для нужной иконки
  const frame = new PIXI.Rectangle(assetFrameSize * index, 0, assetFrameSize, assetFrameSize);

  // Создаем новую текстуру с обрезанной областью
  const croppedTexture = new PIXI.Texture({ source: asset.source, frame });

  const sprite = new PIXI.Sprite(croppedTexture);
  const container = new PIXI.Container();

  // Масштабируем спрайт
  sprite.height = sprite.height / 2;
  sprite.width = sprite.width / 2;
  sprite.anchor.set(0.5); // Центрируем спрайт

  // Позиционируем контейнер
  container.position.set(item.x, item.y);

  // --- Создаём квадраты ---
  // Размер квадрата берем чуть больше размера спрайта для обводки
  const squareSize = Math.max(sprite.width, sprite.height) + BORDER_THICKNESS * 2;
  const hoverSquare = createSelectionSquare(SELECT_COLOR, BORDER_THICKNESS, squareSize - 8, item);
  const activeSquare = createSelectionSquare(ACTIVE_COLOR, BORDER_THICKNESS, squareSize, item);

  sprite.label = item.id;
  container.visible = !item.hidden;
  container.interactive = true;

  // Добавляем элементы в контейнер: сначала квадраты, потом спрайт
  container.addChild(hoverSquare, activeSquare, sprite);

  /**
   * Обновляет визуальное состояние элемента в зависимости от mode, hover и active.
   */
  const updateVisualState = () => {
    // В режиме редактирования фоновых элементов
    if (state.editableMode === 'backgrounds') {
      hoverSquare.visible = state.isHovered;
      activeSquare.visible = state.isActive;
      container.cursor = state.isHovered ? 'grab' : 'default';
    } else {
      hoverSquare.visible = false;
      activeSquare.visible = false;
    }
  };

  /**
   * --- ОБРАБОТЧИКИ СОБЫТИЙ ---
   */
  container.on('pointertap', (event) => {
    container.parent.addChild(container); // Поднимаем наверх
    options.onBGItemClick?.(item, event); // Используем onBGItemClick из опций
  });

  container.on('pointerdown', (event) => {
    options.onBGItemDown?.(item, event); // Используем onBGItemDown из опций
  });

  container.on('pointerover', () => {
    state.isHovered = true;
    container.parent.addChild(hoverSquare);
    updateVisualState();
  });

  container.on('pointerout', () => {
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
    container.parent.addChild(activeSquare);
    updateVisualState();
  };

  return {
    setEditableMode,
    setActive,
    container,
    sprite,
    bgItem: item,
  };
};
