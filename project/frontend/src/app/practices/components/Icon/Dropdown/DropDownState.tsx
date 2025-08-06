import { ReactNode, useState } from 'react';
import { DropDownStateProps } from './types';
import { ConfigProvider } from './ConfigProvider';
import { DropDown } from './DropDown';
import { Button } from './Button';

export const DropDownState = ({ items, onClick, theme, placement }: DropDownStateProps) => {
  const [selectedItem, setSelectedItem] = useState<ReactNode>(items?.[0]?.label ?? 'Ошибка');

  return (
    <ConfigProvider theme={theme}>
      <DropDown items={items} onClick={onClick}>
        <Button>{selectedItem}</Button>
      </DropDown>
    </ConfigProvider>
  );
};
