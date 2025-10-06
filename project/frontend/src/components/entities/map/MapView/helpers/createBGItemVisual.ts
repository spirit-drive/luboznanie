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

  const { backgroundAssets, app } = options;

  const [alias, indexStr] = item.type.split('/');
  const index = parseInt(indexStr);

  if (Number.isNaN(index)) {
    throw `Некорректный индекс изображения в спрайте ${item.type} в пункте с id ${item.id}`;
  }
  const asset = backgroundAssets[alias];
  if (!(asset instanceof PIXI.Texture)) throw `Asset for item with id ${item.id} is not a valid Texture.`;

  const assetFrameSize = asset.frame.height;
  const frame = new PIXI.Rectangle(assetFrameSize * index, 0, assetFrameSize, assetFrameSize);
  const croppedTexture = new PIXI.Texture({ source: asset.source, frame });

  const sprite = new PIXI.Sprite(croppedTexture);
  const container = new PIXI.Container();

  sprite.height = sprite.height / 2;
  sprite.width = sprite.width / 2;
  sprite.anchor.set(0.5);

  container.position.set(item.position.x, item.position.y);

  const squareSize = Math.max(sprite.width, sprite.height) + BORDER_THICKNESS * 2;
  const hoverSquare = createSelectionSquare(SELECT_COLOR, BORDER_THICKNESS, squareSize - 8, item.position);
  const activeSquare = createSelectionSquare(ACTIVE_COLOR, BORDER_THICKNESS, squareSize, item.position);

  sprite.label = item.id;
  container.visible = !item.hidden;
  container.interactive = true;

  container.addChild(hoverSquare, activeSquare, sprite);

  const updateVisualState = () => {
    if (state.editableMode === 'backgrounds') {
      hoverSquare.visible = state.isHovered;
      activeSquare.visible = state.isActive;
      container.cursor = state.isHovered ? 'grab' : 'default';
    } else {
      hoverSquare.visible = false;
      activeSquare.visible = false;
    }
  };

  container.on('pointertap', (event) => {
    container.parent.addChild(container);
    options.onBGItemClick?.(item, event);
  });

  container.on('pointerdown', (event) => {
    options.onBGItemDown?.(item, event);
  });

  container.on('pointerover', () => {});

  container.on('pointermove', (event) => {
    options.onBGItemMove?.(item, event);
  });

  container.on('pointerout', async (event) => {
    options.onBGItemOut?.(item, event);
  });

  const setEditableMode = (mode: MapEditableMode) => {
    state.editableMode = mode;
    updateVisualState();
  };

  const setActive = (active: boolean) => {
    state.isActive = active;
    container.parent.addChild(activeSquare);
    updateVisualState();
  };

  const setIsHover = (isHovered: boolean) => {
    state.isHovered = isHovered;
    container.parent.addChild(hoverSquare);
    updateVisualState();
  };

  return {
    setEditableMode,
    setActive,
    container,
    sprite,
    setIsHover,
    bgItem: item,
    setPosition: ({ x, y }) => {
      container.position.x = x;
      container.position.y = y;
      hoverSquare.position.x = x;
      hoverSquare.position.y = y;
      activeSquare.position.x = x;
      activeSquare.position.y = y;
    },
  };
};
