import type { FormEvent } from 'react';

export type handleInputEditableTextProps = {
  e: FormEvent<HTMLElement>;
  onChange: (value: string) => void;
  sanitizeFn: (inpur: string) => string;
};
