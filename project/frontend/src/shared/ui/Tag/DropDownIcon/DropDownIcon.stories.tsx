import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DropDownIcon } from './DropDownIcon';
import { SelectedTagsList } from '../SelectedTagsList.tsx/SelectedTagsList';

const mockTags = [
  { key: '1', label: 'tag1', nonDeletable: true },
  { key: '2', label: 'tag2', nonDeletable: true },
  { key: '3', label: 'tag3', nonDeletable: false },
  { key: '4', label: 'tag4', nonDeletable: false },
  { key: '5', label: 'tag5', nonDeletable: false },
];

const meta: Meta<typeof DropDownIcon> = {
  title: 'Components/DropDownIcon',
  component: DropDownIcon,
  tags: ['autodocs'],
  args: {
    iconName: 'create',
  },
};

export default meta;

type Story = StoryObj<typeof DropDownIcon>;

export const Default: Story = {
  render: (args) => {
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    return (
      <div style={{ padding: 20 }}>
        <DropDownIcon {...args} />
        <SelectedTagsList
          data={mockTags}
          selectedKeys={selectedKeys}
          onRemove={(key) => setSelectedKeys((prev) => prev.filter((k) => k !== key))}
        />
      </div>
    );
  },
};
