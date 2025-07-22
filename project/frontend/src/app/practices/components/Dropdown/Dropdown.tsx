'use client';
import '@ant-design/v5-patch-for-react-19';
import { Select } from 'antd';
import s from './Dropdown.module.scss';
import { useState, useEffect, ReactNode } from 'react';

export type DropDownMenuItem = {
  label: React.ReactNode;
  key: string;
  value: string;
  text: string;
};

export type DropDownMenuItemProps = {
  items?: DropDownMenuItem[];
  className?: string;
  onSearch?: (text: string) => Promise<DropDownMenuItem[]>;
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

  useEffect(() => {
    const getVersions = async () => {
      setError(null);
      try {
        const data: DropDownMenuItem[] = initialItemsFromProps || (await promiseVersions());
        setAllVersions(data);
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

  const handleSearch = async (searchText: string): Promise<void> => {
    console.log('handleSearch вызван');

    setError(null);
    try {
      const searchResults: DropDownMenuItem[] = await mockSearchFunction(searchText);
      console.log('Содержимое searchResults при поиске:', searchResults);
      setAllVersions(searchResults);
    } catch (err) {
      setError('Ошибка при поиске');
      setAllVersions([]);
    }
  };

  const mockSearchFunction = async (searchText: string): Promise<DropDownMenuItem[]> => {
    console.log(`Выполняется mockSearchFunction с текстом: "${searchText}"`);
    const data = await promiseVersions();
    console.log(data);
    // setAllVersions(data)
    console.log('sssssssssssssssssssssssssssssssssss');
    //const filteredData = data.filter((item: DropDownMenuItem) => item.label.includes(searchText));
    const filteredData = data.filter((item) => {
      return item.label.includes(searchText);
    });
    console.log('filtered===================');
    console.log(filteredData);
    return filteredData.map((item) => ({
      label: <span>{item.label}</span>,
      key: item.key,
      value: item.key,
      text: item.label,
    }));
    
  };

  const clientFilterOption = (
    input: string,
    option?: { label: React.ReactNode; value: string; text: string },
  ): boolean => {
    if (!option || !option.label) {
      return false;
    }

    let labelText = '';
    if (typeof option.label === 'string') {
      labelText = option.label;
    } else if (typeof option.label === 'number') {
      labelText = String(option.label);
    } else if (typeof option.label === 'object' && option.label !== null) {
      const props = (option.label as any).props;
      if (props && 'children' in props) {
        labelText = String(props.children);
      }
    }
    return labelText.toLowerCase().includes(input.toLowerCase());
  };
  console.log(error, allVersions) ;
  return (
    <Select
      popupMatchSelectWidth={false}
      className={s.select}
      showSearch
      value={currentSelectedValue}
      onChange={handleSelectChange}
      // onSearch={onSearch ? handleSearch : undefined}
      onSearch={handleSearch}
      //filterOption={onSearch ? false : clientFilterOption}
      // disabled={!!error}
      suffixIcon={false}
      options={allVersions.map((item) => ({
        label: item.label,
        value: item.value,
        key: item.key,
        text: item.text,
      }))}
    />
  );
};
