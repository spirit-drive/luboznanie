import type { Meta, StoryObj } from '@storybook/react';
import { TagText } from './TagText';
import './TagText.module.scss';

const meta: Meta<typeof TagText> = {
  title: 'Components/TagText',
  component: TagText,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `Компонент принимает обязательный пропс text`,
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['span', 'div', 'button', 'a'],
      description: 'HTML-элемент для рендеринга',
    },
    text: {
      control: 'text',
      description: 'Основной текст тега',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TagText>;

export const Default: Story = {
  args: {
    text: 'Обычный тег',
  },
};

export const AsButton: Story = {
  args: {
    text: 'Кнопка-тег',
    as: 'button',
    type: 'button',
    onClick: () => console.log('Кнопка нажата'),
  },
};

export const AsLink: Story = {
  args: {
    text: 'Ссылка-тег',
    as: 'a',
    href: '#',
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      console.log('Ссылка кликнута');
    },
  },
};

export const WithChildren: Story = {
  args: {
    text: 'Тег с иконкой',
    children: ' 🔔',
  },
};
