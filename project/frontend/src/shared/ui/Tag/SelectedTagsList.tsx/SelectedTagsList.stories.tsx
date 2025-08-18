import type { Meta, StoryObj } from '@storybook/react';
import { SelectedTagsList } from './SelectedTagsList';
import { useState } from 'react';
import type { MenuProps } from 'antd';
import { MenuItemType } from 'antd/es/menu/interface';

type MyMenuItemType = MenuItemType & {
  nonDeletable?: boolean;
};

const sampleData: MyMenuItemType[] = [
  { key: '1', label: 'Tag 1' },
  { key: '2', label: 'Tag 2', nonDeletable: true },
  { key: '3', label: 'Tag 3' },
];

const meta: Meta<typeof SelectedTagsList> = {
  title: 'Components/SelectedTagsList',
  component: SelectedTagsList,
  tags: ['autodocs'],

  argTypes: {
    data: { control: false },
    selectedKeys: { control: false },
    onRemove: { action: 'removed' },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `в таком виде происходит рендер выбранных из выпадающего списка тэгов, а также удаление через иконку, nonDeletable тэги не удаляются `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SelectedTagsList>;

export const Default: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState(['1', '2', '3']);

    const handleRemove = (key: string) => {
      setSelectedKeys((prev) => prev.filter((k) => k !== key));
    };

    return <SelectedTagsList data={sampleData} selectedKeys={selectedKeys} onRemove={handleRemove} />;
  },
};
