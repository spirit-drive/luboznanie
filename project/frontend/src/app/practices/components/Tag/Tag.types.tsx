export type Tag = {
  id: string | number;
  text: string;
  nonDelatable?: boolean;
  isDefault?: boolean;
};

export type SingleTagProps = {
  tag: Tag;
  className?: string;
  onRemove?: (id: string) => void;
};
