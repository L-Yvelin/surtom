import { useState, useEffect, useRef } from 'react';
import { Theme } from '../components/Main/Tools/Tools';

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('theme') as Theme) || Theme.DARK);

  const lastSetTimeRef = useRef<number>(Date.now());

  const updateTheme = (newTheme: Theme) => {
    const now = Date.now();
    if (now - lastSetTimeRef.current >= 1050) {
      lastSetTimeRef.current = now;
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme as Theme);
    }
  }, []);

  return { theme, setTheme: updateTheme };
};

export default useTheme;
