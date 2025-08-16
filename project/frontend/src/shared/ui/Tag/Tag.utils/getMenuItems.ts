// import { MenuProps, type InputRef } from "antd";
// import { SearchMenuItem } from "./SearchMenuItem";
// import s from "./DropDownIcon.module.scss";
// import type { TagItem } from "./useTagData";

// export const getMenuItems = (
//   filteredTags: TagItem[],
//   searchText: string,
//   setSearchText: (text: string) => void,
//   searchRef: React.RefObject<InputRef>
// ): MenuProps["items"] => [
//   {
//     key: "search-header",
//     className: s.noHover,
//     label: <SearchMenuItem value={searchText} onChange={setSearchText} inputRef={searchRef} />,
//     style: {
//       cursor: "text",
//       pointerEvents: "auto",
//       padding: 4,
//     },
//   },
//   ...filteredTags.map((item) => ({
//     key: item.key,
//     label: <div style={{ textAlign: "center", fontSize: "12px" }}>{item.label}</div>,
//     disabled: item.disabled,
//   })),
// ];
