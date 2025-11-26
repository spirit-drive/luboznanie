import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './Icon';
import s from './IconStory.module.scss';

const iconNames = [
  'settings',
  'print',
  'condition-active',
  'condition',
  'pause',
  'pause-active',
  'warn',
  'warn-active',
  'tick',
  'minus-all',
  'variants',
  'check-list',
  'random',
  'undo',
  'redo',
  'long-arrow',
  'vars',
  'idea',
  'clock',
  'copy',
  'delete',
  'key',
  'show',
  'hide',
  'flag',
  'history',
  'level',
  'pencil',
  'line-active',
  'list',
  'menu',
  'open-close',
  'edit',
  'play',
  'plus',
  'plus-square-active',
  'plus-square',
  'send-all',
  'save',
  'settings-active',
  'retry',
  'cancel',
  'bookmark-active',
  'bookmark',
  'time-fire',
  'move',
  'square-active',
  'move-square-active',
  'time-sand',
  'question',
  'edit-active',
  'add-here',
  'like',
  'puzzle',
  'calc',
  'target',
  'move-square',
  'square',
  'task',
  'book',
  'map',
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
