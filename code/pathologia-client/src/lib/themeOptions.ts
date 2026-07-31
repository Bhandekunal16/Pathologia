import type { ComponentType } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { ThemeMode } from './theme';

export const themeOptions: Array<{
  mode: ThemeMode;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    mode: 'light',
    label: 'Light',
    description: 'Bright surfaces and dark text',
    icon: Sun,
  },
  {
    mode: 'dark',
    label: 'Dark',
    description: 'Dim surfaces and light text',
    icon: Moon,
  },
  {
    mode: 'system',
    label: 'System',
    description: 'Match your device setting',
    icon: Monitor,
  },
];
