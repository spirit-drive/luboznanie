import { useState, useEffect } from "react";
import { getAsyncData } from "./getAsyncData";
import type { MenuProps } from "antd";

type AntdMenuItem = NonNullable<MenuProps["items"]>[number];

export type TagItem = AntdMenuItem & {
  key: string;
  label: string;
  nonDeletable: boolean;
};

export const useTagsData = (url: string) => {
  const [data, setData] = useState<TagItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getAsyncData<TagItem[]>(url);
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };
    loadData();
  }, [url]);

  return { data, error };
};
