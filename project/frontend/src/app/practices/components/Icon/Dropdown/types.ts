import { DropdownProps, MenuProps } from 'antd';
import { ReactNode } from 'react';
import { ConfigProviderProps as AntConfigProviderProps} from 'antd';

export type DropDownProps = {
  items: MenuProps['items'];
  className?: string;
  placement?: DropdownProps['placement'];
  onClick: MenuProps['onClick'];
  children: ReactNode;
};

export type ConfigProviderProps = {
  children: ReactNode;
  theme: AntConfigProviderProps['theme'];
};

export type ButtonProps = {
  children: ReactNode;
  className?: string;
}

export type MenuItem  = {
  key: string;
  label: ReactNode;
}

export type DropDownStateProps = {
 items: MenuItem[];
 onClick?: MenuProps['onClick'];
 theme: AntConfigProviderProps['theme'];
 placement?: DropdownProps['placement'];
}