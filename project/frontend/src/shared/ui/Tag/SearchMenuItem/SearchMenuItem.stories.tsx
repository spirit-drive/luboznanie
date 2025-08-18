import type { Meta, StoryObj } from '@storybook/react';
import { useState, useRef } from 'react';
import { SearchMenuItem, SearchMenuItemProps } from './SearchMenuItem';
import { InputRef } from 'antd';

const meta: Meta<typeof SearchMenuItem> = {
  title: 'Components/SearchMenuItem',
  component: SearchMenuItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `стилизованный компонент для поиска тэгов внутри выпадающего меню`,
      },
    },
  },
  argTypes: {
    value: { control: 'text', description: 'Текущее значение поля' },
    onChange: { action: 'changed', description: 'Вызывается при изменении текста' },
  },
};

export default meta;

type Story = StoryObj<typeof SearchMenuItem>;

export const Default: Story = {
  render: (args: Partial<SearchMenuItemProps>) => {
    const [value, setValue] = useState(args.value ?? '');
    const inputRef = useRef<InputRef | null>(null);

    return (
      <SearchMenuItem
        {...args}
        value={value}
        inputRef={inputRef}
        onChange={(val) => {
          setValue(val);
          args.onChange?.(val);
        }}
      />
    );
  },
};
