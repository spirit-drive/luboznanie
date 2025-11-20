import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { EditableContent } from './EditableContent';

const meta: Meta<typeof EditableContent> = {
  title: 'Components/EditableContent',
  component: EditableContent,
  render: () => {
    const [value, setValue] = useState('Начальный текст');

    return <EditableContent value={value} onChange={setValue} className="storybook-editable" />;
  },
};

export default meta;

type Story = StoryObj<typeof EditableContent>;

export const Default: Story = {};
