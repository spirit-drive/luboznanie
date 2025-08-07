import { ReactNode } from "react";

export type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};