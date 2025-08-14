import type { Dispatch, ElementType, HTMLAttributes, ReactNode, SetStateAction } from 'react';

export type EditableTextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  className?: string;
  value: string;
  onSetChange: (value: string) => void;
};
