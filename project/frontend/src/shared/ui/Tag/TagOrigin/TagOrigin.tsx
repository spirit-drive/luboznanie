'use client';
import clsx from 'clsx';
import type { ElementType, ReactNode, ComponentPropsWithoutRef } from 'react';
import s from './TagOrigin.module.scss';

export type TagOriginProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<T>;

export const TagOrigin = <T extends ElementType = 'span'>({ as, className, children, ...props }: TagOriginProps<T>) => {
  const Component = as || 'span';
  return (
    <Component className={clsx(s.root, className)} {...props}>
      {children}
    </Component>
  );
};
