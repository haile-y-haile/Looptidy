import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import type { AppearanceMode } from '../lib/preferences';
import { getAppearanceMode, setAppearanceMode } from '../lib/preferences';
import { darkColors, lightColors, radius, shadows, spacing, typography } from '../lib/theme';

type ThemeColors = typeof lightColors;

export interface Theme {
  mode: AppearanceMode;
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
}

interface ThemeContextValue {
  theme: Theme;
  setMode: (mode: AppearanceMode) => Promise<void>;
  hydrationDone: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<AppearanceMode>('system');
  const [hydrationDone, setHydrationDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getAppearanceMode();
      if (cancelled) return;
      setModeState(stored);
      setHydrationDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const theme = useMemo<Theme>(() => {
    const colors = isDark ? darkColors : lightColors;
    return {
      mode,
      isDark,
      colors,
      spacing,
      radius,
      typography,
      shadows,
    };
  }, [isDark, mode]);

  const setMode = useCallback(async (next: AppearanceMode) => {
    setModeState(next);
    await setAppearanceMode(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setMode, hydrationDone }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}

