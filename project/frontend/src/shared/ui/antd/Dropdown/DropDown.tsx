import clsx from 'clsx';
import s from './DropDown.module.scss';
import { Dropdown as AntDropdown } from 'antd';
import { DropDownProps } from './DropDown.types';

export const DropDown = ({ items, className, placement = 'bottomLeft', onClick, children }: DropDownProps) => {
  return (
    <AntDropdown className={clsx(s.root, className)} menu={{ items, onClick }} placement={placement}>
      {children}
    </AntDropdown>
  );
};
