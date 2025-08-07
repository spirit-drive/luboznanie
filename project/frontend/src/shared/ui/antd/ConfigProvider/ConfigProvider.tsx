import {  ConfigProvider as AntConfigProvider } from 'antd';
import { ConfigProviderProps } from '../Dropdown/ConfigProvider.types';


export const ConfigProvider = ({children, theme}: ConfigProviderProps) => {
  return (
    <AntConfigProvider theme={theme}>{children}</AntConfigProvider>
  )
}