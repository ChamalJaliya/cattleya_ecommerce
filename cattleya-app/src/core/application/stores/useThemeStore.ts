import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'orchid';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'orchid',
      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.className = theme;
      },
      toggleTheme: () => {
        const { theme } = get();
        const themes: Theme[] = ['light', 'dark', 'orchid'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        get().setTheme(nextTheme);
      },
    }),
    {
      name: 'cattleya-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
          document.documentElement.className = state.theme;
        }
      },
    }
  )
);

// Theme configurations
export const themeConfig = {
  light: {
    name: 'Light',
    description: 'Clean and bright interface',
    colors: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-gray-600',
      background: 'bg-white',
      surface: 'bg-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
    }
  },
  dark: {
    name: 'Dark',
    description: 'Easy on the eyes in low light',
    colors: {
      primary: 'bg-blue-500',
      primaryHover: 'hover:bg-blue-600',
      secondary: 'bg-gray-700',
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
    }
  },
  orchid: {
    name: 'Orchid',
    description: 'Beautiful purple and pink theme',
    colors: {
      primary: 'bg-gradient-to-r from-purple-600 to-pink-600',
      primaryHover: 'hover:shadow-lg hover:shadow-purple-500/25',
      secondary: 'bg-gradient-to-r from-green-500 to-emerald-500',
      background: 'bg-white',
      surface: 'bg-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
    }
  }
};

// Theme utility functions
export const getThemeClasses = (theme: Theme) => themeConfig[theme].colors;

export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.className = theme;
}; 