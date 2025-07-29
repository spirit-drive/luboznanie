'use client';
import s from './Icon.module.scss';

export type IconProps = React.SVGProps<SVGSVGElement> & {
  name: string;
  className?: string;
  size?: number;
};

export const Icon = ({ name, ...props }: IconProps) => {
  return (
    <i className={s.i}>
      <svg className={s.icon_svg} aria-hidden="true" focusable="false" {...props}>
        <use href={`/icons/sprite.svg#${name}`} />
      </svg>
    </i>
  );
};
