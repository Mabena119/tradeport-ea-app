import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from '@/providers/theme-provider';

const VIDEO_MAP: Record<string, string> = {
  video1: '/videos/bg-1.mp4',
  video2: '/videos/bg-2.mp4',
  video3: '/videos/bg-3.mp4',
  video4: '/videos/bg-4.mp4',
};

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

  // Manage video playback + fix freeze/loop issue
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const isVideo = bgType === 'video1' || bgType === 'video2' || bgType === 'video3' || bgType === 'video4' || bgType === 'custom';
    if (!isVideo) return;

    const setup = () => {
      const el = document.getElementById('tradeport-bg-video') as HTMLVideoElement;
      if (!el) return;
      videoRef.current = el;
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');

      // Fix freeze: force loop by seeking back to start on ended
      const onEnded = () => { el.currentTime = 0; el.play().catch(() => {}); };
      // Fix freeze: restart on pause (some browsers pause background tabs)
      const onPause = () => { if (document.visibilityState !== 'hidden') el.play().catch(() => {}); };
      // Fix freeze: resume when tab becomes visible
      const onVisible = () => { if (document.visibilityState === 'visible' && el.paused) el.play().catch(() => {}); };

      el.removeEventListener('ended', onEnded);
      el.removeEventListener('pause', onPause);
      el.addEventListener('ended', onEnded);
      el.addEventListener('pause', onPause);
      document.removeEventListener('visibilitychange', onVisible);
      document.addEventListener('visibilitychange', onVisible);

      el.play().catch(() => {
        // Autoplay blocked — play on first user interaction
        const playOnClick = () => { el.play().catch(() => {}); document.removeEventListener('click', playOnClick); };
        document.addEventListener('click', playOnClick, { once: true });
      });
    };

    setup();
    // Retry in case DOM isn't ready yet
    const t1 = setTimeout(setup, 300);
    const t2 = setTimeout(setup, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [bgType]);

  if (Platform.OS !== 'web') return null;
  if (bgType === 'off') return null;

  const filter = isNeon ? 'brightness(0.15) saturate(0.5) blur(2px)' : isLiquid ? 'brightness(0.18) saturate(0.45) blur(1px)' : isCmd ? 'brightness(0.35) saturate(0.8)' : 'brightness(0.2) saturate(0.4) blur(1px)';

  // Video backgrounds
  const videoSrc = VIDEO_MAP[bgType];
  if (videoSrc) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' } as any}>
        <video
          id="tradeport-bg-video"
          key={bgType}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter } as any}
        />
      </View>
    );
  }

  // Custom video (user uploaded — stored in localStorage as blob URL or data URL)
  if (bgType === 'custom') {
    const customSrc = typeof window !== 'undefined' ? (window as any).__tradeport_custom_video_url || '' : '';
    if (!customSrc) return null;
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' } as any}>
        <video
          id="tradeport-bg-video"
          key="custom"
          src={customSrc}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter } as any}
        />
      </View>
    );
  }

  // Robot image (default)
  if (!eaImage) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundImage: 'url(' + eaImage + ')', backgroundSize: 'cover', backgroundPosition: 'center top', filter } as any} />
  );
}
