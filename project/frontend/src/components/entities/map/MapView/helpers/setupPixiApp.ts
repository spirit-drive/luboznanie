import * as PIXI from 'pixi.js';
import * as React from 'react';

/**
 * Инициализирует PIXI Application и главный контейнер.
 */
export const setupPixiApp = async (
  container: HTMLElement,
  appRef: React.MutableRefObject<PIXI.Application | null>,
): Promise<{ app: PIXI.Application; world: PIXI.Container }> => {
  const app = new PIXI.Application();
  await app.init({
    resizeTo: container,
    autoDensity: true,
    backgroundColor: '#ccc',
    resolution: window.devicePixelRatio || 1,
  });
  appRef.current = app;
  container.appendChild(app.canvas);

  const world = new PIXI.Container();
  app.stage.addChild(world);
  return { app, world };
};
