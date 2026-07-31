import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';
import { themePaletteOptions } from '../../lib/themePalettes';

export const ThemePalettePicker: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { palette, setPalette } = useTheme();

  return (
    <div
      className={cn('theme-palette-grid', compact && 'theme-palette-grid--compact')}
      role="radiogroup"
      aria-label="Color palette"
    >
      {themePaletteOptions.map((option) => {
        const isActive = palette === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            title={option.description}
            onClick={() => setPalette(option.id)}
            className={cn('theme-palette-option', isActive && 'theme-palette-option--active')}
          >
            <span
              className="theme-palette-swatch"
              style={{
                background: `linear-gradient(135deg, ${option.swatch} 0%, ${option.swatchSecondary} 100%)`,
              }}
            />
            {!compact && (
              <span className="theme-palette-option-label">{option.label}</span>
            )}
            {isActive && (
              <span className="theme-palette-check" aria-hidden="true">
                <Check className="w-3 h-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
