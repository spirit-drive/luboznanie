import type { Meta, StoryObj } from '@storybook/nextjs';
import { DropDownMenuItem, IDropdown } from './Dropdown';

export const items: DropDownMenuItem[] = [
  {
    value: '0',
    text: '1st menu item',
    label: <span>1st menu item</span>,
    key: '0',
  },
  {
    value: '1',
    text: '2nd menu item',
    label: <span>2nd menu item</span>,
    key: '1',
  },
  {
    value: '3',
    text: '3rd menu item',
    label: <span>3rd menu item</span>,
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
  },

  argTypes: {
    items: {
      control: 'object',
      description: 'Массив элементов меню в формате { label: React.ReactNode, key: string, tex: string, value: string  }',
      table: {
        type: {
          summary: 'DropDownMenuItem[]',
          detail: `Массив объектов с полями 
            label: ReactNode, 
            key: string,
            value: string,
            text: string`,
        },
      },
    },

    className: {
      description: 'позволяет добавить дополнителыный класс для стилизации',
    },

    onSearch: {
      description: 'позволяет добавить функцию для поиска из выпадающего меню',
    }
  },
};

export default meta;

type Story = StoryObj<typeof IDropdown>;
