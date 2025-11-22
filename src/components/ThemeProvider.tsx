'use client';

import { createTheme, CssBaseline, ThemeProvider as MUIThemeProvider } from '@mui/material';
import { usePathname } from 'next/navigation';
import { createContext, use, useEffect, useMemo, useState } from 'react';

// Extend MUI theme to include custom sidebar colors
declare module '@mui/material/styles' {
  type Palette = {
    sidebar: {
      background: string;
      textPrimary: string;
      textSecondary: string;
    };
  };
  type PaletteOptions = {
    sidebar?: {
      background?: string;
      textPrimary?: string;
      textSecondary?: string;
    };
  };
}

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Initialize mode from localStorage if available, otherwise default to 'light'
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        return storedTheme;
      }
    }
    return 'light';
  });

  const [loading, setLoading] = useState(true);

  // Extract locale from pathname
  const locale = pathname?.match(/^\/([a-z]{2})\//)?.[1] || 'en';

  // Initialize theme from localStorage (if not already set in useState initializer)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark') && storedTheme !== mode) {
        setMode(storedTheme);
      }
      setLoading(() => false);
    }
  }, [mode]);

  // Fetch user theme preference from API (works if user is authenticated, fails silently if not)
  useEffect(() => {
    if (!loading) {
      fetch(`/${locale}/api/users/preferences`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return null;
        })
        .then((data) => {
          if (data?.theme) {
            // Handle 'system' theme by checking system preference
            if (data.theme === 'system') {
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const effectiveTheme: ThemeMode = systemPrefersDark ? 'dark' : 'light';
              setMode(effectiveTheme);
              localStorage.setItem('theme', effectiveTheme);
            } else if (data.theme === 'light' || data.theme === 'dark') {
              setMode(data.theme);
              localStorage.setItem('theme', data.theme);
            }
          }
        })
        .catch(() => {
          // If API fails (user not authenticated or API not available), keep current theme from localStorage
        });
    }
  }, [loading, locale]);

  const toggleTheme = useMemo(() => async () => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);

    // Update user preference in database if user is authenticated (API will handle auth check)
    try {
      await fetch(`/${locale}/api/users/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newMode }),
      });
    } catch {
      // Silently fail if user is not authenticated or API is not available
      // Theme is already saved to localStorage, so it will persist
    }
  }, [mode, locale]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                background: {
                  default: '#f8f9fa',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#1a1a1a',
                  secondary: '#666666',
                },
                action: {
                  hover: 'rgba(0, 0, 0, 0.04)',
                  selected: 'rgba(0, 0, 0, 0.08)',
                },
                primary: {
                  main: '#60a5fa',
                  light: '#93c5fd',
                  dark: '#3b82f6',
                  contrastText: '#ffffff',
                },
              }
            : {
                // Dark mode palette - Cursor theme
                background: {
                  default: '#252526', // Grayer color for main content
                  paper: '#1e1e1e', // Darker color for panels/cards
                },
                text: {
                  primary: '#cccccc',
                  secondary: 'rgba(204, 204, 204, 0.7)',
                },
                action: {
                  hover: 'rgba(255, 255, 255, 0.08)',
                  selected: 'rgba(255, 255, 255, 0.12)',
                },
                primary: {
                  main: '#60a5fa',
                  light: '#93c5fd',
                  dark: '#3b82f6',
                  contrastText: '#ffffff',
                },
              }),
          // Custom sidebar colors
          sidebar: {
            background: mode === 'dark' ? '#1e1e1e' : '#1a1d24', // Very dark, slightly less desaturated blue-gray
            textPrimary: mode === 'dark' ? '#cccccc' : '#ffffff', // Light text for dark sidebar in light mode
            textSecondary: mode === 'dark' ? 'rgba(204, 204, 204, 0.7)' : 'rgba(255, 255, 255, 0.7)', // Light secondary text for dark sidebar in light mode
          },
        },
      }),
    [mode],
  );

  // Provide theme context value
  const themeContextValue = useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode, toggleTheme]);

  // Always provide the context, even during loading
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeContext value={themeContextValue}>
        {children}
      </ThemeContext>
    </MUIThemeProvider>
  );
}
