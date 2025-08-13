'use client';
import clsx from 'clsx';
import s from './TagText.module.scss';
import { TagOrigin, TagOriginProps } from '../TagOrigin/TagOrigin';

export type TagTextProps = {
  text: string;
  ref?: React.Ref<HTMLElement>;
} & TagOriginProps;

export const TagText = ({ text, className, children, ...props }: TagTextProps) => {
  return (
    <TagOrigin {...props} className={clsx(s.root, className)}>
      {text}
      {children}
    </TagOrigin>
  );
};
