'use client';
import clsx from 'clsx';
import s from './Icon.module.scss';

export type IconProps = React.HTMLAttributes<HTMLElement> & {
  name: string;
  className?: string;
  size?: number;
  svgProps?: React.SVGAttributes<SVGElement>;
  ref?: React.Ref<HTMLElement>;
};

export const Icon = ({ name, className, svgProps, ...props }: IconProps) => {
  return (
    <i className={clsx(s.root, className)} {...props}>
      <svg className={s.icon_svg} aria-hidden="true" focusable="false" {...svgProps}>
        <use href={`/icons/sprite.svg#${name}`} />
      </svg>
    </i>
  );
};
