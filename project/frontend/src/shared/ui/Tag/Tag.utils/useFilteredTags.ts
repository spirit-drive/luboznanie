import type { MenuProps } from "antd";
import { useMemo } from "react";

export type FilterTagHookProps = {
  data: MenuProps["items"];
  searchText: string;
  selectedTagsKeys: string[];
};

type MenuItem = NonNullable<MenuProps["items"]>[number];

export const useFilteredTags = ({ data, searchText, selectedTagsKeys }: FilterTagHookProps) => {
  return useMemo(() => {
    const safeData = data || [];

    return safeData
      .filter((item): item is MenuItem & { label: string; key: string;nonDeletable: boolean } => {
        return (
          item != null &&
          "label" in item &&
          typeof item.label === "string" &&
          "key" in item &&
          typeof item.key === "string"  &&
          "nonDeletable" in item &&
          typeof item.nonDeletable === "boolean"
        );
      })
      .filter((item) => item.label.toLowerCase().includes(searchText.toLowerCase()))
      .map((item) => ({
        ...item,
        disabled: selectedTagsKeys.includes(item.key),
      }));
  }, [data, searchText, selectedTagsKeys]);
};
