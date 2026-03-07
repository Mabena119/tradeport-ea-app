import React, { useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from '@/providers/theme-provider';

interface PageBackgroundProps {
  eaImage?: string | null;
}

export function PageBackground({ eaImage }: PageBackgroundProps) {
  const { theme, glassMode, bgType } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const a = theme.accentRgb;
  const isNeon = glassMode === 'neon';
  const isLiquid = glassMode === 'liquid';
  const isCmd = glassMode === 'commander';

  // Auto-play video when bgType changes
  useEffect(() => {
    if (Platform.OS !== 'web' || bgType !== 'video1') return;
    const tryPlay = () => {
      const el = document.getElementById('tradeport-bg-video') as HTMLVideoElement;
      if (el) { el.muted = true; el.loop = true; el.playsInline = true; el.play().catch(() => {}); videoRef.current = el; }
    };
    tryPlay();
    // Retry in case DOM isn't ready
    const t = setTimeout(tryPlay, 500);
    return () => clearTimeout(t);
  }, [bgType]);

  if (Platform.OS !== 'web') return null;
  if (bgType === 'off') return null;

  const filter = isNeon ? 'brightness(0.15) saturate(0.5) blur(2px)' : isLiquid ? 'brightness(0.18) saturate(0.45) blur(1px)' : isCmd ? 'brightness(0.35) saturate(0.8)' : 'brightness(0.2) saturate(0.4) blur(1px)';

  if (bgType === 'video1') {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' } as any}>
        <video
          id="tradeport-bg-video"
          src="/videos/bg-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter } as any}
        />
      </View>
    );
  }

  // Default: robot image
  if (!eaImage) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundImage: 'url(' + eaImage + ')', backgroundSize: 'cover', backgroundPosition: 'center top', filter } as any} />
  );
}
