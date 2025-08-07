import { ReactNode } from "react";
import { ConfigProviderProps as AntConfigProviderProps} from 'antd';

export type ConfigProviderProps = {
  children: ReactNode;
  theme: AntConfigProviderProps['theme'];
};