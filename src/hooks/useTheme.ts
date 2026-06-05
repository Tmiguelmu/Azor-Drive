import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './useAppDispatch';
import { toggleTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((s) => s.theme.isDark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [isDark]);

  return { isDark, toggle: () => dispatch(toggleTheme()) };
};
