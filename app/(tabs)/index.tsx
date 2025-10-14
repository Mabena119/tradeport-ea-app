import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, Platform, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Square, TrendingUp, Trash2, Plus, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { RobotLogo } from '@/components/robot-logo';

import { useApp } from '@/providers/app-provider';
import type { EA } from '@/providers/app-provider';

export default function HomeScreen() {
  const { eas, isFirstTime, setIsFirstTime, removeEA, isBotActive, setBotActive, setActiveEA } = useApp();

  // Safely get the primary EA (first one in the list)
  const primaryEA = Array.isArray(eas) && eas.length > 0 ? eas[0] : null;
  const otherEAs = Array.isArray(eas) ? eas.slice(1) : []; // All EAs except the first one

  console.log('HomeScreen render - EAs count:', eas?.length || 0, 'Primary EA:', primaryEA?.name || 'none');

  const [logoError, setLogoError] = useState<boolean>(false);

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
    // If already an absolute URL, return as-is
    if (/^https?:\/\//i.test(raw)) {
      console.log('EA Image Debug: Using absolute URL:', raw);
      return raw;
    }
    // Otherwise, treat as filename and prefix uploads base URL
    const filename = raw.replace(/^\/+/, '');
    const base = 'https://tradeportea.com/shop/';
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
      <View style={styles.splashContainer}>
        <View style={styles.splashContent}>
          <View style={styles.logoContainer}>
            <Image
              testID="splash-app-icon"
              source={require('../../assets/images/icon.png')}
              style={{ width: 120, height: 120, borderRadius: 24 }}
              resizeMode="contain"
            />
            <Text style={styles.title}>TRADE PORT EA</Text>
          </View>

          <Text style={styles.description}>
            A cutting-edge mobile hosting platform designed to empower traders with a secure, reliable, and user-friendly environment for running their automated trading systems. Seamlessly manage your Expert Advisors (EAs) on the go, ensuring optimal performance and peace of mind.
          </Text>

          <TouchableOpacity style={styles.splashStartButton} onPress={handleStartNow}>
            <Text style={styles.startButtonText}>START NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {primaryEA ? (
          <View style={styles.mainEAContainer}>
            {primaryEAImage && !logoError ? (
              <ImageBackground
                testID="ea-hero-bg"
                source={{ uri: primaryEAImage }}
                style={styles.hero}
                onError={(error) => {
                  console.log('EA Image Error: Failed to load image:', primaryEAImage, error);
                  setLogoError(true);
                }}
                resizeMode="cover"
              >
                <View style={styles.heroOverlay}>
                  <View style={styles.gradientOverlay} />
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.heroFallback}>
                <Image
                  testID="fallback-app-icon"
                  source={require('../../assets/images/icon.png')}
                  style={styles.fallbackIcon}
                  resizeMode="contain"
                />
                <View style={styles.gradientOverlay} />
              </View>
            )}

            <View style={styles.heroContent}>
              {/* Gradient overlay for transition effect */}
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0)',
                  'rgba(255,255,255,0.002)',
                  'rgba(255,255,255,0.005)',
                  'rgba(255,255,255,0.008)',
                  'rgba(255,255,255,0.01)',
                  'rgba(255,0,0,0.01)',
                  'rgba(255,0,0,0.015)',
                  'rgba(255,0,0,0.02)',
                  'rgba(255,0,0,0.025)',
                  'rgba(255,0,0,0.03)',
                  'rgba(255,0,0,0.035)',
                  'rgba(255,0,0,0.04)',
                  'rgba(255,0,0,0.045)',
                  'rgba(255,0,0,0.05)',
                  'rgba(255,0,0,0.055)',
                  'rgba(255,0,0,0.06)',
                  'rgba(255,0,0,0.065)',
                  'rgba(255,0,0,0.07)',
                  'rgba(255,0,0,0.075)',
                  'rgba(255,0,0,0.08)',
                  'rgba(255,0,0,0.085)',
                  'rgba(255,0,0,0.09)',
                  'rgba(255,0,0,0.095)',
                  'rgba(255,0,0,0.1)',
                  'rgba(255,0,0,0.11)',
                  'rgba(255,0,0,0.12)',
                  'rgba(255,0,0,0.13)',
                  'rgba(255,0,0,0.14)',
                  'rgba(255,0,0,0.15)',
                  'rgba(255,0,0,0.16)',
                  'rgba(255,0,0,0.17)',
                  'rgba(255,0,0,0.18)',
                  'rgba(255,0,0,0.19)',
                  'rgba(255,0,0,0.2)',
                  'rgba(255,0,0,0.22)',
                  'rgba(255,0,0,0.24)',
                  'rgba(255,0,0,0.26)',
                  'rgba(255,0,0,0.28)',
                  'rgba(255,0,0,0.3)',
                  'rgba(255,0,0,0.32)',
                  'rgba(255,0,0,0.34)',
                  'rgba(255,0,0,0.36)',
                  'rgba(255,0,0,0.38)',
                  'rgba(255,0,0,0.4)',
                  'rgba(255,0,0,0.42)',
                  'rgba(255,0,0,0.44)',
                  'rgba(255,0,0,0.46)',
                  'rgba(255,0,0,0.48)',
                  'rgba(255,0,0,0.5)',
                  'rgba(255,0,0,0.52)',
                  'rgba(255,0,0,0.54)',
                  'rgba(255,0,0,0.56)',
                  'rgba(255,0,0,0.58)',
                  'rgba(255,0,0,0.6)',
                  'rgba(255,0,0,0.62)',
                  'rgba(255,0,0,0.64)',
                  'rgba(255,0,0,0.66)',
                  'rgba(255,0,0,0.68)',
                  'rgba(255,0,0,0.7)',
                  'rgba(255,0,0,0.72)',
                  'rgba(255,0,0,0.74)',
                  'rgba(255,0,0,0.76)',
                  'rgba(255,0,0,0.78)',
                  'rgba(255,0,0,0.8)',
                  'rgba(255,0,0,0.82)',
                  'rgba(255,0,0,0.84)',
                  'rgba(255,0,0,0.86)',
                  'rgba(255,0,0,0.88)',
                  'rgba(255,0,0,0.9)',
                  'rgba(255,0,0,0.92)',
                  'rgba(255,0,0,0.94)',
                  'rgba(255,0,0,0.96)',
                  'rgba(255,0,0,0.98)',
                  'rgba(255,0,0,1)'
                ]}
                style={styles.fadeGradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={styles.topSection}>
                <View style={styles.titleBlock}>
                  <Text testID="ea-title" style={styles.botMainName} numberOfLines={3} ellipsizeMode="tail">{primaryEA.name}</Text>
                </View>
              </View>

              <View style={styles.bottomActions}>
                <TouchableOpacity
                  testID="action-start"
                  style={[styles.actionButton, styles.tradeButton, isBotActive && styles.tradeButtonActive]}
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

                <TouchableOpacity testID="action-quotes" style={[styles.actionButton, styles.secondaryButton]} onPress={handleQuotes}>
                  <View style={styles.buttonIconContainer}>
                    <TrendingUp color="#FFFFFF" size={18} />
                  </View>
                  <Text style={styles.secondaryButtonText}>QUOTES</Text>
                </TouchableOpacity>

                <TouchableOpacity testID="action-remove" style={[styles.actionButton, styles.removeButton]} onPress={handleRemoveActiveBot}>
                  <View style={styles.buttonIconContainer}>
                    <Trash2 color="#FFFFFF" size={18} />
                  </View>
                  <Text style={styles.removeButtonText}>REMOVE</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.infoButton}>
                <Info color="#FFFFFF" size={16} />
              </TouchableOpacity>
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




          <TouchableOpacity style={styles.addEAButton} onPress={handleAddNewEA}>
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
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px rgba(255, 26, 26, 0.6))',
    }),
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
    paddingTop: 0,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: 500,
    ...(Platform.OS === 'web' && {
      backgroundBlendMode: 'overlay',
      filter: 'brightness(0.8) contrast(1.1)',
    }),
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === 'web' && {
      backgroundBlendMode: 'multiply',
    }),
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, rgba(255, 26, 26, 0.3) 0%, rgba(255, 26, 26, 0.25) 15%, rgba(255, 26, 26, 0.2) 30%, rgba(255, 26, 26, 0.15) 45%, rgba(255, 26, 26, 0.1) 60%, rgba(255, 26, 26, 0.05) 75%, rgba(255, 26, 26, 0.02) 90%, rgba(0, 0, 0, 0.1) 95%, rgba(0, 0, 0, 0.3) 100%)',
      mixBlendMode: 'overlay',
    }),
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 500,
    width: width,
    zIndex: -1,
  },
  heroFallback: {
    width: '100%',
    height: 500,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(255, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.8) 100%)',
      backgroundBlendMode: 'overlay',
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
    bottom: 0,
    left: 0,
    right: 0,
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
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 12,
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
    minHeight: 96,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.9)',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
    }),
  },
  tradeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.9)',
    shadowColor: '#FF1A1A',
    shadowOpacity: 0.7,
  },
  tradeButtonActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#DC2626',
    shadowOpacity: 0.2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.9)',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.9)',
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(10px)',
  },
  buttonIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 4px rgba(255, 26, 26, 0.6))',
    }),
  },
  tradeButtonTextActive: {
    color: '#FFFFFF',
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 6px rgba(255, 26, 26, 0.8))',
    }),
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 4px rgba(255, 26, 26, 0.6))',
    }),
  },
  removeButtonText: {
    color: '#FFB3B3',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 4px rgba(255, 26, 26, 0.6))',
    }),
  },
  infoButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 26, 26, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.6)',
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  connectedBotsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    position: 'relative',
    marginTop: 0,
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
    numberOfLines: 2,
    textAlign: 'center',
  },
  addEAButton: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 26, 26, 1)',
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 16,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(255, 26, 26, 0.4), 0 0 20px rgba(255, 26, 26, 0.3)',
    }),
  },
  addEATextContainer: {
    marginLeft: 12,
  },
  addEATitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 8px rgba(255, 26, 26, 0.6))',
    }),
  },
  addEASubtitle: {
    color: '#FFB3B3',
    fontSize: 13,
    opacity: 1,
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

});