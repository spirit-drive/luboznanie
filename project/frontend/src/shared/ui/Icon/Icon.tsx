'use client';

import s from './Icon.module.scss';
import clsx from 'clsx';

export type IconProps = React.SVGProps<SVGSVGElement> & {
  name: string;
  className?: string;
};

export const Icon = ({ name, className, ...props }: IconProps) => {
  return (
    <i className={clsx(s.root, className)}>
      <svg aria-hidden="true" focusable="false" {...props}>
        <use href={`/icons/sprite.svg#${name}`} />
      </svg>
    </i>
  );
};
