import type { Meta, StoryObj } from '@storybook/react';
import { MapView } from './MapView';

// Глобальная конфигурация для всех историй компонента
const meta: Meta<typeof MapView> = {
  title: 'Components/MapView', // Название в дереве Storybook
  component: MapView, // Сам компонент
  parameters: {
    // Используем 'fullscreen' для компонентов, которые занимают много места, как карта
    layout: 'fullscreen',
  },
  // Включаем автоматическую генерацию документации
  tags: ['autodocs'],
};

export default meta;

// Определяем тип для наших историй
type Story = StoryObj<typeof meta>;

// --- Истории ---

/**
 * Базовое отображение компонента MapView.
 * Это стандартный вид без каких-либо дополнительных стилей.
 */
export const Default: Story = {
  args: {
    width: 500,
    height: 500,
  },
};
