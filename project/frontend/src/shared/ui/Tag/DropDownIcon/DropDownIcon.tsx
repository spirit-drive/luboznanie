'use client';
import { useRef, useState } from 'react';

import { type InputRef, type MenuProps } from 'antd';
import s from './DropDownIcon.module.scss';
import { useTagsData } from '../Tag.utils/useTagData';
import { useFilteredTags } from '../Tag.utils/useFilteredTags';
import { SearchMenuItem } from '../SearchMenuItem/SearchMenuItem';
import { getMenuProps, handleOpenChange, handleTagRemove } from '../Tag.utils/DropDownIcon.utils';

import { Icon } from '../../Icon/Icon';
import { SelectedTagsList } from '../SelectedTagsList.tsx/SelectedTagsList';
import { DropDown } from '../../antd/Dropdown/DropDown';

export const DropDownIcon = ({ iconName }: { iconName: string }) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTagsKeys, setSelectedTagsKeys] = useState<string[]>([]);
  const searchRef = useRef<InputRef>(null);

  const { data, error } = useTagsData('/data/dataTags.json');

  const filteredTags = useFilteredTags({
    data,
    searchText,
    selectedTagsKeys,
  });

  const menuItems: MenuProps['items'] = [
    {
      key: 'search-header',
      className: s.noHover,
      label: <SearchMenuItem value={searchText} onChange={setSearchText} inputRef={searchRef} />,
      style: {
        cursor: 'text',
        pointerEvents: 'auto',
        padding: 4,
      },
    },
    ...filteredTags.map((item) => ({
      key: item.key,
      label: <div style={{ textAlign: 'center', fontSize: '12px' }}>{item.label}</div>,
      disabled: item.disabled,
    })),
  ];

  const menu = getMenuProps(menuItems, setSelectedTagsKeys, setMenuOpened);

  if (error) return <div>{error}</div>;
  if (!data) return null;

  return (
    <div className={s.root}>
      <DropDown
        menuProps={menu}
        open={menuOpened}
        onOpenChange={handleOpenChange(setMenuOpened, setSearchText, searchRef)}
      >
        <Icon name={iconName} />
      </DropDown>
      <SelectedTagsList data={data} selectedKeys={selectedTagsKeys} onRemove={handleTagRemove(setSelectedTagsKeys)} />
    </div>
  );
};
