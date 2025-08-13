import type { ElementType, ReactNode } from 'react';

export type EditableTextProps = {
  as?: ElementType;
  className?: string;
  value: string;
  onChange: (value: string) => void;
};
