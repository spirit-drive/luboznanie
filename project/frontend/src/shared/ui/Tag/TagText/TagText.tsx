'use client';
import clsx from 'clsx';
import s from './TagText.module.scss';
import { TagOrigin, TagOriginProps } from '../TagOrigin/TagOrigin';
import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type BaseTagTextProps = {
  text: string;
  children?: ReactNode;
  ref?: React.Ref<HTMLElement>;
};

export type TagTextProps<T extends ElementType = 'span'> = BaseTagTextProps & Omit<TagOriginProps<T>, 'children'>;

export function TagText<T extends ElementType = 'span'>({ text, className, children, ...props }: TagTextProps<T>) {
  return (
    <TagOrigin<T> {...(props as ComponentPropsWithoutRef<T>)} className={clsx(s.root, className)}>
      {text}
      {children}
    </TagOrigin>
  );
}
