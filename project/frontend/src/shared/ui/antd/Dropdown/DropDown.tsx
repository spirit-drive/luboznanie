"use client";
import clsx from "clsx";
import s from "./DropDown.module.scss";
import { Dropdown as AntDropdown } from "antd";
import type { DropDownProps } from "./DropDown.types";

export const DropDown = ({
  className,
  placement = "bottomLeft",
  menuProps,
  children,
  trigger = ["click"],
  ...props
}: DropDownProps) => {
  return (
    <AntDropdown
      {...props}
      className={clsx(s.root, className)}
      menu={menuProps}
      placement={placement}
      trigger={trigger}
    >
      {children}
    </AntDropdown>
  );
};
