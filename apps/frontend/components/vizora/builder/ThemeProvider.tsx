'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { ThemeConfig } from '@/lib/vizora/types';

const ThemeContext = createContext<ThemeConfig | null>(null);

export function ThemeProvider({ theme, children }: { theme: ThemeConfig; children: React.ReactNode }) {
  const value = useMemo(() => theme, [theme.primaryColor, theme.chartPalette, theme.fontSize, theme.borderRadius]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeConfig {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
