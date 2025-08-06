import clsx from 'clsx';
import { ButtonProps } from './types';

export const Button = ({className, children}: ButtonProps) => {
  return <button className={clsx(s.root, className)}>{children}</button>;
};
