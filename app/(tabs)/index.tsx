import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, Platform, Dimensions, SafeAreaView, Animated } from 'react-native';
import { Play, Square, TrendingUp, Trash2, Plus, Menu } from 'lucide-react-native';
import { router } from 'expo-router';
import { RobotLogo } from '@/components/robot-logo';

import { useApp } from '@/providers/app-provider';
import { useTheme } from '@/providers/theme-provider';
import { useSidebar } from '@/providers/sidebar-provider';
import type { EA } from '@/providers/app-provider';

export default function HomeScreen() {
  const { eas, isFirstTime, setIsFirstTime, removeEA, isBotActive, setBotActive, setActiveEA, user } = useApp();
  const { theme } = useTheme();
  const { toggle: toggleSidebar } = useSidebar();

  // Spinning neon border animations
  const cardSpin = useRef(new Animated.Value(0)).current;
  const tradeSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cardLoop = Animated.loop(
      Animated.timing(cardSpin, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      })
    );
    const tradeLoop = Animated.loop(
      Animated.timing(tradeSpin, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      })
    );
    cardLoop.start();
    tradeLoop.start();
    return () => { cardLoop.stop(); tradeLoop.stop(); };
  }, []);

  const cardSpinDeg = cardSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const tradeSpinDeg = tradeSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const a = theme.accentRgb;
  const ac = theme.accent;
  const ag = theme.accentGlow;

  const primaryEA = Array.isArray(eas) && eas.length > 0 ? eas[0] : null;
  const otherEAs = Array.isArray(eas) ? eas.slice(1) : [];

  console.log('HomeScreen render - EAs count:', eas?.length || 0, 'Primary EA:', primaryEA?.name || 'none');

  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    if (!isFirstTime) {
      if (!user) {
        console.log('Navigation guard: No user data found, redirecting to login');
        router.replace('/login');
      } else if (eas.length === 0) {
        console.log('Navigation guard: User authenticated but no EAs found, redirecting to license');
        router.replace('/license');
      }
    }
  }, [isFirstTime, user, eas.length]);

  const getEAImageUrl = useCallback((ea: EA | null): string | null => {
    if (!ea || !ea.userData || !ea.userData.owner) {
      console.log('EA Image Debug: Missing EA data or owner');
      return null;
    }
    const raw = (ea.userData.owner.logo || '').toString().trim();
    if (!raw) {
      console.log('EA Image Debug: No logo found for EA:', ea.name);
      return null;
    }
    if (/^https?:\/\//i.test(raw)) {
      console.log('EA Image Debug: Using absolute URL:', raw);
      return raw;
    }
    const filename = raw.replace(/^\/+/, '');
    const base = 'https://tradeportea.com/admin/uploads';
    const fullUrl = `${base}/${filename}`;
    console.log('EA Image Debug: Constructed URL:', fullUrl, 'from filename:', filename);
    return fullUrl;
  }, []);

  const primaryEAImage = useMemo(() => getEAImageUrl(primaryEA), [getEAImageUrl, primaryEA]);

  const handleStartNow = () => {
    console.log('Start Now pressed, navigating to login...');
    try {
      setIsFirstTime(false);
      router.push('/login');
    } catch (error) {
      console.error('Error navigating to login:', error);
    }
  };

  const handleAddNewEA = () => {
    router.push('/license');
  };

  const handleRemoveActiveBot = async () => {
    if (primaryEA && primaryEA.id) {
      try {
        console.log('Removing EA:', primaryEA.name, primaryEA.id);
        const success = await removeEA(primaryEA.id);
        if (success) {
          console.log('EA removed successfully, navigating to license screen');
          router.push('/license');
        } else {
          console.error('Failed to remove EA');
        }
      } catch (error) {
        console.error('Error removing EA:', error);
      }
    }
  };

  const handleQuotes = () => {
    router.push('/(tabs)/quotes');
  };

  /* ============================================================
     BUBBLE HELPER
     ============================================================ */
  const renderBubbles = (layout: Array<{t: string; l: string; s: number; o?: number}>) => (
    <View style={styles.bubblesContainer} pointerEvents="none">
      {layout.map((b, i) => (
        <View
          key={i}
          style={[
            styles.bubble,
            { top: b.t, left: b.l, width: b.s, height: b.s, borderRadius: b.s / 2, opacity: b.o ?? 1 },
            Platform.OS === 'web' && { background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.04) 60%, transparent 70%)' },
          ]}
        />
      ))}
    </View>
  );

  const heroBubbles = [
    { t: '8%', l: '78%', s: 20 },
    { t: '14%', l: '88%', s: 14 },
    { t: '5%', l: '85%', s: 9 },
    { t: '12%', l: '68%', s: 16 },
    { t: '20%', l: '75%', s: 7 },
    { t: '6%', l: '60%', s: 11 },
  ];

  const cardBubbles = [
    { t: '10%', l: '75%', s: 16 },
    { t: '18%', l: '85%', s: 11 },
    { t: '6%', l: '82%', s: 7 },
    { t: '14%', l: '65%', s: 13 },
    { t: '24%', l: '72%', s: 5 },
    { t: '8%', l: '58%', s: 9 },
    { t: '28%', l: '80%', s: 4 },
    { t: '16%', l: '50%', s: 14, o: 0.5 },
  ];

  const pillBubbles = [
    { t: '15%', l: '80%', s: 12 },
    { t: '30%', l: '70%', s: 8 },
    { t: '10%', l: '88%', s: 6 },
    { t: '40%', l: '75%', s: 10, o: 0.5 },
  ];

  // Show splash screen for first-time users
  if (isFirstTime) {
    return (
      <View style={[styles.splashContainer, Platform.OS === 'web' && { backgroundImage: 'linear-gradient(135deg, rgba(' + a + ', 0.95) 0%, rgba(' + a + ', 0.7) 20%, rgba(' + a + ', 0.4) 40%, rgba(' + a + ', 0.2) 60%, rgba(' + a + ', 0.1) 80%, rgba(0, 0, 0, 0.8) 95%, rgba(0, 0, 0, 1) 100%)' }]}>
        <View style={styles.splashContent}>
          <View style={styles.logoContainer}>
            <Image
              testID="splash-app-icon"
              source={require('../../assets/images/icon.png')}
              style={{ width: 120, height: 120, borderRadius: 24 }}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: ac }]}>TRADE PORT EA</Text>
          </View>
          <Text style={styles.description}>
            A cutting-edge mobile hosting platform designed to empower traders with a secure, reliable, and user-friendly environment for running their automated trading systems. Seamlessly manage your Expert Advisors (EAs) on the go, ensuring optimal performance and peace of mind.
          </Text>
          <TouchableOpacity style={[styles.splashStartButton, { borderColor: ac, shadowColor: ac }]} onPress={handleStartNow}>
            <Text style={[styles.startButtonText, { color: ac }]}>START NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' && { backgroundImage: 'linear-gradient(135deg, rgba(' + a + ', 0.95) 0%, rgba(' + a + ', 0.85) 10%, rgba(' + a + ', 0.75) 20%, rgba(' + a + ', 0.65) 30%, rgba(' + a + ', 0.55) 40%, rgba(' + a + ', 0.45) 50%, rgba(' + a + ', 0.35) 60%, rgba(' + a + ', 0.25) 70%, rgba(' + a + ', 0.15) 80%, rgba(' + a + ', 0.08) 90%, rgba(' + a + ', 0.03) 95%, rgba(0, 0, 0, 1) 100%)' }]}>
      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar} activeOpacity={0.7}>
        <Menu color="rgba(255,255,255,0.8)" size={22} />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {primaryEA ? (
          <View style={styles.mainEAContainer}>

            {/* ========== 1. HERO IMAGE — STANDALONE ========== */}
            <View style={styles.heroWrap}>
              <Animated.View style={[styles.heroNeonSpinner, { transform: [{ rotate: cardSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, ' + ac + ' 40deg, rgba(' + a + ', 0.5) 80deg, transparent 120deg, transparent 180deg, ' + ac + ' 220deg, rgba(' + a + ', 0.5) 260deg, transparent 300deg, transparent 360deg)' }]} />
              <Animated.View style={[styles.heroNeonGlow, { transform: [{ rotate: cardSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, rgba(' + a + ', 0.4) 40deg, transparent 120deg, transparent 180deg, rgba(' + a + ', 0.4) 220deg, transparent 300deg, transparent 360deg)' }]} />
              {primaryEAImage && !logoError ? (
                <ImageBackground
                  testID="ea-hero-bg"
                  source={{ uri: primaryEAImage }}
                  style={[styles.hero, Platform.OS === 'web' && { boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(' + a + ', 0.25), 0 0 80px rgba(' + a + ', 0.1)' }]}
                  imageStyle={styles.heroImageStyle}
                  onError={(error) => { console.log('EA Image Error:', error); setLogoError(true); }}
                  resizeMode="cover"
                >
                  {renderBubbles(heroBubbles)}
                  <View style={[styles.heroRefraction, Platform.OS === 'web' && { background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)' }]} />
                  {/* Bot name overlaid at bottom of hero */}
                  <View style={styles.heroNameOverlay}>
                    <Text testID="ea-title" style={styles.botMainName} numberOfLines={3} ellipsizeMode="tail">{primaryEA.name}</Text>
                  </View>
                </ImageBackground>
              ) : (
                <View style={[styles.heroFallback, Platform.OS === 'web' && { boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(' + a + ', 0.25), 0 0 80px rgba(' + a + ', 0.1)' }]}>
                  <Image testID="fallback-app-icon" source={require('../../assets/images/icon.png')} style={styles.fallbackIcon} resizeMode="contain" />
                  {renderBubbles(heroBubbles)}
                  <View style={[styles.heroRefraction, Platform.OS === 'web' && { background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)' }]} />
                  <View style={styles.heroNameOverlay}>
                    <Text testID="ea-title" style={styles.botMainName} numberOfLines={3} ellipsizeMode="tail">{primaryEA.name}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* ========== 2. TRADING PANEL — SEPARATE CARD ========== */}
            <View style={styles.neonWrap}>
              <Animated.View style={[styles.neonSpinner, { transform: [{ rotate: cardSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, ' + ac + ' 40deg, rgba(' + a + ', 0.5) 80deg, transparent 120deg, transparent 180deg, ' + ac + ' 220deg, rgba(' + a + ', 0.5) 260deg, transparent 300deg, transparent 360deg)' }]} />
              <Animated.View style={[styles.neonGlowSpinner, { transform: [{ rotate: cardSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, rgba(' + a + ', 0.4) 40deg, transparent 120deg, transparent 180deg, rgba(' + a + ', 0.4) 220deg, transparent 300deg, transparent 360deg)' }]} />
              <View style={[styles.liquidInner, Platform.OS === 'web' && { background: 'radial-gradient(ellipse 120% 40% at 30% 25%, rgba(255,255,255,0.25) 0%, transparent 70%), linear-gradient(180deg, rgba(' + a + ', 0.12) 0%, rgba(' + a + ', 0.08) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%)', backdropFilter: 'blur(80px) saturate(200%)', WebkitBackdropFilter: 'blur(80px) saturate(200%)', boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.25), inset 0 -4px 12px rgba(0,0,0,0.4), inset 0 40px 60px -20px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(' + a + ', 0.2), 0 0 80px rgba(' + a + ', 0.08)' }]}>
                {renderBubbles(cardBubbles)}
                <View style={[styles.refraction, Platform.OS === 'web' && { background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 100%)' }]} />
                <View style={[styles.meniscus, Platform.OS === 'web' && { background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 100%)' }]} />
                <View style={styles.bottomActions}>
                  <TouchableOpacity testID="action-quotes" style={[styles.actionButton, styles.secondaryButton]} onPress={handleQuotes}>
                    <View style={styles.buttonIconContainer}>
                      <TrendingUp color={ac} size={18} />
                    </View>
                    <Text style={styles.secondaryButtonText}>QUOTES</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    testID="action-start"
                    style={[styles.actionButton, styles.tradeButton, isBotActive && styles.tradeButtonActive]}
                    onPress={() => {
                      console.log('Start/Stop button pressed, current state:', isBotActive);
                      try { setBotActive(!isBotActive); } catch (error) { console.error('Error:', error); }
                    }}
                  >
                    <View style={styles.tradeIconOuter}>
                      <Animated.View style={[styles.tradeIconSpinner, { transform: [{ rotate: tradeSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, ' + ac + ' 60deg, rgba(' + a + ', 0.5) 120deg, transparent 180deg, transparent 240deg, ' + ac + ' 300deg, transparent 360deg)' }]} />
                      <Animated.View style={[styles.tradeIconGlow, { transform: [{ rotate: tradeSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, rgba(' + a + ', 0.5) 60deg, transparent 180deg, rgba(' + a + ', 0.5) 300deg, transparent 360deg)' }]} />
                      <View style={styles.tradeIconInner}>
                        {isBotActive ? (
                          <Square color={ac} size={20} fill={ac} style={Platform.OS === 'web' ? { filter: 'drop-shadow(0 0 6px rgba(' + a + ', 0.7)) drop-shadow(0 0 14px rgba(' + a + ', 0.4))' } : {}} />
                        ) : (
                          <Play color={ac} size={22} fill={ac} style={Platform.OS === 'web' ? { filter: 'drop-shadow(0 0 6px rgba(' + a + ', 0.7)) drop-shadow(0 0 14px rgba(' + a + ', 0.4))' } : {}} />
                        )}
                      </View>
                    </View>
                    <Text style={[styles.tradeButtonText, isBotActive && styles.tradeButtonTextActive]}>
                      {isBotActive ? 'STOP' : 'TRADE'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity testID="action-remove" style={[styles.actionButton, styles.removeButton]} onPress={handleRemoveActiveBot}>
                    <View style={styles.buttonIconContainer}>
                      <Trash2 color={ac} size={18} />
                    </View>
                    <Text style={styles.removeButtonText}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mainEAContainer}>
            <RobotLogo size={200} />
            <View style={styles.botInfoContainer}>
              <Text style={styles.botMainName}>NO EA CONNECTED</Text>
              <Text style={styles.botDescription}>ADD A LICENSE KEY TO GET STARTED</Text>
            </View>
          </View>
        )}

        <View style={styles.connectedBotsSection}>
          {otherEAs.length > 0 && (
            <>
              <View testID="connected-bots-header" style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>CONNECTED BOTS</Text>
                <View testID="connected-bots-count" style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{eas.length}</Text>
                </View>
              </View>
              {otherEAs.map((ea, index) => (
                <TouchableOpacity
                  key={`${ea.id}-${index}`}
                  style={styles.botCard}
                  onPress={async () => {
                    try { console.log('Switching active EA to:', ea.name); await setActiveEA(ea.id); } catch (error) { console.error('Failed:', error); }
                  }}
                >
                  <View style={styles.botCardContent}>
                    <View style={styles.botIcon}>
                      {getEAImageUrl(ea as unknown as EA) ? (
                        <Image testID={`ea-logo-small-${index}`} source={{ uri: getEAImageUrl(ea as unknown as EA) as string }} style={styles.smallLogo} />
                      ) : (
                        <View style={styles.robotFace}><View style={styles.robotEye} /><View style={styles.robotEye} /></View>
                      )}
                    </View>
                    <Text style={styles.botName} numberOfLines={2} ellipsizeMode="tail">{ea.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ========== 3. ADD EA — LIQUID GLASS PILL ========== */}
          <View style={styles.neonWrapPill}>
            <Animated.View style={[styles.neonSpinnerPill, { transform: [{ rotate: cardSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, ' + ac + ' 40deg, rgba(' + a + ', 0.5) 80deg, transparent 120deg, transparent 180deg, ' + ac + ' 220deg, rgba(' + a + ', 0.5) 260deg, transparent 300deg, transparent 360deg)' }]} />
            <Animated.View style={[styles.neonGlowSpinnerPill, { transform: [{ rotate: cardSpinDeg }] }, Platform.OS === 'web' && { backgroundImage: 'conic-gradient(from 0deg, transparent 0deg, rgba(' + a + ', 0.4) 40deg, transparent 120deg, transparent 180deg, rgba(' + a + ', 0.4) 220deg, transparent 300deg, transparent 360deg)' }]} />
            <TouchableOpacity style={[styles.liquidInnerPill, Platform.OS === 'web' && { background: 'radial-gradient(ellipse 120% 40% at 30% 25%, rgba(255,255,255,0.25) 0%, transparent 70%), linear-gradient(180deg, rgba(' + a + ', 0.12) 0%, rgba(' + a + ', 0.08) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%)', backdropFilter: 'blur(80px) saturate(200%)', WebkitBackdropFilter: 'blur(80px) saturate(200%)', boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.25), inset 0 -4px 12px rgba(0,0,0,0.4), inset 0 40px 60px -20px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(' + a + ', 0.2), 0 0 80px rgba(' + a + ', 0.08)' }]} onPress={handleAddNewEA} activeOpacity={0.7}>
              {renderBubbles(pillBubbles)}
              <View style={[styles.refractionPill, Platform.OS === 'web' && { background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 100%)' }]} />
              <View style={[styles.meniscusPill, Platform.OS === 'web' && { background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 100%)' }]} />
              <Plus color={ac} size={20} style={{ zIndex: 5 }} />
              <View style={[styles.addEATextContainer, { zIndex: 5 }]}>
                <Text style={styles.addEATitle}>ADD A NEW EA</Text>
                <Text style={styles.addEASubtitle}>HAVE A VALID LICENSE KEY</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ========== 4. ACTIVE EA INFO CARD ========== */}
          {primaryEA && (
            <View style={[styles.eaInfoCard, Platform.OS === 'web' && { background: 'radial-gradient(ellipse 120% 50% at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 70%), linear-gradient(180deg, rgba(' + a + ', 0.06) 0%, rgba(0,0,0,0.7) 100%)', backdropFilter: 'blur(60px) saturate(180%)', WebkitBackdropFilter: 'blur(60px) saturate(180%)', boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 12px 24px rgba(0,0,0,0.35), 0 24px 48px rgba(0,0,0,0.25), 0 6px 20px rgba(' + a + ', 0.08)' }]}>
              <View style={styles.eaInfoImageWrap}>
                {primaryEAImage && !logoError ? (
                  <Image source={{ uri: primaryEAImage }} style={styles.eaInfoImage} resizeMode="cover" />
                ) : (
                  <Image source={require('../../assets/images/icon.png')} style={styles.eaInfoImage} resizeMode="contain" />
                )}
              </View>
              <View style={styles.eaInfoTextWrap}>
                <Text style={styles.eaInfoName} numberOfLines={2}>{primaryEA.name}</Text>
                <Text style={[styles.eaInfoStatus, { color: isBotActive ? '#16A34A' : 'rgba(255,255,255,0.4)' }]}>
                  {isBotActive ? 'RUNNING' : 'IDLE'}
                </Text>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  /* ========== SPLASH ========== */
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF1A1A',
    marginTop: 20,
    letterSpacing: 3,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  splashStartButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#FF0000',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  startButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ========== MAIN LAYOUT ========== */
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(60px) saturate(180%)',
      WebkitBackdropFilter: 'blur(60px) saturate(180%)',
      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.3)',
    }),
  },
  mainEAContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },

  /* ========== HERO — LIQUID GLASS WRAP ========== */
  heroWrap: {
    position: 'relative',
    width: '100%',
    borderRadius: 32,
    padding: 3,
    overflow: 'hidden',
  },
  heroNeonSpinner: {
    position: 'absolute',
    top: '-25%',
    left: '-25%',
    width: '150%',
    height: '150%',
  },
  heroNeonGlow: {
    position: 'absolute',
    top: '-30%',
    left: '-30%',
    width: '160%',
    height: '160%',
    ...(Platform.OS === 'web' && {
      filter: 'blur(18px)',
    }),
  },
  hero: {
    width: '100%',
    height: 500,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 18,
  },
  heroImageStyle: {
    borderRadius: 30,
  },
  heroFallback: {
    width: '100%',
    height: 500,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 18,
  },
  fallbackIcon: {
    width: 160,
    height: 160,
    borderRadius: 32,
    zIndex: 5,
  },
  heroRefraction: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 3,
  },

  /* ========== BUBBLES ========== */
  bubblesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  /* ========== REFRACTION & MENISCUS ========== */
  refraction: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    zIndex: 2,
  },
  meniscus: {
    position: 'absolute',
    top: '30%',
    left: '-10%',
    right: '-10%',
    height: 30,
    zIndex: 2,
    transform: [{ rotate: '-3deg' }],
  },
  refractionPill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: 26,
    zIndex: 2,
  },
  meniscusPill: {
    position: 'absolute',
    top: '25%',
    left: '-10%',
    right: '-10%',
    height: 30,
    zIndex: 2,
    transform: [{ rotate: '-3deg' }],
  },

  /* ========== HERO NAME OVERLAY ========== */
  heroNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 24,
    paddingHorizontal: 20,
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
    }),
  },
  botMainName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  botDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  botInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  /* ========== NEON WRAP — TRADING PANEL ========== */
  neonWrap: {
    position: 'relative',
    borderRadius: 28,
    padding: 2.5,
    overflow: 'hidden',
    marginTop: 16,
    marginHorizontal: 8,
  },
  neonSpinner: {
    position: 'absolute',
    top: '-25%',
    left: '-25%',
    width: '150%',
    height: '150%',
  },
  neonGlowSpinner: {
    position: 'absolute',
    top: '-30%',
    left: '-30%',
    width: '160%',
    height: '160%',
    ...(Platform.OS === 'web' && {
      filter: 'blur(16px)',
    }),
  },

  /* ========== LIQUID INNER — OPAQUE DEFAULT ========== */
  liquidInner: {
    borderRadius: 26,
    backgroundColor: 'rgba(12, 12, 12, 0.93)',
    position: 'relative',
    overflow: 'hidden',
  },
  liquidInnerPill: {
    borderRadius: 26,
    backgroundColor: 'rgba(12, 12, 12, 0.93)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 24,
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },

  /* ========== NEON WRAP — ADD EA PILL ========== */
  neonWrapPill: {
    position: 'relative',
    borderRadius: 28,
    padding: 2.5,
    overflow: 'hidden',
    marginBottom: 24,
  },
  neonSpinnerPill: {
    position: 'absolute',
    top: '-50%',
    left: '-25%',
    width: '150%',
    height: '200%',
  },
  neonGlowSpinnerPill: {
    position: 'absolute',
    top: '-60%',
    left: '-30%',
    width: '160%',
    height: '220%',
    ...(Platform.OS === 'web' && {
      filter: 'blur(16px)',
    }),
  },

  /* ========== TRADE ICON SPINNER ========== */
  tradeIconOuter: {
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeIconSpinner: {
    position: 'absolute',
    top: '-25%',
    left: '-25%',
    width: '150%',
    height: '150%',
  },
  tradeIconGlow: {
    position: 'absolute',
    top: '-35%',
    left: '-35%',
    width: '170%',
    height: '170%',
    ...(Platform.OS === 'web' && {
      filter: 'blur(8px)',
    }),
  },
  tradeIconInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(12, 12, 12, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.2)',
    }),
  },

  /* ========== TRADING PANEL — COMPACT ========== */
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 8,
    zIndex: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 6,
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  tradeButton: {
    backgroundColor: 'transparent',
  },
  tradeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  removeButton: {
    backgroundColor: 'transparent',
  },
  buttonIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.1)',
    }),
  },
  tradeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  tradeButtonTextActive: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  removeButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  /* ========== CONNECTED BOTS ========== */
  connectedBotsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    position: 'relative',
    marginTop: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    zIndex: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    minWidth: 28,
    alignItems: 'center',
  },
  sectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  botCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  botCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  smallLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  robotFace: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotEye: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
    marginHorizontal: 2,
  },
  botName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'center',
  },

  /* ========== ADD EA TEXT ========== */
  addEATextContainer: {
    marginLeft: 12,
  },
  addEATitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  addEASubtitle: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  /* ========== EA INFO CARD ========== */
  eaInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 12, 12, 0.9)',
    borderRadius: 22,
    padding: 14,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    }),
  },
  eaInfoImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  eaInfoImage: {
    width: 56,
    height: 56,
  },
  eaInfoTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  eaInfoName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  eaInfoStatus: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 4,
  },
});
