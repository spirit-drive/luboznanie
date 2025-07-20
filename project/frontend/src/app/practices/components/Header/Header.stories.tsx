import type { Meta, StoryObj } from '@storybook/nextjs';
import { Header } from './Header';
import { Dropdown, type MenuProps } from 'antd';
import s from './IconStory.module.scss';

const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
        1st menu item
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
        2nd menu item
      </a>
    ),
  },
  {
    key: '3',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
        3rd menu item
      </a>
    ),
  },
];

const meta: Meta<typeof Header> = {
  title: 'Header/Dropdown',
  component: Header,
  argTypes: {
    name: {
      options: items,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '1rem' }}>
      <Header />
      {/* Демо меню вне компонента для Storybook Controls */}
      <Dropdown menu={{ items: items }} trigger={['click']} placement="bottomRight">
        <button style={{ marginTop: '2rem', padding: '8px 16px' }}>Тест Dropdown</button>
      </Dropdown>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Хеддер с выпадающим меню версий',
      },
    },
  },
};

