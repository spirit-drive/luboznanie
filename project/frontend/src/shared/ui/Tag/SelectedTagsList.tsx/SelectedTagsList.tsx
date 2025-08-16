"use client";
import type { MenuProps } from "antd";
import { TagWithIcon } from "../TagWithIcon/TagWithIcon";

type SelectedTagsListProps = {
  data: MenuProps["items"];
  selectedKeys: string[];
  onRemove: (key: string) => void;
};

export const SelectedTagsList = ({ data, selectedKeys, onRemove }: SelectedTagsListProps) => {
  return (
    <>
      {selectedKeys.map((key) => {
        const item = data?.find((tag) => tag?.key === key);
        if (!item || !("label" in item) || !item.key) {
          return null;
        }
        const label = typeof item.label === "string" ? item.label : "";
        const isNonDeletable = "nonDeletable" in item && item.nonDeletable === true;

        return (
          <div key={item.key}>
            <TagWithIcon
              iconName="delete"
              text={label}
              showDeleteIcon={!isNonDeletable}
              onDelete={!isNonDeletable ? () => onRemove(item.key as string) : undefined}
            />
          </div>
        );
      })}
    </>
  );
};
