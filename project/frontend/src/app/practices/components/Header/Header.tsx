'use client';
import '@ant-design/v5-patch-for-react-19';
import { Icon } from '../Icon/Icon';
import s from './Header.module.scss';

import { EditableText } from '../../../../shared/components/EditableText/EditableText';
import { Dropdown, items } from '../Dropdown/Dropdown';
// import { Dropdown, DropDownMenuItem } from '../Dropdown/Dropdown';
// import { DropdownContainer } from '../Dropdown/DropDownLogic';

export type HeaderProps = {
  title: string;
  onTitleChange: (newTitle: string) => void;
  bookIcon?: React.ReactNode;
  // dropdownItems?: DropDownMenuItem[]; // Добавляем пропс для элементов dropdown
  onDropdownChange?: (value: string) => void; // Обработчик изменения значения
};

export const Header = ({
  title,
  onTitleChange,
  bookIcon = <img className={s.book_svg} src="/icons/book_key.svg" alt="book-icon" />,
}: HeaderProps) => {
  return (
    <header className={s.header}>
      <div className={s.top_part}>
        <div className={s.left}>
          <Icon name="document" />
          <span className={s.task}>Задача</span>
        </div>
        <div className={s.right}>
          <Dropdown items={items} />
          {bookIcon}
        </div>
      </div>
      <div className={s.line}></div>
      <EditableText as="span" value={title} onChange={onTitleChange} />
    </header>
  );
};
