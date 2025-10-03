import * as PIXI from 'pixi.js';
import { BGItemVisuals, PointsManagerOptions } from '@/components/entities/map/MapView/MapView.types';
import { PointsAndBackgroundsManagerState } from '@/components/entities/map/MapView/helpers/types';
import { ContainerChild } from 'pixi.js/lib/scene/container/Container';
import { BackgroundItem, MapBackgroundItem } from '@/types/entities/map/map.types';
import { createBGItemVisual } from '@/components/entities/map/MapView/helpers/createBGItemVisual';
import { deepCopy } from '@/utils/deepCopy';
import { createSingleDoubleAction } from '@/utils/createSingleDoubleAction';

export const createBackgroundItemsManager = ({
  app,
  world,
  options,
  state,
}: {
  state: PointsAndBackgroundsManagerState;
  app: PIXI.Application;
  world: PIXI.Container<ContainerChild>;
  options: PointsManagerOptions;
}) => {
  const { backgroundItems, backgroundAssets, onChangeBGItems } = options;

  const backgroundContainer = new PIXI.Container();
  const backgroundItemsMap = new Map<string, MapBackgroundItem>();
  const canvasesMap = new Map<string, PIXI.ICanvas>();

  // const onMoveAddingBGItem = (event: PIXI.FederatedPointerEvent) => {
  //   if (state.addingBGItem) {
  //     state.addingBGItem.container.visible = state.addingBGItemVisible;
  //     const localPosition = world.toLocal(event.global);
  //     state.addingBGItem.container.position.copyFrom(localPosition);
  //   }
  // };
  //
  // const unmountAddingBGItem = () => {
  //   if (state.addingBGItem) {
  //     backgroundContainer.removeChild(state.addingBGItem.container);
  //     state.addingBGItem.container.destroy({ children: true });
  //     state.addingBGItem = null;
  //   }
  //   app.stage.off('pointermove', onMoveAddingBGItem);
  // };
  //
  // const mountAddingBGItem = (mode: MapEditableMode, addingBGTtem: AddingBGITem) => {
  //   state.addingBGItem = createAddingBGItem({ x: 0, y: 0 }, addingBGTtem, options); // Начальная позиция
  //   backgroundContainer.addChild(state.addingBGItem.container);
  //   app.stage.on('pointermove', onMoveAddingBGItem);
  // };

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
      visual.container.position.x += deltaX;
      visual.container.position.y += deltaY;
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
    alwaysHandler: (_, bgItem: BackgroundItem) => {
      options.onBGItemClick?.(bgItem);

      return false;
    },
    singleHandler: (event, bgItem: BackgroundItem) => {
      if (state.moved) {
        state.moved = false;
        return;
      }

      if (state.editableMode !== 'backgrounds') return;

      const visual = state.renderedBGItems.get(bgItem.id);
      if (!visual) return;

      if (state.selectedBGItems.has(bgItem.id)) unselectBGItems([visual]);
      else selectBGItems([visual]);
    },
    doubleHandler: (event, bgItem: BackgroundItem) => {
      if (state.editableMode !== 'backgrounds') return;

      const visual = state.renderedBGItems.get(bgItem.id);
      if (!visual) return;

      // const neighbors = getAllNearby(bgItem, state.renderedBGItems);
      // if (state.selectedBGItems.has(bgItem.id)) unselectBGItems([...neighbors, visual]);
      // else selectBGItems([...neighbors, visual]);
    },
  });

  // const resetBGItemsSelecting = () => {
  //   unselectBGItems(Array.from(state.selectedBGItems.values()));
  //   state.selectedBGItems.clear();
  // };
  //
  // const selectAllBGItems = () => {
  //   selectBGItems(Array.from(state.renderedBGItems.values()));
  //   state.selectedBGItems = new Map(state.renderedBGItems);
  // };

  // const selectBGItemsBySpace: OnSelectedSpace = (space, phase, event) => {
  //   if (phase === 'end') {
  //     const pointsInSpace = Array.from(state.renderedBGItems.entries()).filter(([, point]) => {
  //       const { x, y } = point.container.position;
  //       return x >= space.minX && x <= space.maxX && y >= space.minY && y <= space.maxY;
  //     });
  //
  //     if (shouldUnselectByRect!(event)) {
  //       pointsInSpace.forEach(([id, point]) => {
  //         point.setActive(false);
  //         state.selectedBGItems.delete(id);
  //       });
  //     } else {
  //       pointsInSpace.forEach(([id, point]) => {
  //         point.setActive(true);
  //         state.selectedBGItems.set(id, point);
  //       });
  //     }
  //   }
  // };

  const updateBGITems = (backgroundItems: BackgroundItem[] | undefined) => {
    if (!backgroundItems) return;
    let items: BGItemVisuals[] = [];

    const currentIds = new Set(state.renderedBGItems.keys());
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
              onBGItemClick(event, bgItem);
            },
            onBGItemDown: (bgItem, event) => {
              onPointerDown(bgItemVisual, event);
            },
            onBGItemOut: () => {
              canvasesMap.clear();
            },
            onBGItemMove: (bgItem, event) => {
              if (state.editableMode !== 'backgrounds' || state.moved) return;
              let foundHover = false;
              items.forEach((_item) => {
                if (foundHover) {
                  _item.setIsHover(false);
                  return;
                }
                const { clientX: x, clientY: y } = event.data.originalEvent as PointerEvent;
                const rect = _item.container.getBounds();
                if (x < rect.minX || x > rect.maxX) return;
                if (y < rect.minY || y > rect.maxY) return;

                const canvas = canvasesMap.get(_item.bgItem.id) || app.renderer.extract.canvas(_item.container);
                if (!canvas) return;

                canvasesMap.set(_item.bgItem.id, canvas);
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;

                const pixelData = ctx.getImageData((x - rect.x) / world.scale.x, (y - rect.y) / world.scale.y, 1, 1);
                const isHovered = pixelData.data[3] !== 0;
                _item.setIsHover(isHovered);
                if (isHovered) {
                  foundHover = true;
                }
              });
            },
          });
          backgroundItemsMap.set(item.id, { container: bgItemVisual.container, backgroundItem: item });
          bgItemVisual.setEditableMode(state.editableMode);
          state.renderedBGItems.set(item.id, bgItemVisual);
          backgroundContainer.addChild(bgItemVisual.container);
        } catch (e) {
          console.warn(e);
        }
      }
    }

    items = [...state.renderedBGItems.values()].reverse();
  };

  updateBGITems(backgroundItems);

  world.addChild(backgroundContainer);

  const destroyBackgroundItemsManager = () => {};

  return {
    destroyBackgroundItemsManager,
    backgroundItemsMap,
    backgroundContainer,
    updateBGITems,
  };
};
