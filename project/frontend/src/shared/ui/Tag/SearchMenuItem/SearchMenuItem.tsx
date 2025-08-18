import { ConfigProvider, Input, type InputRef } from 'antd';

export type SearchMenuItemProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<InputRef | null>;
};

export const SearchMenuItem = ({ value, onChange, inputRef }: SearchMenuItemProps) => (
  <div style={{ padding: 0 }}>
    <ConfigProvider
      theme={{
        components: {
          Input: {
            hoverBorderColor: 'rgb(170, 170, 170)',
            activeBorderColor: 'silver',
            activeShadow: '0 0 0 2px silver',
          },
        },
      }}
    >
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search tag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontSize: 12,
          paddingInline: 4,
          textAlign: 'center',
        }}
      />
    </ConfigProvider>
  </div>
);
