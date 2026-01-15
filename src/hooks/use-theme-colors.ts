import { useAppTheme } from './use-app-theme';
import { theme } from '../theme';

export const useThemeColors = () => {
  const { effectiveTheme } = useAppTheme();
  const isDark = effectiveTheme === 'dark';
  return isDark ? theme.dark : theme.colors;
};
