import * as PIXI from 'pixi.js';
import { MapControllerOptions, MapEditableMode } from '@/components/entities/map/MapView/MapView.types';
import { SELECT_COLOR } from '@/components/entities/map/MapView/constants/style';

export const createMapController = (
  app: PIXI.Application,
  world: PIXI.Container,
  {
    onChangeWorld,
    onSelectedSpace,
    shouldStartSelecting = (editableMode, event) => editableMode === 'points' && event.shiftKey,
  }: MapControllerOptions,
) => {
  // --- Состояния контроллера ---
  let editableMode: MapEditableMode = 'points';
  let isDragging = false;
  let isPinching = false;
  let lastPosition: PIXI.Point | null = null;
  let velocity = { x: 0, y: 0 };
  const friction = 0.95; // Коэффициент трения для инерции (0.9-0.97 - хорошие значения)

  const activePointers = new Map<number, PIXI.Point>();
  let initialPinchDistance = 0;
  let initialPinchScale = new PIXI.Point(1, 1);

  const MIN_SCALE = 0.2;
  const MAX_SCALE = 3.0;

  // Состояние для выделения рамкой
  let isSelecting = false;
  let startSelectPosition: PIXI.Point | null = null;
  const selectRect = new PIXI.Graphics();
  app.stage.addChild(selectRect);
  // --- Основные функции ---

  /**
   * Ограничивает перемещение контейнера `world` так, чтобы он не уезжал
   * дальше, чем на половину экрана от своих границ.
   * Это создает эффект "мягких границ".
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
      velocity.x = 0; // Гасим инерцию при столкновении
    } else if (world.x > maxX) {
      world.x = maxX;
      velocity.x = 0;
    }

    if (world.y < minY) {
      world.y = minY;
      velocity.y = 0;
    } else if (world.y > maxY) {
      world.y = maxY;
      velocity.y = 0;
    }

    onChangeWorld?.();
  };

  /**
   * Логика масштабирования, применимая как для колесика мыши, так и для щипка.
   * @param newScale - Новый масштаб для установки.
   * @param zoomCenter - Точка на экране (в глобальных координатах), относительно которой происходит масштабирование.
   */
  const applyZoom = (newScale: number, zoomCenter: PIXI.Point) => {
    // Ограничиваем масштаб
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

    // Магия для масштабирования относительно курсора/центра щипка:
    // 1. Находим, где точка `zoomCenter` находилась внутри `world` ДО масштабирования.
    const worldPointBefore = world.toLocal(zoomCenter);
    // 2. Применяем новый масштаб.
    world.scale.set(newScale);
    // 3. Находим, где эта точка оказалась в глобальных координатах ПОСЛЕ масштабирования.
    const worldPointAfter = world.toGlobal(worldPointBefore);
    // 4. Смещаем `world` на разницу, чтобы точка осталась под курсором.
    world.x -= worldPointAfter.x - zoomCenter.x;
    world.y -= worldPointAfter.y - zoomCenter.y;

    clampWorldPosition();
  };

  // --- Обработчики событий ---

  const onPointerDown = (event: PIXI.FederatedPointerEvent) => {
    activePointers.set(event.pointerId, event.global.clone());

    // Логика выделения рамкой для режима редактирования
    if (shouldStartSelecting!(editableMode, event)) {
      isSelecting = true;
      startSelectPosition = event.global.clone();
      event.stopPropagation();
      return;
    }

    if (activePointers.size === 1) {
      // Первое касание: начинаем перетаскивание
      isDragging = true;
      velocity = { x: 0, y: 0 }; // Останавливаем инерцию
      lastPosition = event.global.clone();
    } else if (activePointers.size === 2) {
      // Второе касание: переключаемся на масштабирование
      isDragging = false;
      isPinching = true;

      const pointers = Array.from(activePointers.values());
      initialPinchDistance = getDistance(pointers[0], pointers[1]);
      initialPinchScale = world.scale.clone();
    }
  };

  const onPointerMove = (event: PIXI.FederatedPointerEvent) => {
    if (isSelecting && startSelectPosition) {
      const currentPosition = event.global;
      const x = Math.min(startSelectPosition.x, currentPosition.x);
      const y = Math.min(startSelectPosition.y, currentPosition.y);
      const width = Math.abs(currentPosition.x - startSelectPosition.x);
      const height = Math.abs(currentPosition.y - startSelectPosition.y);

      selectRect.clear();
      selectRect.rect(x, y, width, height);
      selectRect.stroke({ width: 2, color: SELECT_COLOR });
      selectRect.fill({ alpha: 0.2, color: SELECT_COLOR });

      const worldPosition = world.getBounds();
      const minY = y - worldPosition.minY;
      const minX = x - worldPosition.minX;
      const maxX = minX + width;
      const maxY = minY + height;

      onSelectedSpace?.({ minX, minY, maxY, maxX }, 'move', event);
      return;
    }

    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, event.global.clone());

    if (isPinching && activePointers.size === 2) {
      // Логика масштабирования щипком
      const pointers = Array.from(activePointers.values());
      const currentDistance = getDistance(pointers[0], pointers[1]);
      const scaleFactor = currentDistance / initialPinchDistance;
      const newScale = initialPinchScale.x * scaleFactor;

      const pinchCenter = getCenter(pointers[0], pointers[1]);
      applyZoom(newScale, pinchCenter);
    } else if (isDragging && lastPosition) {
      // Логика перемещения
      const currentPosition = event.global;
      const dx = currentPosition.x - lastPosition.x;
      const dy = currentPosition.y - lastPosition.y;

      world.x += dx;
      world.y += dy;

      // Обновляем скорость для инерции
      velocity.x = dx;
      velocity.y = dy;
      lastPosition = currentPosition.clone();

      clampWorldPosition();
    }
  };

  const onPointerUp = (event: PIXI.FederatedPointerEvent) => {
    activePointers.delete(event.pointerId);

    if (activePointers.size < 2) isPinching = false;

    if (activePointers.size < 1) {
      isDragging = false;
      lastPosition = null;
    } else {
      // Если остался один палец, переключаемся на панорамирование с него,
      // чтобы избежать "прыжка" карты.
      isDragging = true;
      lastPosition = Array.from(activePointers.values())[0].clone();
    }

    if (isSelecting) {
      selectRect.clear();
      isSelecting = false;

      const currentPosition = event.global;
      const worldPosition = world.getBounds();
      const x = Math.min(startSelectPosition.x, currentPosition.x) - worldPosition.minX;
      const y = Math.min(startSelectPosition.y, currentPosition.y) - worldPosition.minY;
      const width = Math.abs(currentPosition.x - startSelectPosition.x);
      const height = Math.abs(currentPosition.y - startSelectPosition.y);

      startSelectPosition = null;

      onSelectedSpace?.({ minX: x, minY: y, maxY: y + height, maxX: x + width }, 'end', event);
    }
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const scaleFactor = 1.1;
    const newScale = event.deltaY < 0 ? world.scale.x * scaleFactor : world.scale.x / scaleFactor;
    const zoomCenter = new PIXI.Point(event.offsetX, event.offsetY);
    applyZoom(newScale, zoomCenter);
  };

  const tickerCallback = () => {
    // Применяем инерцию, только если пользователь не взаимодействует с картой
    if (!isDragging && !isPinching && (velocity.x !== 0 || velocity.y !== 0)) {
      world.x += velocity.x;
      world.y += velocity.y;

      velocity.x *= friction;
      velocity.y *= friction;

      // Останавливаем, если скорость слишком мала
      if (Math.abs(velocity.x) < 0.01) velocity.x = 0;
      if (Math.abs(velocity.y) < 0.01) velocity.y = 0;

      clampWorldPosition();
    }
  };

  // --- Вспомогательные функции ---
  const getDistance = (p1: PIXI.Point, p2: PIXI.Point) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const getCenter = (p1: PIXI.Point, p2: PIXI.Point) => new PIXI.Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);

  // --- Инициализация и очистка ---

  // Включаем интерактивность на всю сцену
  app.stage.interactive = true;
  app.stage.hitArea = app.screen;

  // Подписываемся на события
  app.stage.on('pointerdown', onPointerDown);
  app.stage.on('pointermove', onPointerMove);
  app.stage.on('pointerup', onPointerUp);
  app.stage.on('pointerupoutside', onPointerUp);
  app.canvas.addEventListener('wheel', onWheel, { passive: false });
  app.ticker.add(tickerCallback);

  // Вызываем один раз для начальной коррекции положения
  clampWorldPosition();

  // Возвращаем функцию для очистки ресурсов
  const destroy = () => {
    app.stage.off('pointerdown', onPointerDown);
    app.stage.off('pointermove', onPointerMove);
    app.stage.off('pointerup', onPointerUp);
    app.stage.off('pointerupoutside', onPointerUp);
    app.canvas.removeEventListener('wheel', onWheel);
    app.ticker.remove(tickerCallback);
  };

  const setEditableMode = (mode: MapEditableMode) => {
    editableMode = mode;
  };

  return { destroy, setEditableMode };
};
