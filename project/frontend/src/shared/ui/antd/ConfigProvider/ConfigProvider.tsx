'use client';
import { ConfigProvider as AntConfigProvider } from 'antd';
import { ConfigProviderProps } from './ConfigProvider.types';

export const ConfigProvider = ({ children, theme }: ConfigProviderProps) => {
  return <AntConfigProvider theme={theme}>{children}</AntConfigProvider>;
};
