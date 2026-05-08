import { create } from 'zustand';
import { Theme } from '../theme/theme';

const STORAGE_KEY = 'theme';
const THROTTLE_MS = 1050;

interface ThemeState {
  theme: Theme;
  lastSetTime: number;
  setTheme: (newTheme: Theme) => void;
}

const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem(STORAGE_KEY) as Theme) || Theme.DARK,
  lastSetTime: 0,
  setTheme: (newTheme) => {
    const now = Date.now();
    if (now - get().lastSetTime < THROTTLE_MS) return;
    localStorage.setItem(STORAGE_KEY, newTheme);
    set({ theme: newTheme, lastSetTime: now });
  },
}));

const useTheme = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  return { theme, setTheme };
};

export default useTheme;
