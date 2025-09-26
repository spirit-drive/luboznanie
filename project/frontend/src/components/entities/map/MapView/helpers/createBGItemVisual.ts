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

// --- Вспомогательные функции для превью ---

let previewCanvas: HTMLCanvasElement | null = null;

const showPreview = (texture: PIXI.Texture, x: number, y: number) => {
  if (previewCanvas) hidePreview();

  // Создаём canvas
  previewCanvas = document.createElement('canvas');
  previewCanvas.style.pointerEvents = 'none';
  previewCanvas.style.zIndex = '9999';
  previewCanvas.style.border = '2px solid rgba(0,0,0,0.3)';
  previewCanvas.style.background = '#fff';
  previewCanvas.width = texture.width / 2;
  previewCanvas.height = texture.height / 2;

  document.body.appendChild(previewCanvas);

  // Отрисовываем текстуру в canvas
  const ctx = previewCanvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.src = texture.source.label;
  console.log(img.src);

  img.onload = () => {
    // Определим область спрайта
    const frame = texture.frame;
    ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height, 0, 0, previewCanvas!.width, previewCanvas!.height);
  };
};

const hidePreview = () => {
  if (previewCanvas) {
    previewCanvas.remove();
    previewCanvas = null;
  }
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

  container.position.set(item.x, item.y);

  const squareSize = Math.max(sprite.width, sprite.height) + BORDER_THICKNESS * 2;
  const hoverSquare = createSelectionSquare(SELECT_COLOR, BORDER_THICKNESS, squareSize - 8, item);
  const activeSquare = createSelectionSquare(ACTIVE_COLOR, BORDER_THICKNESS, squareSize, item);

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

  container.on('pointerover', (event) => {
    container.parent.addChild(hoverSquare);
    updateVisualState();

    // Показываем canvas с превью
    const { clientX, clientY } = event.data.originalEvent as PointerEvent;
    showPreview(croppedTexture, clientX, clientY);
  });

  container.on('pointermove', (event) => {
    if (previewCanvas) {
      const { clientX: x, clientY: y } = event.data.originalEvent as PointerEvent;
      const ctx = previewCanvas.getContext('2d');
      const rect = container.getBounds();
      const pixelData = ctx.getImageData(x - rect.x, y - rect.y, 1, 1);
      state.isHovered = pixelData.data[3] !== 0;
      updateVisualState();

      console.log(pixelData, pixelData.data[3]);
    }
  });

  container.on('pointerout', () => {
    state.isHovered = false;
    updateVisualState();
    hidePreview();
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

  return {
    setEditableMode,
    setActive,
    container,
    sprite,
    bgItem: item,
  };
};
