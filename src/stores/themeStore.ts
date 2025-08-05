import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type ActualTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  actualTheme: ActualTheme;
  systemTheme: ActualTheme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSystemTheme: (theme: ActualTheme) => void;
  initialize: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const getSystemTheme = (): ActualTheme => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDOM = (theme: ActualTheme) => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      theme === 'dark' ? '#1A1A1A' : '#006A4E'
    );
  }
};

const getActualTheme = (theme: Theme, systemTheme: ActualTheme): ActualTheme => {
  if (theme === 'system') return systemTheme;
  return theme;
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        actualTheme: 'light',
        systemTheme: 'light',

        setTheme: (theme: Theme) => {
          const state = get();
          const actualTheme = getActualTheme(theme, state.systemTheme);
          
          set({ theme, actualTheme });
          applyThemeToDOM(actualTheme);
        },

        toggleTheme: () => {
          const state = get();
          
          if (state.theme === 'system') {
            // If currently system, toggle to opposite of system theme
            const newTheme = state.systemTheme === 'light' ? 'dark' : 'light';
            get().setTheme(newTheme);
          } else {
            // If currently manual, toggle to opposite
            const newTheme = state.actualTheme === 'light' ? 'dark' : 'light';
            get().setTheme(newTheme);
          }
        },

        setSystemTheme: (systemTheme: ActualTheme) => {
          const state = get();
          const actualTheme = getActualTheme(state.theme, systemTheme);
          
          set({ systemTheme, actualTheme });
          
          // Only apply if using system theme
          if (state.theme === 'system') {
            applyThemeToDOM(actualTheme);
          }
        },

        initialize: () => {
          const systemTheme = getSystemTheme();
          const state = get();
          const actualTheme = getActualTheme(state.theme, systemTheme);
          
          set({ systemTheme, actualTheme });
          applyThemeToDOM(actualTheme);
          
          // Listen for system theme changes
          if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleSystemThemeChange = (e: MediaQueryListEvent) => {
              const newSystemTheme = e.matches ? 'dark' : 'light';
              get().setSystemTheme(newSystemTheme);
            };
            
            // Modern browsers
            if (mediaQuery.addEventListener) {
              mediaQuery.addEventListener('change', handleSystemThemeChange);
            } else {
              // Fallback for older browsers
              mediaQuery.addListener(handleSystemThemeChange);
            }
          }
        },
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);

// Helper hooks
export const useTheme = () => {
  const { theme, actualTheme, setTheme, toggleTheme } = useThemeStore();

  return {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    isSystem: theme === 'system',
  };
};

export const useIsDarkMode = () => {
  return useThemeStore(state => state.actualTheme === 'dark');
};

// Theme initialization function to be called in App component
export const initializeTheme = () => {
  useThemeStore.getState().initialize();
};

// Utility function to get current theme colors for dynamic styling
export const getThemeColors = (actualTheme: ActualTheme) => {
  if (actualTheme === 'dark') {
    return {
      primary: '#8FD4BE', // mint-fresh for dark mode
      secondary: '#D4A373', // earthy-yellow
      background: '#1A1A1A',
      surface: '#2D2D2D',
      text: '#F5ECD9', // earthy-beige
      textMuted: '#A0A0A0',
      border: '#404040',
    };
  }
  
  return {
    primary: '#006A4E', // bottle-green
    secondary: '#8C644A', // earthy-brown
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#3A2A1F', // text-dark
    textMuted: '#6B7280',
    border: '#E5E7EB',
  };
};