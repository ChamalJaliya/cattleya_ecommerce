'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/core/application/stores/useThemeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
    
    // Apply theme-specific body classes
    const body = document.body;
    body.classList.remove('light', 'dark', 'orchid');
    body.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
} 