'use client';
import { Icon } from '../Icon/Icon';
import s from './Header.module.scss';
import { IDropdown } from '../Dropdown/Dropdown';
import { EditableText } from '../../../../shared/components/EditableText/EditableText';

export type HeaderProps = {
  title: string;
  onTitleChange: (newTitle: string) => void;
  bookIcon?: React.ReactNode;
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
          <IDropdown />
          {bookIcon}
        </div>
      </div>
      <div className={s.line}></div>
      <EditableText as="span" value={title} onChange={onTitleChange} />
    </header>
  );
};
