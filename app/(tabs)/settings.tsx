import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme, ThemeName } from '@/providers/theme-provider';
import { useSidebar } from '@/providers/sidebar-provider';
import { Menu } from 'lucide-react-native';

const THEME_OPTIONS: { name: ThemeName; label: string; preview: string }[] = [
  { name: 'red', label: 'Red', preview: '#FF1A1A' },
  { name: 'blue', label: 'Blue', preview: '#1A8FFF' },
  { name: 'green', label: 'Green', preview: '#1AFF5E' },
  { name: 'purple', label: 'Purple', preview: '#A855F7' },
  { name: 'orange', label: 'Orange', preview: '#FF8C1A' },
  { name: 'cyan', label: 'Cyan', preview: '#06D6E0' },
];

export default function SettingsScreen() {
  const { themeName, theme, setThemeName, glassMode, setGlassMode } = useTheme();
  const { toggle: toggleSidebar } = useSidebar();
  const isMinimal = glassMode === 'minimal';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar} activeOpacity={0.7}>
          <Menu color="rgba(255,255,255,0.8)" size={22} />
        </TouchableOpacity>

        <Text style={styles.header}>Settings</Text>

        <Text style={styles.sectionLabel}>THEME</Text>
        <View style={styles.themeGrid}>
          {THEME_OPTIONS.map((opt) => {
            const isActive = themeName === opt.name;
            return (
              <TouchableOpacity
                key={opt.name}
                style={[
                  styles.themeCard,
                  { borderColor: isActive ? opt.preview : 'rgba(255, 255, 255, 0.08)' },
                  isActive && { shadowColor: opt.preview, shadowOpacity: 0.5, shadowRadius: 12 },
                  isActive && Platform.OS === 'web' && { boxShadow: '0 0 14px ' + opt.preview + '55, 0 0 28px ' + opt.preview + '22' },
                ]}
                activeOpacity={0.7}
                onPress={() => setThemeName(opt.name)}
              >
                <View style={[styles.previewSwatch, { backgroundColor: opt.preview + '20', borderColor: opt.preview + '44' }]}>
                  <View style={[styles.previewDotInner, { backgroundColor: opt.preview }]} />
                </View>
                <Text style={[styles.themeLabel, isActive && { color: opt.preview }]}>{opt.label}</Text>
                {isActive && (
                  <View style={[styles.activeDot, { backgroundColor: opt.preview }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 32 }]}>GLASS STYLE</Text>
        <View style={[styles.glassCard, { borderColor: 'rgba(' + theme.accentRgb + ', 0.2)' }]}>
          <View style={styles.glassToggleRow}>
            <View style={styles.glassToggleInfo}>
              <Text style={styles.cardTitle}>Minimal Glass</Text>
              <Text style={styles.cardSubtitle}>{isMinimal ? 'Clean iOS 26 dark glass' : 'Neon glow with spinning borders'}</Text>
            </View>
            <Switch
              value={isMinimal}
              onValueChange={(val) => setGlassMode(val ? 'minimal' : 'neon')}
              trackColor={{ false: 'rgba(255,255,255,0.12)', true: theme.accent + '55' }}
              thumbColor={isMinimal ? theme.accent : 'rgba(255,255,255,0.6)'}
              ios_backgroundColor="rgba(255,255,255,0.12)"
            />
          </View>
          <View style={styles.glassPreviewRow}>
            <View style={[styles.glassPreviewCard, !isMinimal && styles.glassPreviewActive, !isMinimal && { borderColor: theme.accent + '44' }, Platform.OS === 'web' && !isMinimal && { boxShadow: '0 0 12px ' + theme.accent + '33' }]}>
              <Text style={[styles.glassPreviewLabel, !isMinimal && { color: theme.accent }]}>Neon</Text>
              <View style={[styles.glassPreviewBar, { backgroundColor: theme.accent + '30' }]}>
                <View style={[styles.glassPreviewGlow, { backgroundColor: theme.accent }]} />
              </View>
            </View>
            <View style={[styles.glassPreviewCard, isMinimal && styles.glassPreviewActive, isMinimal && { borderColor: theme.accent + '44' }, Platform.OS === 'web' && isMinimal && { boxShadow: '0 0 12px ' + theme.accent + '33' }]}>
              <Text style={[styles.glassPreviewLabel, isMinimal && { color: theme.accent }]}>Minimal</Text>
              <View style={[styles.glassPreviewBar, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 32 }]}>ABOUT</Text>
        <TouchableOpacity
          style={[styles.glassCard, { borderColor: 'rgba(' + theme.accentRgb + ', 0.2)' }]}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIconContainer, { borderColor: 'rgba(' + theme.accentRgb + ', 0.2)' }]}>
            <Text style={[styles.infoIcon, { color: theme.accent }]}>i</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>About Trade Port EA</Text>
            <Text style={styles.cardSubtitle}>Version, license & support info</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
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
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    marginBottom: 14,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
    }),
  },
  previewSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  previewDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.3,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
    }),
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoIcon: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  glassToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  glassToggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  glassPreviewRow: {
    flexDirection: 'row',
    gap: 10,
  },
  glassPreviewCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 8,
  },
  glassPreviewActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  glassPreviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  glassPreviewBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  glassPreviewGlow: {
    width: '60%',
    height: '100%',
    borderRadius: 2,
  },
});
