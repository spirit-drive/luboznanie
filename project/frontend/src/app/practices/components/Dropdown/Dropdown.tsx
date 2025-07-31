'use client';
import clsx from 'clsx';
import s from './Dropdown.module.scss';
import { Dropdown as AntDropdown, ConfigProvider } from 'antd';
import { ReactNode, useState } from 'react';

export type ItemsProps = {
  key: string;
  label: ReactNode;
};

export const items: ItemsProps[] = [
  {
    key: '1',
    label: <span>1.36</span>,
  },
  {
    key: '2',
    label: <span>1.37</span>,
  },
  {
    key: '3',
    label: <span>1.38</span>,
  },
];

export type DropdownProps = {
  items?: ItemsProps[];
  placement?: 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight';
  className?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
};

export const Dropdown = ({
  items = [],
  className,
  placement = 'bottomLeft',
  fontFamily = "'Montserrat-Regular', sans-serif",
  fontSize = 12,
}: DropdownProps) => {
  const [selectedItem, setSelectedItem] = useState<ReactNode>(items?.[0]?.label ?? 'Ошибка');

  const handleMenuSelect = ({ key }: { key: string }) => {
    const selected = items.find((item) => item.key === key)?.label;
    if (selected) {
      setSelectedItem(selected);
    }
  };
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: fontFamily,
          fontSize: fontSize,
        },
      }}
    >
      <AntDropdown
        className={clsx(s.root, className)}
        menu={{ items, onClick: handleMenuSelect }}
        placement={placement}
      >
        <button className={s.button}>{selectedItem}</button>
      </AntDropdown>
    </ConfigProvider>
  );
};
