import type { Meta, StoryObj } from '@storybook/nextjs';
import { EditableText } from './EditableText';

const meta: Meta<typeof EditableText> = {
  title: 'EditableText/EditableText',
  component: EditableText,
  tags: ['autodocs', 'ui', 'header', 'EditableText'],

  parameters: {
    docs: {
      description: {
        component: `Компонент EditableText. Через атрибут contenteditable принимает текст, текст проходит через защиту от xss атак средствами защиты библиотеки DOMPurify`,
      },
    },
  },

  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'span', 'p', 'h1', 'h2', 'h3'],
      description: 'HTML тэг для использования, внутри которого будет contenteditable текст',
    },
  },
};

export default meta;

type Story = StoryObj<typeof EditableText>;

export const Empty: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'linear-gradient(45deg, #ff00cc, #3333ff)',

          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
