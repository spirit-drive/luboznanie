import * as PIXI from 'pixi.js';
import { MapControllerOptions, MapEditableMode, SelectedSpace } from '@/components/entities/map/MapView/MapView.types';
import { SELECT_COLOR } from '@/components/entities/map/MapView/constants/style';

interface ControllerState {
  editableMode: MapEditableMode;
  isDragging: boolean;
  isPinching: boolean;
  isSelecting: boolean;
  lastPosition: PIXI.Point | null;
  velocity: { x: number; y: number };
  activePointers: Map<number, PIXI.Point>;
  initialPinchDistance: number;
  initialPinchScale: PIXI.Point | null;
  startSelectPosition: PIXI.Point | null;
}

export const createMapController = (
  app: PIXI.Application,
  world: PIXI.Container,
  {
    onChangeWorld,
    onSelectedSpace,
    shouldStartSelecting = (editableMode, event) => editableMode === 'points' && event.shiftKey,
  }: MapControllerOptions,
) => {
  // --- Объект состояния ---
  const state: ControllerState = {
    editableMode: 'points',
    isDragging: false,
    isPinching: false,
    isSelecting: false,
    lastPosition: null,
    velocity: { x: 0, y: 0 },
    activePointers: new Map(),
    initialPinchDistance: 0,
    initialPinchScale: null,
    startSelectPosition: null,
  };

  const friction = 0.95;
  const MIN_SCALE = 0.2;
  const MAX_SCALE = 3.0;

  // Визуальный элемент для выделения
  const selectRect = new PIXI.Graphics();
  selectRect.eventMode = 'none'; // Важно: предотвращает перехват событий
  app.stage.addChild(selectRect);

  /**
   * --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
   */

  /** Вычисляет и возвращает границы выделенной области в локальных координатах мира. */
  const getSelectedSpace = (startGlobal: PIXI.Point, endGlobal: PIXI.Point): SelectedSpace => {
    const minGlobalX = Math.min(startGlobal.x, endGlobal.x);
    const minGlobalY = Math.min(startGlobal.y, endGlobal.y);
    const maxGlobalX = Math.max(startGlobal.x, endGlobal.x);
    const maxGlobalY = Math.max(startGlobal.y, endGlobal.y);

    const worldPoint1 = world.toLocal(new PIXI.Point(minGlobalX, minGlobalY));
    const worldPoint2 = world.toLocal(new PIXI.Point(maxGlobalX, maxGlobalY));

    return {
      minX: worldPoint1.x,
      minY: worldPoint1.y,
      maxX: worldPoint2.x,
      maxY: worldPoint2.y,
    };
  };

  /**
   * Ограничивает перемещение контейнера `world`.
   */
  const clampWorldPosition = () => {
    const worldBounds = world.getBounds();
    const screen = app.screen;

    const offsetX = screen.width / 2;
    const offsetY = screen.height / 2;

    const minX = offsetX - worldBounds.width;
    const maxX = offsetX;
    const minY = offsetY - worldBounds.height;
    const maxY = offsetY;

    if (world.x < minX) {
      world.x = minX;
      state.velocity.x = 0;
    } else if (world.x > maxX) {
      world.x = maxX;
      state.velocity.x = 0;
    }

    if (world.y < minY) {
      world.y = minY;
      state.velocity.y = 0;
    } else if (world.y > maxY) {
      world.y = maxY;
      state.velocity.y = 0;
    }

    onChangeWorld?.();
  };

  /**
   * Применяет масштабирование.
   */
  const applyZoom = (newScale: number, zoomCenter: PIXI.Point) => {
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

    const worldPointBefore = world.toLocal(zoomCenter);
    world.scale.set(newScale);
    const worldPointAfter = world.toGlobal(worldPointBefore);

    world.x -= worldPointAfter.x - zoomCenter.x;
    world.y -= worldPointAfter.y - zoomCenter.y;

    clampWorldPosition();
  };

  // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

  const handlePointerDown = (event: PIXI.FederatedPointerEvent) => {
    state.activePointers.set(event.pointerId, event.global.clone());

    if (shouldStartSelecting(state.editableMode, event)) {
      state.isSelecting = true;
      state.startSelectPosition = event.global.clone();
      event.stopPropagation();
      return;
    }

    if (state.activePointers.size === 1) {
      state.isDragging = true;
      state.velocity = { x: 0, y: 0 };
      state.lastPosition = event.global.clone();
    } else if (state.activePointers.size === 2) {
      state.isDragging = false;
      state.isPinching = true;

      const pointers = Array.from(state.activePointers.values());
      state.initialPinchDistance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
      state.initialPinchScale = world.scale.clone();
    }
  };

  const handlePointerMove = (event: PIXI.FederatedPointerEvent) => {
    if (state.isSelecting && state.startSelectPosition) {
      const currentPosition = event.global;
      const x = Math.min(state.startSelectPosition.x, currentPosition.x);
      const y = Math.min(state.startSelectPosition.y, currentPosition.y);
      const width = Math.abs(currentPosition.x - state.startSelectPosition.x);
      const height = Math.abs(currentPosition.y - state.startSelectPosition.y);

      selectRect.clear();
      selectRect.rect(x, y, width, height);
      selectRect.stroke({ width: 2, color: SELECT_COLOR });
      selectRect.fill({ alpha: 0.2, color: SELECT_COLOR });

      const space = getSelectedSpace(state.startSelectPosition, currentPosition);
      onSelectedSpace?.(space, 'move', event);
      return;
    }

    if (!state.activePointers.has(event.pointerId)) return;
    state.activePointers.set(event.pointerId, event.global.clone());

    if (state.isPinching && state.activePointers.size === 2 && state.initialPinchScale) {
      const pointers = Array.from(state.activePointers.values());
      const currentDistance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
      const scaleFactor = currentDistance / state.initialPinchDistance;
      const newScale = state.initialPinchScale.x * scaleFactor;

      const pinchCenter = new PIXI.Point((pointers[0].x + pointers[1].x) / 2, (pointers[0].y + pointers[1].y) / 2);
      applyZoom(newScale, pinchCenter);
    } else if (state.isDragging && state.lastPosition) {
      const currentPosition = event.global;
      const dx = currentPosition.x - state.lastPosition.x;
      const dy = currentPosition.y - state.lastPosition.y;

      world.x += dx;
      world.y += dy;

      state.velocity.x = dx;
      state.velocity.y = dy;
      state.lastPosition = currentPosition.clone();

      clampWorldPosition();
    }
  };

  const handlePointerUp = (event: PIXI.FederatedPointerEvent) => {
    state.activePointers.delete(event.pointerId);

    if (state.activePointers.size < 2) state.isPinching = false;

    if (state.activePointers.size < 1) {
      state.isDragging = false;
      state.lastPosition = null;
    } else {
      state.isDragging = true;
      state.lastPosition = Array.from(state.activePointers.values())[0].clone();
    }

    if (state.isSelecting) {
      selectRect.clear();
      state.isSelecting = false;
      const space = getSelectedSpace(state.startSelectPosition!, event.global);
      state.startSelectPosition = null;
      onSelectedSpace?.(space, 'end', event);
    }
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const scaleFactor = 1.1;
    const newScale = event.deltaY < 0 ? world.scale.x * scaleFactor : world.scale.x / scaleFactor;
    const zoomCenter = new PIXI.Point(event.offsetX, event.offsetY);
    applyZoom(newScale, zoomCenter);
  };

  const handleTicker = () => {
    if (!state.isDragging && !state.isPinching && (state.velocity.x !== 0 || state.velocity.y !== 0)) {
      world.x += state.velocity.x;
      world.y += state.velocity.y;

      state.velocity.x *= friction;
      state.velocity.y *= friction;

      if (Math.abs(state.velocity.x) < 0.01) state.velocity.x = 0;
      if (Math.abs(state.velocity.y) < 0.01) state.velocity.y = 0;

      clampWorldPosition();
    }
  };

  // --- Инициализация и очистка ---

  const init = () => {
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    app.stage.on('pointerdown', handlePointerDown);
    app.stage.on('pointermove', handlePointerMove);
    app.stage.on('pointerup', handlePointerUp);
    app.stage.on('pointerupoutside', handlePointerUp);
    app.canvas.addEventListener('wheel', handleWheel, { passive: false });
    app.ticker.add(handleTicker);

    // Начальная подгонка положения
    clampWorldPosition();
  };

  const destroy = () => {
    app.stage.off('pointerdown', handlePointerDown);
    app.stage.off('pointermove', handlePointerMove);
    app.stage.off('pointerup', handlePointerUp);
    app.stage.off('pointerupoutside', handlePointerUp);
    app.canvas.removeEventListener('wheel', handleWheel);
    app.ticker.remove(handleTicker);
    selectRect.destroy(); // Уничтожаем графический объект
  };

  const setEditableMode = (mode: MapEditableMode) => {
    state.editableMode = mode;
  };

  // Запускаем инициализацию при создании
  init();

  return { destroy, setEditableMode };
};
