import React, { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

export const ThemeInitializer: React.FC = () => {
  const init = useThemeStore((state) => state.init);
  const syncFromSystem = useThemeStore((state) => state.syncFromSystem);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => syncFromSystem();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [syncFromSystem]);

  return null;
};
