import { useState, useMemo, useRef } from "react";
import { Icon } from "../Icon/Icon";
import { ConfigProvider, Dropdown, Input } from "antd";
import type { InputRef, MenuProps } from "antd";
import Tag from "./Tag";
import s from "./AddTag.module.scss";

export type AddTagProps = {
  icon: string;
  className?: string;
};

const allItems = [
  { key: "1", label: "tag1" },
  { key: "2", label: "tag2" },
  { key: "3", label: "tag3" },
  { key: "4", label: "tag4" },
  { key: "5", label: "tag5" },
  { key: "6", label: "tag6" },
  { key: "7", label: "tag7" },
  { key: "8", label: "tag8" },
  { key: "9", label: "tag9" },
  { key: "10", label: "tag10" },
  { key: "11", label: "tag11" },
  { key: "12", label: "tag12" },
  { key: "13", label: "tag13" },
  { key: "14", label: "tag14" },
  { key: "15", label: "tag15" },
  { key: "16", label: "tag16" },
];

export const AddTag = ({ icon }: AddTagProps) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<InputRef | null>(null);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (!key.startsWith("search")) {
      setSelectedKeys((prev) => [...prev, key]);
       setOpen(false);
    }
  };

  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => item.label.toLowerCase().includes(searchText.toLowerCase()))
      .map((item) => ({
        ...item,
        disabled: selectedKeys.includes(item.key),
      }));
  }, [searchText, selectedKeys]);

  const handleTagRemove = (tagKey: string) => {
    setSelectedKeys(selectedKeys.filter((key) => key !== tagKey));
  };

  const getSelectedTags = () => {
    return selectedKeys.map((key) => {
      const item = allItems.find((i) => i.key === key);
      return item ? (
        <div key={item.key}>
          <Tag text={item.label} onRemove={() => handleTagRemove(key)} />
        </div>
      ) : null;
    });
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "search-header",
      className: s.noHover,
      label: (
        <div style={{ padding: 0 }}>
          <ConfigProvider
            theme={{
              components: {
                Input: {
                  hoverBorderColor: "rgb(170, 170, 170)",
                  activeBorderColor: "silver",
                  activeShadow: "0 0 0 2px silver",
                },
              },
            }}
          >
            <Input
              ref={searchRef}
              type="text"
              placeholder="Search tag"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              style={{
                width: "100%", // занимает всю ширину ячейки
                boxSizing: "border-box",
                fontSize: 12,
                paddingInline: 4,
                textAlign: "center",
              }}
            />
          </ConfigProvider>
        </div>
      ),
      style: {
        cursor: "text",
        pointerEvents: "auto",
        padding: 4,
      },
    },
    ...filteredItems.map((item) => ({
      key: item.key,
      label: <div style={{ textAlign: "center", fontSize: "12px" }}>{item.label}</div>,
      disabled: item.disabled,
    })),
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Dropdown
        menu={{
          items: menuItems,
          onClick: handleMenuClick,
          style: {
            maxHeight: 160,
            overflow: "auto",
            width: 100,
            padding: 4,
            fontSize: "114px",
          },
          onMouseDown: (e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          },
        }}
        trigger={["click"]}
        placement="topRight"
        arrow
        open={open}
        onOpenChange={(visible) => {
          setOpen(visible);
          if (!visible) {
            setSearchText("");
          } else {
            setTimeout(() => {
              searchRef.current?.focus();
            }, 100);
          }
        }}
      >
        <Icon name={icon} />
      </Dropdown>
      {getSelectedTags()}
    </div>
  );
};
