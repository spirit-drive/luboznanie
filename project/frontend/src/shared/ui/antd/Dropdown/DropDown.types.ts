import { DropdownProps, MenuProps } from 'antd';
import { ReactNode } from 'react';

export type DropDownProps = {
  items: MenuProps['items'];
  className?: string;
  placement?: DropdownProps['placement'];
  onClick: MenuProps['onClick'];
  children: ReactNode;
};
