import * as PIXI from 'pixi.js';
import {
  BGItemVisualOptions,
  BGItemVisuals,
  MapEditableMode,
  OnSelectedSpace,
} from '@/components/entities/map/MapView/MapView.types';
import { PointsAndBackgroundsManagerState } from '@/components/entities/map/MapView/helpers/types';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { AddingBackgroundType, BackgroundItem, MapBackgroundItem } from '@/types/entities/map/map.types';
import { createBGItemVisual } from '@/components/entities/map/MapView/helpers/createBGItemVisual';
import { deepCopy } from '@/utils/deepCopy';
import { createSingleDoubleAction } from '@/utils/createSingleDoubleAction';
import { getDeltasByKey } from '@/components/entities/map/MapView/helpers/getDeltasByKey';
import { getNeighbors } from '@/components/entities/map/MapView/helpers/getNeighbors';
import { FederatedPointerEvent } from 'pixi.js';
import { createAddingBGItem } from '@/components/entities/map/MapView/helpers/createAddingBGItem';

export const createBackgroundItemsManager = ({
  app,
  world,
  options,
  state,
}: {
  state: PointsAndBackgroundsManagerState;
  app: PIXI.Application;
  world: PIXI.Container<ContainerChild>;
  options: BGItemVisualOptions;
}) => {
  const { backgroundItems, shouldUnselectByRect, backgroundAssets, onChangeBGItems, onAddedElement } = options;

  const backgroundContainer = new PIXI.Container();
  const backgroundItemsMap = new Map<string, MapBackgroundItem>();
  const canvasesMap = new Map<string, PIXI.ICanvas>();
  let items: BGItemVisuals[] = [];

  const onMoveAddingBGItem = (event: PIXI.FederatedPointerEvent) => {
    if (state.addingBGItem) {
      state.addingBGItem.container.visible = state.addingBGItemVisible;
      const localPosition = world.toLocal(event.global);
      state.addingBGItem.container.position.copyFrom(localPosition);
    }
  };

  const unmountAddingBGItem = () => {
    if (state.addingBGItem) {
      backgroundContainer.removeChild(state.addingBGItem.container);
      state.addingBGItem.container.destroy({ children: true });
      state.addingBGItem = null;
    }
    app.stage.off('pointermove', onMoveAddingBGItem);
  };

  const mountAddingBGItem = (mode: MapEditableMode, addingBGTtem: AddingBackgroundType) => {
    state.addingBGItem = createAddingBGItem({ x: 0, y: 0 }, addingBGTtem, options); // Начальная позиция
    backgroundContainer.addChild(state.addingBGItem.container);
    app.stage.on('pointermove', onMoveAddingBGItem);
  };

  const applyBGItemChanges = () => {
    const newBGITems: BackgroundItem[] = Array.from(state.renderedBGItems.values()).map((visual) => ({
      ...deepCopy(visual.bgItem),
      position: {
        x: visual.container.position.x,
        y: visual.container.position.y,
      },
    }));
    onChangeBGItems?.(newBGITems);
  };

  const onPointerDown = (visual: BGItemVisuals, event: PIXI.FederatedPointerEvent) => {
    event.stopPropagation();
    if (state.editableMode === 'backgrounds' && state.selectedBGItems.has(visual.bgItem.id)) {
      state.isDragging = true;
      state.dragStartGlobal = event.global.clone();

      const localMousePosition = world.toLocal(event.global);
      state.dragOffset = new PIXI.Point(
        localMousePosition.x - visual.bgItem.position.x,
        localMousePosition.y - visual.bgItem.position.y,
      );

      state.movableBGItem = visual;

      // Привязываем обработчики к сцене, чтобы отслеживать движение за пределами точки
      app.stage.on('pointermove', onPointerMove);
      app.stage.on('pointerup', onPointerUp);
    }
  };

  const onPointerMove = (event: PIXI.FederatedPointerEvent) => {
    if (!state.isDragging || !state.dragStartGlobal || !state.dragOffset || !state.movableBGItem) {
      return;
    }

    state.moved = true;
    const newLocalPosition = world.toLocal(event.global);

    const deltaX = newLocalPosition.x - state.dragOffset.x - state.movableBGItem.container.position.x;
    const deltaY = newLocalPosition.y - state.dragOffset.y - state.movableBGItem.container.position.y;

    state.selectedBGItems.forEach((visual) => {
      visual.setPosition({ x: visual.container.position.x + deltaX, y: visual.container.position.y + deltaY });
    });

    applyBGItemChanges();
  };

  const onPointerUp = () => {
    if (!state.isDragging) return;

    // Сбрасываем состояние после задержки, чтобы избежать ложных 'clicks'
    setTimeout(() => {
      state.isDragging = false;
      state.dragStartGlobal = null;
      state.dragOffset = null;
      state.movableBGItem = null;
    });

    app.stage.off('pointermove', onPointerMove);
    app.stage.off('pointerup', onPointerUp);
  };

  const unselectBGItems = (bgItems: BGItemVisuals[]) => {
    bgItems.forEach((item) => {
      item.setActive(false);
      state.selectedBGItems.delete(item.bgItem.id);
    });
  };

  const selectBGItems = (bgItems: BGItemVisuals[]) => {
    bgItems.forEach((item) => {
      item.setActive(true);
      state.selectedBGItems.set(item.bgItem.id, item);
    });
  };

  const onBGItemClick = createSingleDoubleAction<PIXI.FederatedPointerEvent>({
    alwaysHandler: (event, item: BGItemVisuals) => {
      options.onBGItemClick?.(item.bgItem, event);

      return false;
    },
    singleHandler: (event, item: BGItemVisuals) => {
      if (state.moved) {
        state.moved = false;
        return;
      }

      if (state.editableMode !== 'backgrounds' || state.addingBGItem || state.addingPoint) return;

      const visual = state.renderedBGItems.get(item.bgItem.id);
      if (!visual) return;

      if (state.selectedBGItems.has(item.bgItem.id)) unselectBGItems([visual]);
      else selectBGItems([visual]);
    },
    doubleHandler: (event, item: BGItemVisuals) => {
      if (state.editableMode !== 'backgrounds') return;

      const visual = state.renderedBGItems.get(item.bgItem.id);
      if (!visual) return;

      const all = [...state.renderedBGItems.values()];
      const neighbors = getNeighbors(all, item, (i) => i.container);
      if (state.selectedBGItems.has(item.bgItem.id)) unselectBGItems(neighbors);
      else selectBGItems(neighbors);
    },
  });

  const resetBGItemsSelecting = () => {
    unselectBGItems(Array.from(state.selectedBGItems.values()));
    state.selectedBGItems.clear();
  };

  const selectAllBGItems = () => {
    selectBGItems(Array.from(state.renderedBGItems.values()));
    state.selectedBGItems = new Map(state.renderedBGItems);
  };

  const selectBGItemsBySpace: OnSelectedSpace = (space, phase, event) => {
    if (phase === 'end') {
      const pointsInSpace = Array.from(state.renderedBGItems.entries()).filter(([, point]) => {
        const { x, y } = point.container.position;
        const { width, height } = point.container;

        const minX = x - width / 2;
        const minY = y - height / 2;
        const maxX = minX + width;
        const maxY = minY + height;

        return !(maxX < space.minX || minX > space.maxX || maxY < space.minY || minY > space.maxY);
      });

      if (shouldUnselectByRect!(event)) {
        pointsInSpace.forEach(([id, point]) => {
          point.setActive(false);
          state.selectedBGItems.delete(id);
        });
      } else {
        pointsInSpace.forEach(([id, point]) => {
          point.setActive(true);
          state.selectedBGItems.set(id, point);
        });
      }
    }
  };

  const onInsideElem =
    ({
      beforeFound,
      afterFound,
      onFound,
    }: {
      beforeFound?: (item: BGItemVisuals, isInside: boolean) => void;
      onFound?: (item: BGItemVisuals) => void;
      afterFound?: (item: BGItemVisuals) => void;
    }) =>
    ({ x, y }: { x: number; y: number }) => {
      let found = false;
      items.forEach((item) => {
        if (found) {
          afterFound?.(item);
          return;
        }

        const rect = item.container.getBounds();
        if (x < rect.minX || x > rect.maxX) return;
        if (y < rect.minY || y > rect.maxY) return;

        const canvas = canvasesMap.get(item.bgItem.id) || app.renderer.extract.canvas(item.container);
        if (!canvas) return;

        canvasesMap.set(item.bgItem.id, canvas);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const kY = canvas.height / rect.height;
        const kX = canvas.width / rect.width;

        const pixelData = ctx.getImageData((x - rect.x) * kY, (y - rect.y) * kX, 1, 1);
        const isInside = pixelData.data[3] !== 0;
        beforeFound?.(item, isInside);

        if (isInside) {
          onFound?.(item);
          found = true;
        }
      });
    };

  const isAnyBGITem = (event: PIXI.FederatedPointerEvent) => {
    let itIS = false;
    const { clientX: x, clientY: y } = event;
    onInsideElem({
      onFound: () => {
        itIS = true;
      },
    })({ x, y });
    return itIS;
  };

  const onMove = onInsideElem({
    beforeFound: (item, isInside) => {
      item.setIsHover(isInside);
    },
    afterFound: (item) => {
      item.setIsHover(false);
    },
  });

  const updateBGITems = (backgroundItems: BackgroundItem[] | undefined) => {
    if (!backgroundItems) return;

    const currentIds = new Set(state.renderedBGItems.keys().map(String));
    const newIds = new Set(backgroundItems.map((item) => item.id));

    // 1. Удаление старых точек
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        const pointVisual = state.renderedBGItems.get(id);
        if (pointVisual) {
          backgroundContainer.removeChild(pointVisual.container);
          pointVisual.container.destroy({ children: true });
        }
        state.renderedBGItems.delete(id);
        state.selectedBGItems.delete(id); // Важно: удаляем из selected
      }
    }

    // 2. Добавление и обновление существующих точек
    for (const item of backgroundItems) {
      const existingVisual = state.renderedBGItems.get(item.id);

      if (existingVisual) {
        existingVisual.container.position.set(item.position.x, item.position.y);
        existingVisual.bgItem.position = item.position;
      } else {
        try {
          const bgItemVisual = createBGItemVisual(item, {
            backgroundAssets,
            app,
            state,
            onBGItemClick: (bgItem, event) => {
              const { clientX: x, clientY: y } = event.data.originalEvent as PointerEvent;

              onInsideElem({
                onFound: (item) => {
                  onBGItemClick(event, item);
                },
              })({ x, y });
            },
            onBGItemDown: (bgItem, event) => {
              const { clientX: x, clientY: y } = event.data.originalEvent as PointerEvent;

              onInsideElem({
                onFound: (item) => {
                  onPointerDown(item, event);
                },
              })({ x, y });
            },
            onBGItemOut: () => {
              canvasesMap.clear();
            },
          });
          backgroundItemsMap.set(item.id, { container: bgItemVisual.container, backgroundItem: item });
          bgItemVisual.setEditableMode(state.editableMode);
          state.renderedBGItems.set(item.id, bgItemVisual);
          backgroundContainer.addChild(bgItemVisual.container);
          if (state.addingBGItem) backgroundContainer.addChild(state.addingBGItem.container);
        } catch (e) {
          console.warn(e);
        }
      }
    }

    items = [...state.renderedBGItems.values()].reverse();
  };

  updateBGITems(backgroundItems);

  const onUpZIndex = (backgroundItems: BackgroundItem[] | undefined) => {
    if (!backgroundItems) return;

    const selectedIds = new Set(backgroundItems.map((i) => i.id));

    // Элементы, которые не выбраны (остаются на своих местах)
    const unselectedItems = [...state.renderedBGItems.values()].filter((item) => !selectedIds.has(item.bgItem.id));

    // Выбранные элементы (перемещаются в конец)
    const selectedItems = backgroundItems.filter((item) => selectedIds.has(item.id));

    // Новый порядок: невыбранные, затем выбранные
    const newBGItems = [...unselectedItems, ...selectedItems];

    // Применяем изменения
    onChangeBGItems?.(newBGItems);
  };

  const onUpZIndexActive = () => onUpZIndex(Array.from(state.selectedBGItems.values(), (i) => i.bgItem));

  const onDownZIndex = (backgroundItems: BackgroundItem[] | undefined) => {
    if (!backgroundItems) return;

    const selectedIds = new Set(backgroundItems.map((i) => i.id));

    // Элементы, которые не выбраны (остаются на своих местах)
    const unselectedItems = [...state.renderedBGItems.values()].filter((item) => !selectedIds.has(item.bgItem.id));

    // Выбранные элементы (перемещаются в конец)
    const selectedItems = backgroundItems.filter((item) => selectedIds.has(item.id));

    // Новый порядок: невыбранные, затем выбранные
    const newBGItems = [...selectedItems, ...unselectedItems];

    // Применяем изменения
    onChangeBGItems?.(newBGItems);
  };
  const onDownZIndexActive = () => onDownZIndex(Array.from(state.selectedBGItems.values(), (i) => i.bgItem));

  world.addChild(backgroundContainer);

  const onKeyDown = (event: KeyboardEvent) => {
    if (state.editableMode === 'backgrounds' && state.selectedBGItems.size > 0) {
      event.preventDefault();

      const { deltaX, deltaY } = getDeltasByKey(event);

      state.selectedBGItems.forEach((visual) => {
        visual.setPosition({
          x: visual.container.position.x + deltaX,
          y: visual.container.position.y + deltaY,
        });
      });

      applyBGItemChanges();
    }
  };

  const onAppPointerUp = createSingleDoubleAction<PIXI.FederatedPointerEvent>({
    alwaysHandler: (): boolean => {
      switch (state.editableMode) {
        case 'backgrounds': {
          if (!state.addingBGItem?.container.visible) return false;
          const id = Math.random().toString(16);
          const value: BackgroundItem = {
            ...deepCopy(state.addingBGItem.bgItem),
            id,
            position: {
              x: state.addingBGItem.container.position.x,
              y: state.addingBGItem.container.position.y,
            },
          };
          onAddedElement?.({ type: 'background', value });
          // Чтобы сработало после добавления
          setTimeout(applyBGItemChanges);
          return true;
        }

        default:
          return false;
      }
    },
    doubleHandler: (event) => {
      switch (state.editableMode) {
        case 'backgrounds': {
          const isItemClick = isAnyBGITem(event);
          if (isItemClick) return;

          if (state.selectedBGItems.size) resetBGItemsSelecting();
          else selectAllBGItems();

          break;
        }

        default:
          break;
      }
    },
  });

  // Инициализация: добавляем слушатель клавиатуры
  document.addEventListener('keydown', onKeyDown);

  const onAppMove = (event: FederatedPointerEvent) => {
    if (state.editableMode !== 'backgrounds' || state.moved || state.addingBGItem || state.addingPoint) return;

    const { clientX: x, clientY: y } = event.data.originalEvent as PointerEvent;

    onMove({ x, y });
  };

  app.stage.on('pointerup', onAppPointerUp);
  app.stage.on('pointermove', onAppMove);

  const destroyBackgroundItemsManager = () => {
    app.stage.off('pointerup', onAppPointerUp);
    app.stage.off('pointermove', onAppMove);
    document.removeEventListener('keydown', onKeyDown);
    unmountAddingBGItem();
  };

  return {
    destroyBackgroundItemsManager,
    backgroundItemsMap,
    backgroundContainer,
    updateBGITems,
    resetBGItemsSelecting,
    selectAllBGItems,
    selectBGItemsBySpace,
    onMoveAddingBGItem,
    unmountAddingBGItem,
    mountAddingBGItem,
    onUpZIndex,
    onUpZIndexActive,
    onDownZIndex,
    onDownZIndexActive,
  };
};
