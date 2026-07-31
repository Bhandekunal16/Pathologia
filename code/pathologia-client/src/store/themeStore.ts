import { create } from 'zustand';
import {
  applyTheme,
  getStoredThemeMode,
  getStoredThemePalette,
  setStoredThemeMode,
  setStoredThemePalette,
  ThemeMode,
  ResolvedTheme,
} from '../lib/theme';
import { ThemePaletteId } from '../lib/themePalettes';

interface ThemeState {
  mode: ThemeMode;
  palette: ThemePaletteId;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePaletteId) => void;
  syncFromSystem: () => void;
  init: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getStoredThemeMode(),
  palette: getStoredThemePalette(),
  resolved: 'light',

  setMode: (mode) => {
    const { palette } = get();
    setStoredThemeMode(mode);
    const resolved = applyTheme(mode, palette);
    set({ mode, resolved });
  },

  setPalette: (palette) => {
    const { mode } = get();
    setStoredThemePalette(palette);
    const resolved = applyTheme(mode, palette);
    set({ palette, resolved });
  },

  syncFromSystem: () => {
    const { mode, palette } = get();
    if (mode !== 'system') return;
    const resolved = applyTheme('system', palette);
    set({ resolved });
  },

  init: () => {
    const mode = getStoredThemeMode();
    const palette = getStoredThemePalette();
    const resolved = applyTheme(mode, palette);
    set({ mode, palette, resolved });
  },
}));
