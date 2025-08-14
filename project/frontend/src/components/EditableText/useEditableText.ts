import { useEffect, useRef } from "react";

export const useEditableText = (
  value: string
): React.RefObject<HTMLElement | null> => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (rootRef.current && value !== rootRef.current.innerText) {
      rootRef.current.innerText = value;
    }
  }, [value]);

  return rootRef;
};
