'use client';
import '@ant-design/v5-patch-for-react-19';
import Dropdown from 'antd/es/dropdown/dropdown';
import s from './Dropdown.module.scss';
import { useState, useEffect } from 'react';

export type DropDownMenuItem = {
  label: React.ReactNode;
  key: string;
};

export type DropDownMenuItemProps = {
  items?: DropDownMenuItem[];
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
  overlayClassName?: string;
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
    }));
  } catch (error) {
    alert('Failed to fetch versions:' + error);
    return [];
  }
};

export const IDropdown = ({ trigger = ['click'], placement = 'bottom' }: DropDownMenuItemProps) => {
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<React.ReactNode>();
  const [currentItems, setCurrentItems] = useState<DropDownMenuItem[]>([]);

  useEffect(() => {
    const loadVersionsData = async () => {
      try {
        const versionsData: DropDownMenuItem[] = await promiseVersions();
        setCurrentItems(versionsData);
        if (versionsData.length > 0) {
          setVersion(versionsData[0].label);
        } else {
          setVersion(<span>Нет доступных версий</span>);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          setVersion(<span>Ошибка загрузки!</span>);
        } else {
          setError('Произошла неизвестная ошибка');
          setVersion(<span>Ошибка загрузки!</span>);
        }
      }
    };
    loadVersionsData();
  }, []);

  const eventHandler = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
  };
  const handleMenuClick = (e: { key: string }): void => {
    const value = currentItems.find((item) => item?.key === e.key);
    setVersion(value?.label ?? <span>Error: Not found</span>);
  };

  return (
    <Dropdown
      overlayClassName={s.dropdownMenu}
      menu={{ items: currentItems, onClick: handleMenuClick }}
      trigger={trigger}
      placement={placement}
    >
      <button className={s.button}>
        <a className={s.link} onClick={eventHandler}>
          {version}
        </a>
      </button>
    </Dropdown>
  );
};
