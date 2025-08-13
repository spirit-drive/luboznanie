"use client";
import clsx from "clsx";
import s from "./Icon.module.scss";
import { IconProps } from "./Icon.types";

export const Icon = ({ name, className, svgProps, ...props }: IconProps) => {
  return (
    <i className={clsx(s.root, className)} {...props}>
      <svg className={s.icon_svg} aria-hidden="true" focusable="false" {...svgProps}>
        <use href={`/icons/sprite.svg#${name}`} />
      </svg>
    </i>
  );
};

