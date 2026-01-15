import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/theme-store';

export const useAppTheme = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useThemeStore();

  const effectiveTheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemColorScheme || 'light') : themeMode;

  return {
    themeMode,
    setThemeMode,
    effectiveTheme,
  };
};
