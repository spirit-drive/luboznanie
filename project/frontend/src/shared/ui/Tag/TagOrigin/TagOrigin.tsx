'use client';
import clsx from 'clsx';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import s from './TagOrigin.module.scss';

export type TagOriginProps<T extends ElementType = 'span'> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

export const TagOrigin = ({ as: Component = 'span', className, children, ...props }: TagOriginProps) => {
  return (
    <Component className={clsx(s.root, className)} {...props}>
      {children}
    </Component>
  );
};
