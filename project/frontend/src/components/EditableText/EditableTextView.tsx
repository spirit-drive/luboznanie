"use client";
import clsx from "clsx";
import s from "./EditableText.module.scss";
import type { EditableTextProps } from "./EditableText.types";
import { useEditableText } from "./useEditableText";

export const EditableText = ({
  as: Component = "div",
  className = "",
  value,
  onInput,
}: EditableTextProps) => {
  const rootRef = useEditableText(value);

  return (
    <Component
      className={clsx(s.root, className)}
      ref={rootRef}
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
    />
  );
};
