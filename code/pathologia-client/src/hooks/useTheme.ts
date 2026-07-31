import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const palette = useThemeStore((state) => state.palette);
  const resolved = useThemeStore((state) => state.resolved);
  const setMode = useThemeStore((state) => state.setMode);
  const setPalette = useThemeStore((state) => state.setPalette);

  return { mode, palette, resolved, setMode, setPalette };
}
