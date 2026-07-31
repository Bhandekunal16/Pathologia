import {
  DEFAULT_THEME_PALETTE,
  isThemePaletteId,
  ThemePaletteId,
} from './themePalettes';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_MODE_STORAGE_KEY = 'pathologia_theme_mode';
export const THEME_PALETTE_STORAGE_KEY = 'pathologia_theme_palette';

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function getStoredThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    return isThemeMode(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function setStoredThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore storage errors */
  }
}

export function getStoredThemePalette(): ThemePaletteId {
  try {
    const stored = localStorage.getItem(THEME_PALETTE_STORAGE_KEY);
    return isThemePaletteId(stored) ? stored : DEFAULT_THEME_PALETTE;
  } catch {
    return DEFAULT_THEME_PALETTE;
  }
}

export function setStoredThemePalette(palette: ThemePaletteId): void {
  try {
    localStorage.setItem(THEME_PALETTE_STORAGE_KEY, palette);
  } catch {
    /* ignore storage errors */
  }
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.setAttribute('data-theme', resolved);
}

export function applyThemePalette(palette: ThemePaletteId): void {
  document.documentElement.setAttribute('data-palette', palette);
}

export function applyTheme(mode: ThemeMode, palette: ThemePaletteId): ResolvedTheme {
  const resolved = resolveTheme(mode);
  applyResolvedTheme(resolved);
  applyThemePalette(palette);
  return resolved;
}
