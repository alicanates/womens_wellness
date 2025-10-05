import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';

export const useTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  return getTheme(isDarkMode);
};
