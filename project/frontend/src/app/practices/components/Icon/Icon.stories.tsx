import type { Meta, StoryObj } from '@storybook/nextjs';
import { Icon } from './Icon';
import s from './IconStory.module.scss';

const iconNames = [
  'list',
  'envelope',
  'temporary_files',
  'selected',
  'problems',
  'completed',
  'help',
  'realtime_update',
  'print',
  'error',
  'config',
  'config:active',
  'heart',
  'heart:active',
  'update',
  'save',
  'email',
  'edit',
  'write',
  'link',
  'sort',
  'flag',
  'jewel',
  'delete',
  'key',
  'show',
  'hide',
  'copy',
  'waiting',
  'puzzles',
  'users',
  'document',
  'analysis',
  'undo',
  'redo',
  'add_folder',
  'layers',
  'random',
  'create',
  'move',
  'move:active',
  'deadline',
  'history_undo',
  'history',
  'updating',
  'faq',
  'target',
  'hiding',
  'progress_indicator',
  'play',
  'cancel',
  'add_remove',
  'task_management',
  'menu',
  'menu:active',
  'private_access',
  'leader',
  'bookmark',
  'bookmark:active',
  'open_close',
  'plus_el',
];

const meta: Meta<typeof Icon> = {
  title: 'Icons/Icon',
  component: Icon,
  argTypes: {
    name: {
      options: iconNames,
      control: { type: 'radio' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: 'move',
  },
};

export const AllIcons: Story = {
  render: () => (
    <div className={s.root}>
      {iconNames.map((icon, index) => (
        <div className={s.card} key={index}>
          <Icon name={icon} />
          <span className={s.icon_name}>{icon}</span>
        </div>
      ))}
    </div>
  ),
};
