import { lightColors, darkColors, AppColors } from './colors';
import { useStore } from '../store';

export const useTheme = (): AppColors => {
  const isDark = useStore((s) => s.isDark);
  return isDark ? darkColors : lightColors;
};
