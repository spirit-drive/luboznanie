"use client";
import clsx from "clsx";
import s from "./TagWithIcon.module.scss";
import { useRef } from "react";
import { TagText } from "../TagText/TagText";
import { Icon } from "../../Icon/Icon";

export type TagWithIconProps = {
  text: string;
  iconName: string;
  classNameText?: string;
  classNameSvg?: string;
};

export const TagWithIcon = ({ text, iconName, classNameText, classNameSvg }: TagWithIconProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const iconRef = useRef<HTMLElement>(null);

  const handleToggleClass = () => {
    rootRef.current?.classList.toggle(s.active);
    iconRef.current?.classList.toggle(s.icon_visible);
  };

  const handleDelete = () => {
    rootRef.current?.classList.toggle(s.root_removing);
  };

  return (
    <TagText ref={rootRef} text={text} className={clsx(s.root, classNameText)} onClick={handleToggleClass}>
      <Icon ref={iconRef} name={iconName} className={clsx(s.icon, classNameSvg)} onClick={handleDelete}/>
    </TagText>
  );
};