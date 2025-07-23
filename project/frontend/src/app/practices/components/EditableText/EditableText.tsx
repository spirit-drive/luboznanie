'use client';
import { ElementType, useEffect, useRef, useState } from 'react';
import s from './EditableText.module.scss';
import DOMPurify from 'dompurify';

type EditableTextProps = {
  as?: ElementType;
  className?: string;
};

export const EditableText = ({ as: Tag = 'div', className = '' }: EditableTextProps) => {
  const [cleanText, setCleanText] = useState<string>('');
  const editableRef = useRef<HTMLElement>(null);

  const handleInput = (): void => {
    if (!editableRef.current) return;
    const dirty = editableRef.current.innerHTML;
    const clean = DOMPurify.sanitize(dirty);
    setCleanText(clean);
  };

  useEffect(() => {
    if (editableRef.current && cleanText !== editableRef.current.innerHTML) {
      editableRef.current.innerHTML = cleanText;
    }
  }, [cleanText]);

  return (
    <Tag
      className={`${s.editable} ${className}`}
      ref={editableRef}
      contentEditable
      suppressContentEditableWarning={true}
      onInput={handleInput}
    />
  );
};
