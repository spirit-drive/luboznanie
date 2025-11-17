import React, { forwardRef } from 'react';
import cn from 'clsx';
import src from './mountains.webp';
import { Img, ImgProps } from '../Img';
import s from './MapSetMountains2Icon.sass';

export type MapSetMountains1IconProps = ImgProps & {
  className?: string;
  width?: number;
  height?: number;
  number?: number;
};

const COUNT_ELEMENTS = 14;
const K = COUNT_ELEMENTS - 1;
const SIZE = 320;
const SIZE_K = 1;
const WIDTH = SIZE * SIZE_K;

export const MapSetMountains2Icon = forwardRef<HTMLImageElement, MapSetMountains1IconProps>(
  ({ className, number = 1, style = {}, width = WIDTH, height = SIZE, ...props }, ref) => (
    <Img
      {...props}
      ref={ref}
      data-number={number}
      data-total={COUNT_ELEMENTS}
      style={{ ...style, objectPosition: `calc(100% / ${K} * ${number - 1})` }}
      src={src}
      className={cn(s.root, className)}
      width={width}
      height={height}
    />
  )
);

MapSetMountains2Icon.displayName = 'MapSetMountains2Icon';
