import type { DropdownProps as AntDropdownProps, MenuProps } from 'antd';

export type DropDownProps =AntDropdownProps & {
  menuProps: MenuProps;
};