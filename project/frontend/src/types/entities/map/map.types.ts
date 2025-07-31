import { TextureSource } from 'pixi.js/lib/rendering/renderers/shared/texture/sources/TextureSource';
import { Rectangle } from 'pixi.js';

export type MapBackground = {
  image?: string;
};

export type LoadedSvg = {
  source: TextureSource;
  frame: Rectangle;
};
