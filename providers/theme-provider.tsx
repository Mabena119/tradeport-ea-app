import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'cyan';
export type GlassMode = 'neon' | 'minimal' | 'liquid' | 'commander';
export type FontFamily = 'system' | 'mono' | 'rounded' | 'condensed' | 'serif';

const FONT_MAP: Record<FontFamily, string> = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
  mono: '"Fira Code", "SF Mono", "Courier New", monospace',
  rounded: '"Nunito", "SF Pro Rounded", system-ui, sans-serif',
  condensed: '"Roboto Condensed", "SF Pro Condensed", system-ui, sans-serif',
  serif: '"Playfair Display", "New York", "Georgia", serif',
};

// Google Fonts URL — loaded once on web
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&family=Roboto+Condensed:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800;900&display=swap';

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
const GLASS_STORAGE_KEY = 'tradeport_glass_mode';
const FONT_STORAGE_KEY = 'tradeport_font';

export interface ThemeState {
  themeName: ThemeName;
  theme: ThemeColors;
  setThemeName: (name: ThemeName) => void;
  glassMode: GlassMode;
  setGlassMode: (mode: GlassMode) => void;
  fontFamily: FontFamily;
  fontFamilyCSS: string;
  setFontFamily: (f: FontFamily) => void;
}

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
  const [themeName, setThemeNameState] = useState<ThemeName>('red');
  const [glassMode, setGlassModeState] = useState<GlassMode>('commander');
  const [fontFamily, setFontFamilyState] = useState<FontFamily>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved && saved in THEMES) setThemeNameState(saved as ThemeName);
    }).catch(() => {});
    AsyncStorage.getItem(GLASS_STORAGE_KEY).then((saved) => {
      if (saved === 'neon' || saved === 'minimal' || saved === 'liquid' || saved === 'commander') setGlassModeState(saved);
    }).catch(() => {});
    AsyncStorage.getItem(FONT_STORAGE_KEY).then((saved) => {
      if (saved && saved in FONT_MAP) setFontFamilyState(saved as FontFamily);
    }).catch(() => {});
  }, []);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch(() => {});
  }, []);

  const setGlassMode = useCallback((mode: GlassMode) => {
    setGlassModeState(mode);
    AsyncStorage.setItem(GLASS_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const setFontFamily = useCallback((f: FontFamily) => {
    setFontFamilyState(f);
    AsyncStorage.setItem(FONT_STORAGE_KEY, f).catch(() => {});
  }, []);

  const theme = THEMES[themeName];
  const fontFamilyCSS = FONT_MAP[fontFamily];

  return { themeName, theme, setThemeName, glassMode, setGlassMode, fontFamily, fontFamilyCSS, setFontFamily };
});

export { THEMES, FONT_MAP, GOOGLE_FONTS_URL };
