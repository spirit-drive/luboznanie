// EditableText.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EditableText } from './EditableText';
import { useState } from 'react';

const meta: Meta<typeof EditableText> = {
  title: 'Components/EditableText',
  component: EditableText,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `Компонент для редактирования текста на месте`,
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'HTML tag to render as',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class',
    },
    value: {
      control: 'text',
      description: 'Initial text value',
    },
    onSetChange: {
      action: 'changed',
      description: 'Callback when text changes, useState(value)',
    },
  },
};

export default meta;

type Story = StoryObj<typeof EditableText>;

export const Default: Story = {
  args: {
    value: 'Edit this text',
  },
  render: (args) => {
    const [text, setText] = useState(args.value);
    return <EditableText {...args} value={text} onSetChange={setText} />;
  },
};

export const AsParagraph: Story = {
  args: {
    as: 'p',
    value: 'This is an editable paragraph. Click to edit me!',
  },
  render: (args) => {
    const [text, setText] = useState(args.value);
    return <EditableText {...args} value={text} onSetChange={setText} />;
  },
};

export const AsHeading: Story = {
  args: {
    as: 'h2',
    value: 'Editable Heading',
  },
  render: (args) => {
    const [text, setText] = useState(args.value);
    return <EditableText {...args} value={text} onSetChange={setText} />;
  },
};

export const WithSanitization: Story = {
  args: {
    value: 'Try pasting HTML here',
  },
  render: (args) => {
    const [text, setText] = useState(args.value);
    return (
      <div>
        <EditableText {...args} value={text} onSetChange={setText} />
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5' }}>
          <strong>Sanitized output:</strong>
          <div>{text}</div>
        </div>
      </div>
    );
  },
};

export const StyledEditableText: Story = {
  args: {
    className: 'custom-style',
    value: 'Styled editable text',
  },
  render: (args) => {
    const [text, setText] = useState(args.value);
    return (
      <EditableText
        {...args}
        value={text}
        onSetChange={setText}
        style={{
          padding: '0.5rem',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          minHeight: '2rem',
        }}
      />
    );
  },
};
