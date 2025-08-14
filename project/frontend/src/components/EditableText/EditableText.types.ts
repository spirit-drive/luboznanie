import type { ElementType, HTMLAttributes } from 'react';

export type EditableTextProps = Omit<HTMLAttributes<HTMLElement>, 'onChange'> & {
  as?: ElementType;
  className?: string;
  value: string;
  onChange: (value: string) => void;
};
