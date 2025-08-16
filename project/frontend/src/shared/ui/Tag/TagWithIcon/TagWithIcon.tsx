'use client';
import clsx from 'clsx';
import s from './TagWithIcon.module.scss';
import { useRef } from 'react';
import { TagText } from '../TagText/TagText';
import { Icon } from '../../Icon/Icon';

export type TagWithIconProps = {
  text: string;
  showDeleteIcon: boolean;
  iconName: string;
  classNameText?: string;
  classNameSvg?: string;
  onDelete?: (value: string) => void;
  onClick?: (event: MouseEvent) => void;
} ;

export const TagWithIcon = ({
  text,
  showDeleteIcon,
  iconName,
  classNameText,
  classNameSvg,
  onDelete,
}: TagWithIconProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const iconRef = useRef<HTMLElement>(null);

  const handleToggleClass = () => {
    if (!showDeleteIcon) return;
    rootRef.current?.classList.toggle(s.active);
    iconRef.current?.classList.toggle(s.icon_visible);
  };

  const handleDelete = () => {
    rootRef.current?.classList.toggle(s.root_removing);
    onDelete?.(text);
  };

  return (
    <TagText ref={rootRef} text={text} className={clsx(s.root, classNameText)} onClick={handleToggleClass}>
      {showDeleteIcon && (
        <Icon ref={iconRef} name={iconName} className={clsx(s.icon, classNameSvg)} onClick={handleDelete} />
      )}
    </TagText>
  );
};
