import type { InputRef, MenuProps } from 'antd';
import type { Dispatch, SetStateAction } from 'react';

export const handleMenuClick =
  (
    setSelectedTagsKeys: Dispatch<SetStateAction<string[]>>,
    setMenuOpened: Dispatch<SetStateAction<boolean>>,
  ): MenuProps['onClick'] =>
  ({ key }: { key: string }) => {
    if (!key.startsWith('search')) {
      setSelectedTagsKeys((prev) => [...prev, key]);
      setMenuOpened(false);
    }
  };

export const handleTagRemove =
  (setSelectedTagsKeys: Dispatch<SetStateAction<string[]>>): ((keyToRemove: string) => void) =>
  (keyToRemove: string) => {
    setSelectedTagsKeys((prev) => prev.filter((key) => key !== keyToRemove));
  };

export const handleOpenChange =
  (
    setMenuOpened: Dispatch<SetStateAction<boolean>>,
    setSearchText: Dispatch<SetStateAction<string>>,
    searchRef: React.RefObject<InputRef | null>,
  ): ((visible: boolean) => void) =>
  (visible: boolean) => {
    setMenuOpened(visible);
    if (!visible) {
      setSearchText('');
    } else {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    }
  };

export const getMenuProps = (
  menuItems: MenuProps['items'],
  setSelectedTagsKeys: Dispatch<SetStateAction<string[]>>,
  setMenuOpened: Dispatch<SetStateAction<boolean>>,
): MenuProps => ({
  items: menuItems,
  onClick: handleMenuClick(setSelectedTagsKeys, setMenuOpened), // Без проверки nonDeletable
  style: {
    maxHeight: 160,
    overflow: 'auto',
    width: 100,
    padding: 4,
    fontSize: '14px',
  },
  onMouseDown: (e) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
    }
  },
});
