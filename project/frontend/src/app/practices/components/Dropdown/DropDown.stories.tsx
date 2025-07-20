import type { Meta, StoryObj } from '@storybook/nextjs';
import { IDropdown } from './Dropdown';

export type DropDownMenuItem = {
  label: React.ReactNode;
  key: string;
};

export const items: DropDownMenuItem[] = [
  {
    label: <span>1st menu item</span>,
    key: '0',
  },
  {
    label: <span>2nd menu item</span>,
    key: '1',
  },

  {
    label: <span>3nd menu item</span>,
    key: '3',
  },
];

const meta: Meta<typeof IDropdown> = {
  title: 'Dropdown/Dropdown',
  component: IDropdown,
  tags: ['autodocs', 'ui', 'header', 'dropdown'],

  parameters: {
    docs: {
      description: {
        component: 'Компонент dropdown-меню. Принимает массив элементов и отображает их в выпадающем списке',
      },
    },
  },

  args: {
    items: items,
    trigger: ['click'],
    placement: 'bottom',
  },

  argTypes: {
    items: {
      control: 'object',
      description: 'Массив элементов меню в формате { label: string, key: string }',
      table: {
        type: {
          summary: 'DropDownMenuItem[]',
          detail: `Массив объектов с полями 
            label: ReactNode, 
            key: string`,
        },
      },
    },

    trigger: {
      options: [['click'], ['hover'], ['click', 'hover']],
      control: 'select',
      description: 'Способ открытия меню (массив: click/hover)',
      table: {
        type: { summary: "('click' | 'hover')[]" },
        defaultValue: { summary: "['click']" },
      },
    },

    placement: {
      options: ['bottom', 'bottomLeft', 'bottomRight', 'top', 'topLeft', 'topRight'],
      control: 'select',
      description: 'Позиция выпадающего меню относительно кнопки',
      table: {
        type: { summary: "'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight'" },
        defaultValue: { summary: '"bottom"' },
      },
    },
    overlayClassName: {
      description: 'добавит класс "class_css" к самому внешнему контейнеру выпадающего списка, позволяя вам применить к нему свои стили через CSS',
    },
    className: {
      description: 'позволяет добавить дополнителыный класс для стилизации'
    }
  },
};

export default meta;

type Story = StoryObj<typeof IDropdown>;

