import type { Meta, StoryObj } from '@storybook/react';
import { TagOrigin } from './TagOrigin';
import './TagOrigin.module.scss';

const meta: Meta<typeof TagOrigin> = {
  title: 'Components/TagOrigin',
  component: TagOrigin,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `Компонент тэг самый базовый`,
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['span', 'div', 'button'],
      description: 'HTML-элемент для рендеринга',
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS-классы',
    },
    children: {
      control: 'text',
      description: 'Содержимое тега',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TagOrigin>;

export const Default: Story = {
  args: {
    children: 'Default Tag',
  },
};

export const AsSpan: Story = {
  args: {
    children: 'Span Tag',
    as: 'span',
  },
};

export const AsDiv: Story = {
  args: {
    children: 'Div Tag',
    as: 'div',
  },
};

export const AsButton: Story = {
  args: {
    children: 'Button Tag',
    as: 'button',
    onClick: () => console.log('Tag clicked'),
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Custom Styled Tag',
    className: 'custom-class',
  },
};

export const WithChildren: Story = {
  args: {
    children: (
      <>
        <span>🔔</span>
        <span>Notification</span>
      </>
    ),
  },
};
