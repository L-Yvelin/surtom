import { create } from 'zustand';
import { Theme } from '../theme/theme';

const STORAGE_KEY = 'theme';

function isValidTheme(value: string | null): value is Theme {
  return value !== null && Object.values(Theme).includes(value as Theme);
}

interface ThemeState {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
}

const storedTheme = localStorage.getItem(STORAGE_KEY);

const useThemeStore = create<ThemeState>((set) => ({
  theme: isValidTheme(storedTheme) ? storedTheme : Theme.DARK,
  setTheme: (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    set({ theme: newTheme });
  },
}));

const useTheme = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  return { theme, setTheme };
};

export default useTheme;
