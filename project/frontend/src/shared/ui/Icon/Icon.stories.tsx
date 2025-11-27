import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './Icon';
import s from './IconStory.module.scss';

const iconNames = [
  'settings',
  'settings-active',
  'condition-active',
  'condition',
  'pause',
  'pause-active',
  'warn',
  'warn-active',
  'print',
  'tick',
  'minus-all',
  'variants',
  'random',
  'undo',
  'redo',
  'long-arrow',
  'vars',
  'idea',
  'clock',
  'copy',
  'delete',
  'show',
  'hide',
  'flag',
  'history',
  'level',
  'check-list',
  'list',
  'menu',
  'open-close',
  'edit',
  'edit-active',
  'play',
  'plus',
  'plus-square',
  'plus-square-active',
  'send-all',
  'save',
  'retry',
  'cancel',
  'bookmark',
  'bookmark-active',
  'time-fire',
  'move',
  'move-square',
  'move-square-active',
  'time-sand',
  'question',
  'add-here',
  'like',
  'like-active',
  'task',
  'book',
  'map',
  'calc',
  'pencil',
  'key',
  'puzzle',
  'target',
  'square',
  'square-active',
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
