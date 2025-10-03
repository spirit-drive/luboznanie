import { Container } from 'pixi.js';

export type MapBackground = {
  image?: string;
};

export type LoadedAsset = PIXI.Texture | PIXI.Spritesheet;

export type BackgroundItemBase = {
  position: {
    x: number;
    y: number;
  };
  hidden?: boolean;
  sound?: boolean;
};

export type BackgroundItemDepCondition = {
  // Служебный id
  _id: string;
  // Зависимость от свойств поинтов
  points: {
    // Все перечисленные id должны обладать следующими свойствами
    ids: string[];
    hidden?: boolean;
    success?: boolean;
    locked?: boolean;

    progress?: number;
  };
  // Зависимость от прогресса игрока
  gamer: {
    coins?: number;
    experience?: number;
    awardIds?: string[];
  };
  // Откатывать изменения, если условия больше не выполняются
  cancelable?: boolean;
};

export type BackgroundItemDep = {
  id: string;
  conditions: BackgroundItemDepCondition[]; // Условия в одном обекте - это условия И, в разных ИЛИ
  newValue: BackgroundItemBase;
};

export type BackgroundItem = BackgroundItemBase & {
  id: string;
  // @params type - это строка вида image/id где image - это название спрайта, а id - это номер конкретного изображения
  type: string;
  deps?: BackgroundItemDep[];
};

export type AddingBackgroundType = Omit<BackgroundItem, 'x' | 'y'>;

export type MapBackgroundItem = { container: Container; backgroundItem: BackgroundItem };
export type MapVisibleBackgroundItem = MapBackgroundItem & { visibleSpace: number };
