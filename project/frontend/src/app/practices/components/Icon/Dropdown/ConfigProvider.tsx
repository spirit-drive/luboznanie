import {  ConfigProvider as AntConfigProvider } from 'antd';
import { ConfigProviderProps } from './types';

export const ConfigProvider = ({children, theme}: ConfigProviderProps) => {
  return (
    <AntConfigProvider theme={theme}>{children}</AntConfigProvider>
  )
}