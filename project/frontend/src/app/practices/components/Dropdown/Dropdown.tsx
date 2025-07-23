'use client';
import '@ant-design/v5-patch-for-react-19';
import { Select } from 'antd';
import s from './Dropdown.module.scss';
import { useState, useEffect } from 'react';

export type DropDownMenuItem = {
  label: React.ReactNode;
  key: string;
  value: string;
  text: string;
};

export type DropDownMenuItemProps = {
  items?: DropDownMenuItem[];
  className?: string;
  onSearch?: (textSearch: string) => void;
};

export type responseVersions = {
  label: string;
  key: string;
};

const promiseVersions = async (): Promise<DropDownMenuItem[]> => {
  try {
    const response: Response = await fetch('/api/dropdown_versions.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status ${response.status}`);
    }
    const data: responseVersions[] = await response.json();
    return data.map((item: responseVersions) => ({
      label: <span>{item.label}</span>,
      key: item.key,
      value: item.key,
      text: item.label,
    }));
  } catch (error) {
    console.error('Failed to fetch versions:', error);
    return [];
  }
};

export const IDropdown = ({ className, items: initialItemsFromProps }: DropDownMenuItemProps) => {
  const [error, setError] = useState<string | null>(null);
  const [currentSelectedValue, setCurrentSelectedValue] = useState<string | undefined>(undefined);
  const [allVersions, setAllVersions] = useState<DropDownMenuItem[]>([]);
  const [displayedVersions, setDisplayedVersions] = useState<DropDownMenuItem[]>([]);

  useEffect(() => {
    const getVersions = async () => {
      setError(null);
      try {
        const data: DropDownMenuItem[] = initialItemsFromProps || (await promiseVersions());
        setAllVersions(data);
        setDisplayedVersions(data);
        if (data.length > 0) {
          setCurrentSelectedValue(data[0].value);
        } else {
          setError('Нет доступных версий');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Произошла неизвестная ошибка');
        }
      }
    };
    getVersions();
  }, [initialItemsFromProps]);

  const handleSelectChange = (value: string): void => {
    setCurrentSelectedValue(value);
  };

  const handleSearch = (searchText: string): void => {
    if (!searchText) {
      setDisplayedVersions(allVersions);
      return;
    }

    const filtered: DropDownMenuItem[] = allVersions.filter((item) =>
      item.text.toLowerCase().includes(searchText.toLowerCase()),
    );
    setDisplayedVersions(filtered);
  };

  return (
    <Select
      popupMatchSelectWidth={false}
      className={s.select}
      showSearch
      value={currentSelectedValue}
      onChange={handleSelectChange}
      onSearch={handleSearch}
      filterOption={false}
      notFoundContent={displayedVersions.length === 0 ? 'Таких версий нет' : null}
      suffixIcon={false}
      options={displayedVersions.map((item) => ({
        label: item.label,
        value: item.value,
        key: item.key,
        text: item.text,
      }))}
    />
  );
};
