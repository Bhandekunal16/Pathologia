import React from 'react';
import { Palette } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';
import { themeOptions } from '../../lib/themeOptions';
import { ThemePalettePicker } from './ThemePalettePicker';

export const ThemeMenuPicker: React.FC = () => {
  const { mode, setMode } = useTheme();

  return (
    <div className="theme-menu-picker" role="group" aria-label="Theme settings">
      <div className="theme-menu-picker-header">
        <Palette className="w-3.5 h-3.5 text-accent" />
        <span className="theme-menu-picker-label">Appearance</span>
      </div>

      <div className="px-2 pb-2">
        <ThemePalettePicker compact />
      </div>

      <div className="theme-menu-picker-options" role="radiogroup" aria-label="Display mode">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = mode === option.mode;

          return (
            <button
              key={option.mode}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
              title={option.description}
              onClick={() => setMode(option.mode)}
              className={cn('theme-menu-picker-btn', isActive && 'theme-menu-picker-btn--active')}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
