'use client';
import { Icon } from '../../Icon/Icon';
import s from './SingleTag.module.scss';
import clsx from 'clsx';
import { SingleTagProps } from '../Tag.types';
import { useEffect, useRef, useState } from 'react';

export const SingleTag = ({ tag, className, onRemove }: SingleTagProps) => {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [showDeleteIcon, setShowDeleteIcon] = useState<boolean>(false);
  const canRemoveTag: boolean = !tag.isDefault && !tag.nonDelatable;

  useEffect(() => {
    const handleClickOutsideRootRef = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setShowDeleteIcon(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideRootRef);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideRootRef);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (canRemoveTag) {
      setShowDeleteIcon((prev) => !prev);
    }
  };

  const handleDeleteIconClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag.id.toString());
    }
  };

  return (
    <span
      ref={rootRef}
      className={clsx(s.root, className, {
        [s.withIcon]: showDeleteIcon && canRemoveTag,
      })}
      onClick={handleClick}
    >
      {tag.text}
      {canRemoveTag && showDeleteIcon && (
        <span className={s.icon_wrap} onClick={handleDeleteIconClick}>
          <Icon className={s.icon} name="delete" />
        </span>
      )}
    </span>
  );
};
