import React from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';
import { themeOptions } from '../../lib/themeOptions';
import { ThemePalettePicker } from '../../components/theme/ThemePalettePicker';

export const ThemeSettings: React.FC = () => {
  const { mode, setMode } = useTheme();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground-secondary">Color palette</p>
        <ThemePalettePicker />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground-secondary">Display mode</p>
        <div className="theme-settings-grid" role="radiogroup" aria-label="Theme appearance">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = mode === option.mode;

            return (
              <button
                key={option.mode}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setMode(option.mode)}
                className={cn('theme-settings-option', isActive && 'theme-settings-option--active')}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="theme-settings-option-icon">
                    <Icon className="w-4 h-4" />
                  </span>
                  {isActive && <Check className="w-4 h-4 shrink-0 text-accent" aria-hidden="true" />}
                </div>
                <span className="theme-settings-option-label">{option.label}</span>
                <span className="theme-settings-option-description">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
