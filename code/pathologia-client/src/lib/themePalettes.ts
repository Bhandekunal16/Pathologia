export type ThemePaletteId = 'teal' | 'emerald' | 'mint' | 'forest' | 'sage' | 'pine';

export interface ThemePaletteOption {
  id: ThemePaletteId;
  label: string;
  description: string;
  /** Preview swatch for picker UI */
  swatch: string;
  /** Secondary accent for gradient preview */
  swatchSecondary: string;
}

export const themePaletteOptions: ThemePaletteOption[] = [
  {
    id: 'teal',
    label: 'Pathologia Green',
    description: 'Matches your logo — clinical teal-green',
    swatch: '#0f766e',
    swatchSecondary: '#14b8a6',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    description: 'Vibrant emerald green accents',
    swatch: '#047857',
    swatchSecondary: '#10b981',
  },
  {
    id: 'mint',
    label: 'Fresh Mint',
    description: 'Bright mint-green highlights',
    swatch: '#16a34a',
    swatchSecondary: '#4ade80',
  },
  {
    id: 'forest',
    label: 'Deep Forest',
    description: 'Rich woodland green depth',
    swatch: '#14532d',
    swatchSecondary: '#22c55e',
  },
  {
    id: 'sage',
    label: 'Soft Sage',
    description: 'Muted sage and olive tones',
    swatch: '#4d7c0f',
    swatchSecondary: '#84cc16',
  },
  {
    id: 'pine',
    label: 'Pine Grove',
    description: 'Cool pine with teal undertones',
    swatch: '#0f5c4a',
    swatchSecondary: '#2dd4bf',
  },
];

export const DEFAULT_THEME_PALETTE: ThemePaletteId = 'teal';

export function isThemePaletteId(value: string | null): value is ThemePaletteId {
  return themePaletteOptions.some((palette) => palette.id === value);
}
