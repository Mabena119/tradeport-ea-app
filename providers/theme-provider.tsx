import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'cyan';

export interface ThemeColors {
  accent: string;
  accentRgb: string;
  accentLight: string;
  accentGlow: string;
  gradientStart: string;
  textMuted: string;
}

const THEMES: Record<ThemeName, ThemeColors> = {
  red: {
    accent: '#FF1A1A',
    accentRgb: '255, 26, 26',
    accentLight: '#FFB3B3',
    accentGlow: '#FF1A1A',
    gradientStart: 'rgba(255, 26, 26,',
    textMuted: 'rgba(255, 179, 179, 0.6)',
  },
  blue: {
    accent: '#1A8FFF',
    accentRgb: '26, 143, 255',
    accentLight: '#B3D9FF',
    accentGlow: '#1A8FFF',
    gradientStart: 'rgba(26, 143, 255,',
    textMuted: 'rgba(179, 217, 255, 0.6)',
  },
  green: {
    accent: '#1AFF5E',
    accentRgb: '26, 255, 94',
    accentLight: '#B3FFD0',
    accentGlow: '#1AFF5E',
    gradientStart: 'rgba(26, 255, 94,',
    textMuted: 'rgba(179, 255, 208, 0.6)',
  },
  purple: {
    accent: '#A855F7',
    accentRgb: '168, 85, 247',
    accentLight: '#DDB4FE',
    accentGlow: '#A855F7',
    gradientStart: 'rgba(168, 85, 247,',
    textMuted: 'rgba(221, 180, 254, 0.6)',
  },
  orange: {
    accent: '#FF8C1A',
    accentRgb: '255, 140, 26',
    accentLight: '#FFD1A3',
    accentGlow: '#FF8C1A',
    gradientStart: 'rgba(255, 140, 26,',
    textMuted: 'rgba(255, 209, 163, 0.6)',
  },
  cyan: {
    accent: '#06D6E0',
    accentRgb: '6, 214, 224',
    accentLight: '#A5F3FC',
    accentGlow: '#06D6E0',
    gradientStart: 'rgba(6, 214, 224,',
    textMuted: 'rgba(165, 243, 252, 0.6)',
  },
};

const THEME_STORAGE_KEY = 'tradeport_theme';

export interface ThemeState {
  themeName: ThemeName;
  theme: ThemeColors;
  setThemeName: (name: ThemeName) => void;
}

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
  const [themeName, setThemeNameState] = useState<ThemeName>('red');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved && saved in THEMES) {
        setThemeNameState(saved as ThemeName);
      }
    }).catch(() => {});
  }, []);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch(() => {});
  }, []);

  const theme = THEMES[themeName];

  return { themeName, theme, setThemeName };
});

export { THEMES };
