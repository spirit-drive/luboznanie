'use client';
import clsx from 'clsx';
import s from './EditableText.module.scss';
import type { EditableTextProps } from './EditableText.types';
import { useEffect, useRef } from 'react';
import { handleInputEditableTextProps } from './handleInputEditableText.types';
import DOMPurify from 'dompurify';

export const EditableText = ({ as: Component = 'div', className = '', value }: EditableTextProps) => {
  const rootRef = useRef<HTMLElement>(null);

  const sanitizeFn = (dirty: string): string => {
    return DOMPurify.sanitize(dirty);
  };

  const handleInput = ({ e, onChange }: handleInputEditableTextProps): void => {
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
      className={clsx(s.root, className)}
      ref={rootRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
    />
  );
};
