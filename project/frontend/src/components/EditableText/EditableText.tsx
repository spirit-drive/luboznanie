'use client';
import clsx from 'clsx';
import s from './EditableText.module.scss';
import type { EditableTextProps } from './EditableText.types';
import { useEffect, useRef } from 'react';
import { sanitizeFn } from '../../utils/sanitizeFn';
import type { FormEvent } from 'react';

export const EditableText = ({ as: Component = 'div', className, value, onChange, ...props }: EditableTextProps) => {
  const rootRef = useRef<HTMLElement>(null);

  const handleInput = (e: FormEvent): void => {
    const target = e.target as HTMLElement;
    const clean = sanitizeFn(target.innerText);
    onChange(clean);
  };

  useEffect(() => {
    if (rootRef.current && value !== rootRef.current.innerText) {
      rootRef.current.innerText = value;
    }
  }, [value]);

  return (
    <Component
      {...props}
      className={clsx(s.root, className)}
      ref={rootRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
    />
  );
};
