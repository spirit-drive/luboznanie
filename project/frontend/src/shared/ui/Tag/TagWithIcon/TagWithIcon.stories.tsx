import type { Meta, StoryObj } from '@storybook/react';
import { TagWithIcon } from './TagWithIcon';
import { useState } from 'react';
import './TagWithIcon.module.scss';

const meta: Meta<typeof TagWithIcon> = {
  title: 'Components/TagWithIcon',
  component: TagWithIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Компонент при клике В СТОРИБУКЕ ТОЛЬКО!!! не меняет border-color так как меняем просто класс для стилей, а не СТЕЙТ`,
      },
    },
  },
  argTypes: {
    text: { control: 'text', description: 'Текст тега' },
    showDeleteIcon: { control: 'boolean', description: 'Показывать иконку удаления' },
    iconName: {
      control: 'select',
      options: ['delete', 'hiding', 'task_management', 'save'],
      description: 'Тип иконки',
    },
    onDelete: { action: 'deleted', description: 'Событие при удалении' },
    classNameText: { control: 'text', description: 'Доп. классы для текста' },
    classNameSvg: { control: 'text', description: 'Доп. классы для иконки' },
  },
  args: {
    text: 'Пример тега',
    showDeleteIcon: true,
    iconName: 'delete',
  },
};

export default meta;

type Story = StoryObj<typeof TagWithIcon>;

export const Interactive: Story = {
  render: (args) => {
    const [removed, setRemoved] = useState(false);

    if (removed) return <div>Тег был удален</div>;

    return <TagWithIcon {...args} onDelete={() => setRemoved(true)} />;
  },
};
