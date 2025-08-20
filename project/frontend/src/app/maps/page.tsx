'use client';

import s from './page.module.scss';
import { MapView } from '@/components/entities/map/MapView/MapView';
import { Point } from '@/types/entities/point/point.types';
import { BackgroundItem } from '@/types/entities/map/map.types';
import { useEffect, useState } from 'react';

const onPointClick = () => {};

export const items: Point[] = [
  // 1. Начальная точка - лекция
  {
    id: 'point-1',
    name: 'Введение в курс',
    position: { x: 100, y: 100 },
    entity: { id: 'article-101', type: 'article' },
    required: true,
    color: '#ff8f00',
    progress: 87,
    locked: true,
    bookmarked: true,
    success: true, // Эта точка уже пройдена
    connections: [
      { id: 'conn-1-2', pointId: 'point-2' },
      { id: 'conn-1-3', pointId: 'point-3', color: '#ff8f00', width: 5 }, // Яркое соединение
    ],
  },
  // 2. Практика после введения
  {
    id: 'point-2',
    name: 'React как экосистема Современного приложения',
    position: { x: 300, y: 200 },
    entity: { id: 'practice-201', type: 'practice' },
    progress: 50, // В процессе выполнения
    connections: [{ id: 'conn-2-4', pointId: 'point-4' }],
  },
  // 3. Дополнительная лекция
  {
    id: 'point-3',
    name: 'Углубленная тема',
    position: { x: 300, y: 400 },
    entity: { id: 'article-102', type: 'article' },
    locked: false, // Доступна
    success: true, // Эта точка уже пройдена
    connections: [{ id: 'conn-3-4', pointId: 'point-4' }],
  },
  // 4. Точка слияния - карта
  {
    id: 'point-4',
    name: 'Промежуточная карта',
    position: { x: 500, y: 300 },
    entity: { id: 'map-301', type: 'map' },
    locked: true, // Заблокирована, пока предыдущие не пройдены
    connections: [
      { id: 'conn-4-5', pointId: 'point-5' },
      { id: 'conn-4-6', pointId: 'point-6' },
    ],
  },
  // 5. Опциональная практика
  {
    id: 'point-5',
    name: 'Практика (Hard)',
    position: { x: 700, y: 200 },
    entity: { id: 'practice-202', type: 'practice' },
    required: false, // Необязательная
    locked: true,
    connections: [{ id: 'conn-5-7', pointId: 'point-7' }],
  },
  // 6. Основная ветка
  {
    id: 'point-6',
    name: 'Основная лекция',
    position: { x: 700, y: 400 },
    entity: { id: 'article-103', type: 'article' },
    locked: true,
    connections: [{ id: 'conn-6-7', pointId: 'point-7' }],
  },
  // 7. Финальная точка слияния
  {
    id: 'point-7',
    name: 'Финальный проект',
    progress: 33,
    position: { x: 900, y: 300 },
    entity: { id: 'practice-203', type: 'practice' },
    locked: true,
    connections: [
      // Соединение ведет к несуществующей точке для теста
      { id: 'conn-7-99', pointId: 'point-99' },
    ],
  },
  // 8. Изолированная точка
  {
    id: 'point-8',
    name: 'Бонусный материал',
    position: { x: 100, y: 550 },
    entity: { id: 'article-104', type: 'article' },
    connections: [], // Нет исходящих соединений
  },
  // 9. Точка, ведущая к изолированной
  {
    id: 'point-9',
    name: 'Секретный путь',
    position: { x: 300, y: 550 },
    entity: { id: 'map-302', type: 'map' },
    connections: [{ id: 'conn-9-8', pointId: 'point-8', width: 1, color: '#888888' }],
  },
  // 10. Точка, ссылающаяся сама на себя
  {
    id: 'point-10',
    name: 'Бесконечный цикл',
    position: { x: 500, y: 100 },
    entity: { id: 'practice-204', type: 'practice' },
    connections: [{ id: 'conn-10-10', pointId: 'point-10', color: '#ff4081' }],
  },
];

export const backgroundItems: BackgroundItem[] = [
  // Простой элемент, без зависимостей
  {
    id: 'item1',
    type: 'map-set-3/0',
    x: 100,
    y: 150,
  },
  // Элемент, который изначально скрыт и имеет звук
  {
    id: 'item2',
    type: 'castles-3/3',
    x: 100,
    y: 300,
    hidden: false,
    sound: true,
  },
  // Элемент с одной зависимостью
  {
    id: 'item3',
    type: 'map-set-1/2',
    x: 400,
    y: 300,
    deps: [
      {
        id: 'dep1',
        conditions: [
          {
            _id: 'cond1',
            points: {
              ids: ['point1'],
              success: true,
            },
            gamer: {
              experience: 50,
            },
          },
        ],
        newValue: {
          x: 450,
          y: 350,
          hidden: false, // Элемент станет видимым
          sound: true,
        },
      },
    ],
  },
  // Элемент с несколькими зависимостями (условие ИЛИ)
  {
    id: 'item4',
    type: 'map-set-1/3',
    x: 500,
    y: 400,
    deps: [
      // Условие 1: Срабатывает, если у "point2" `hidden: true` и у игрока 100+ монет
      {
        id: 'dep2',
        conditions: [
          {
            _id: 'cond2-1',
            points: {
              ids: ['point2'],
              hidden: true,
            },
            gamer: {
              coins: 100,
            },
          },
        ],
        newValue: {
          x: 520,
          y: 420,
          type: 'image/4',
        },
      },
      // Условие 2: Срабатывает, если у "point3" `progress: 100`
      {
        id: 'dep3',
        conditions: [
          {
            _id: 'cond2-2',
            points: {
              ids: ['point3'],
              progress: 100,
            },
          },
        ],
        newValue: {
          hidden: true, // Элемент скроется
        },
      },
    ],
  },
  // Элемент с зависимостью, которую можно отменить
  {
    id: 'item5',
    type: 'map-set-1/5',
    x: 600,
    y: 500,
    deps: [
      {
        id: 'dep4',
        conditions: [
          {
            _id: 'cond3',
            points: {
              ids: ['point4'],
              locked: true,
            },
            gamer: {
              awardIds: ['award_level1'],
            },
            cancelable: true, // Изменения отменятся, если условия перестанут выполняться
          },
        ],
        newValue: {
          x: 650,
          y: 550,
          type: 'image/6',
        },
      },
    ],
  },
];

export default function Page() {
  const [points, setPoints] = useState(items);

  return (
    <div className={s.page} style={{ height: 700 }}>
      <MapView
        width={1000}
        height={1000}
        backgroundItems={backgroundItems}
        points={points}
        onChangePoints={setPoints}
        onPointClick={onPointClick}
      />
    </div>
  );
}
