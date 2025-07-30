'use client';
import { ElementType, FormEvent, useEffect, useRef } from 'react';
import clsx from 'clsx';
import s from './EditableText.module.scss';
import DOMPurify from 'dompurify';

type EditableTextProps = {
  as?: ElementType;
  className?: string;
  value: string;
  onChange: (value: string) => void;
};

export const EditableText = ({ as: Component = 'div', className = '', value, onChange }: EditableTextProps) => {
  const rootRef = useRef<HTMLElement>(null);

  const handleInput = (e: FormEvent<HTMLElement>): void => {
    const target = e.target as HTMLElement;
    const clean = DOMPurify.sanitize(target.innerText);
    onChange(clean);
  };

  useEffect(() => {
    if (rootRef.current && value !== rootRef.current.innerHTML) {
      rootRef.current.innerHTML = value;
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
