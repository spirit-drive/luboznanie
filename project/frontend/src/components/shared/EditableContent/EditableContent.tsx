import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import s from './EditableContent.module.scss';

export type EditableContenttProps = {
  className?: string;
  as?: React.ElementType;
  value: string;
  onChange: (value: string) => void;
};

export const EditableContent = ({ className, onChange, value, as: Comp = 'div' }: EditableContenttProps) => {
  const root = useRef(null as HTMLElement);

  useEffect(() => {
    root.current.textContent = value;
  }, [value]);

  return (
    <Comp
      ref={root}
      className={clsx(s.root, className)}
      onChange={(e: React.ChangeEvent) => {
        onChange(e.target.textContent);
      }}
      contentEditable
    />
  );
};
