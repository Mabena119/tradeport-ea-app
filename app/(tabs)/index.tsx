import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, Platform, Dimensions, SafeAreaView } from 'react-native';
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
  const a = theme.accentRgb; // shorthand for rgba building
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {primaryEA ? (
          <View style={styles.mainEAContainer}>
            {primaryEAImage && !logoError ? (
              <ImageBackground
                testID="ea-hero-bg"
                source={{ uri: primaryEAImage }}
                style={[styles.hero, Platform.OS === 'web' && { boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -3px 6px rgba(0, 0, 0, 0.2), 0 14px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(' + a + ', 0.12)' }]}
                imageStyle={styles.heroImageStyle}
                onError={(error) => {
                  console.log('EA Image Error: Failed to load image:', primaryEAImage, error);
                  setLogoError(true);
                }}
                resizeMode="cover"
              >
              </ImageBackground>
            ) : (
              <View style={[styles.heroFallback, styles.heroImageStyle, Platform.OS === 'web' && { boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -3px 6px rgba(0, 0, 0, 0.2), 0 14px 50px rgba(0, 0, 0, 0.5)' }]}>
                <Image
                  testID="fallback-app-icon"
                  source={require('../../assets/images/icon.png')}
                  style={styles.fallbackIcon}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.heroContent}>
              <View style={styles.topSection}>
                <View style={styles.titleBlock}>
                  <Text testID="ea-title" style={styles.botMainName} numberOfLines={3} ellipsizeMode="tail">{primaryEA.name}</Text>
                </View>
              </View>

              <View style={styles.bottomActions}>
                <TouchableOpacity testID="action-quotes" style={[styles.actionButton, styles.secondaryButton, Platform.OS === 'web' && { boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.25), 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(' + a + ', 0.15)' }]} onPress={handleQuotes}>
                  <View style={styles.buttonIconContainer}>
                    <TrendingUp color="#FFFFFF" size={18} />
                  </View>
                  <Text style={styles.secondaryButtonText}>QUOTES</Text>

                </TouchableOpacity>

                <TouchableOpacity
                  testID="action-start"
                  style={[styles.actionButton, styles.tradeButton, isBotActive && styles.tradeButtonActive, Platform.OS === 'web' && { boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.25), 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(' + a + ', 0.15)' }]}
                  onPress={() => {
                    console.log('Start/Stop button pressed, current state:', isBotActive);
                    try {
                      setBotActive(!isBotActive);
                      console.log('Bot active state changed to:', !isBotActive);
                    } catch (error) {
                      console.error('Error changing bot state:', error);
                    }
                  }}
                >
                  <View style={[styles.buttonIconContainer, isBotActive && styles.buttonIconContainerActive]}>
                    {isBotActive ? (
                      <Square color={isBotActive ? "#FFFFFF" : "#000000"} size={18} />
                    ) : (
                      <Play color="#000000" size={18} />
                    )}
                  </View>
                  <Text style={[styles.tradeButtonText, isBotActive && styles.tradeButtonTextActive]}>
                    {isBotActive ? 'STOP' : 'TRADE'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity testID="action-remove" style={[styles.actionButton, styles.removeButton, Platform.OS === 'web' && { boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.25), 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(' + a + ', 0.15)' }]} onPress={handleRemoveActiveBot}>
                  <View style={styles.buttonIconContainer}>
                    <Trash2 color="#FFFFFF" size={18} />
                  </View>
                  <Text style={styles.removeButtonText}>REMOVE</Text>

                </TouchableOpacity>
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
                    try {
                      console.log('Switching active EA to:', ea.name, ea.id);
                      await setActiveEA(ea.id);
                    } catch (error) {
                      console.error('Failed to switch active EA:', error);
                    }
                  }}
                >
                  <View style={styles.botCardContent}>
                    <View style={styles.botIcon}>
                      {getEAImageUrl(ea as unknown as EA) ? (
                        <Image
                          testID={`ea-logo-small-${index}`}
                          source={{ uri: getEAImageUrl(ea as unknown as EA) as string }}
                          style={styles.smallLogo}
                        />
                      ) : (
                        <View style={styles.robotFace}>
                          <View style={styles.robotEye} />
                          <View style={styles.robotEye} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.botName} numberOfLines={2} ellipsizeMode="tail">{ea.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <TouchableOpacity style={[styles.addEAButton, Platform.OS === 'web' && { boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.25), 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(' + a + ', 0.12)' }]} onPress={handleAddNewEA}>
            <Plus color="#FFFFFF" size={20} />
            <View style={styles.addEATextContainer}>
              <Text style={styles.addEATitle}>ADD A NEW EA</Text>
              <Text style={styles.addEASubtitle}>HAVE A VALID LICENSE KEY</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, rgba(255, 26, 26, 0.95) 0%, rgba(255, 26, 26, 0.7) 20%, rgba(255, 26, 26, 0.4) 40%, rgba(255, 26, 26, 0.2) 60%, rgba(255, 26, 26, 0.1) 80%, rgba(0, 0, 0, 0.8) 95%, rgba(0, 0, 0, 1) 100%)',
    }),
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, rgba(255, 26, 26, 0.95) 0%, rgba(255, 26, 26, 0.85) 10%, rgba(255, 26, 26, 0.75) 20%, rgba(255, 26, 26, 0.65) 30%, rgba(255, 26, 26, 0.55) 40%, rgba(255, 26, 26, 0.45) 50%, rgba(255, 26, 26, 0.35) 60%, rgba(255, 26, 26, 0.25) 70%, rgba(255, 26, 26, 0.15) 80%, rgba(255, 26, 26, 0.08) 90%, rgba(255, 26, 26, 0.03) 95%, rgba(0, 0, 0, 1) 100%)',
    }),
  },
  content: {
    flex: 1,
  },
  mainEAContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: 500,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 3,
    borderTopColor: 'rgba(255, 255, 255, 0.55)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderRightColor: 'rgba(255, 255, 255, 0.18)',
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 18,
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -3px 6px rgba(0, 0, 0, 0.2), 0 14px 50px rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.35)',
    }),
  },
  heroImageStyle: {
    borderRadius: 28,
  },
  heroFallback: {
    width: '100%',
    height: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2.5,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    borderLeftColor: 'rgba(255, 255, 255, 0.25)',
    borderRightColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 18,
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -3px 6px rgba(0, 0, 0, 0.2), 0 14px 50px rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.35)',
    }),
  },
  fallbackIcon: {
    width: 160,
    height: 160,
    borderRadius: 32,
  },
  botInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  heroContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: 350,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 30,
    zIndex: 10,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 120,
  },
  titleBlock: {
    alignItems: 'center',
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
      web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
  connectedCountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  connectedCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  tradingPanelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 28,
    padding: 12,
    borderWidth: 2.5,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomColor: 'rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 18,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(60px) saturate(200%)',
      WebkitBackdropFilter: 'blur(60px) saturate(200%)',
    }),
  },
  tradingPanelShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    }),
  },
  tradingPanelEdge: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 2,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 80%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    }),
  },
  tradingPanelShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0) 100%)',
      pointerEvents: 'none',
    }),
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 8,
    minHeight: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 2.5,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomColor: 'rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 18,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(60px) saturate(200%)',
      WebkitBackdropFilter: 'blur(60px) saturate(200%)',
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.2), 0 14px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
    }),
  },
  tradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  tradeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  glassShineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.02) 100%)',
      pointerEvents: 'none',
    }),
  },
  glassEdgeTop: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 20%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 80%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    }),
  },
  glassShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.08) 50%, rgba(0, 0, 0, 0) 100%)',
      pointerEvents: 'none',
    }),
  },
  glassShineTopPill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
      pointerEvents: 'none',
    }),
  },
  glassEdgeTopPill: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 20%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.6) 80%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    }),
  },
  glassShadowBottomPill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.05) 60%, rgba(0, 0, 0, 0) 100%)',
      pointerEvents: 'none',
    }),
  },
  buttonIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderRightColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -2px 3px rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.2)',
    }),
  },
  buttonIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tradeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tradeButtonTextActive: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  removeButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
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
  addEAButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderWidth: 2.5,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomColor: 'rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 18,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(60px) saturate(200%)',
      WebkitBackdropFilter: 'blur(60px) saturate(200%)',
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.2), 0 14px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)',
    }),
  },
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
});
