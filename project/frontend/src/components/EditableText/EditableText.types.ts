import type { ElementType } from "react";

export type EditableTextProps = {
  as?: ElementType;
  className?: string;
  value: string;
  // onChange: (value: string) => void;
  onInput: (
    e: React.FormEvent<HTMLElement>
  ) => void;
};
