import { Icon } from '../Icon/Icon';
import s from './Header.module.scss';
import Image from 'next/image';
import { IDropdown } from '../Dropdown/Dropdown';

export const Header = () => {
  return (
    <header className={s.header}>
      <div className={s.top_part}>
        <div className={s.left}>
          <Icon className={s.icon} name="document" />
          <span className={s.task}>Задача</span>
        </div>
        <div className={s.right}>
          <IDropdown />
          <Image className={s.book_svg} src="/icons/book_key.svg" alt="book-icon" width={22} height={22} />
        </div>
      </div>
      <div className={s.line}></div>
      <div className={s.editable_title}>contentEditable</div>
      <div>
        <Icon name="create" />
        <span>TAGS COMPONENT</span>
      </div>
    </header>
  );
};
