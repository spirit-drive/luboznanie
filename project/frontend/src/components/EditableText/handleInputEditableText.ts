import type { handleInputEditableTextProps } from "./handleInputEditableText.types";

export const handleInputEditableText = ({
  e,
  onChange,
  sanitizeFn,
}: handleInputEditableTextProps): void => {
  const target = e.target as HTMLElement;
  const clean = sanitizeFn(target.innerText);
  onChange(clean);
};
