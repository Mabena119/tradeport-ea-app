import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeName } from '@/providers/theme-provider';

const THEME_OPTIONS: { name: ThemeName; label: string; preview: string }[] = [
  { name: 'red', label: 'Red', preview: '#FF1A1A' },
  { name: 'blue', label: 'Blue', preview: '#1A8FFF' },
  { name: 'green', label: 'Green', preview: '#1AFF5E' },
];

export default function SettingsScreen() {
  const { themeName, theme, setThemeName } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Settings</Text>

        <Text style={styles.sectionLabel}>THEME</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const isActive = themeName === opt.name;
            return (
              <TouchableOpacity
                key={opt.name}
                style={[
                  styles.themeCard,
                  { borderColor: isActive ? opt.preview : 'rgba(255, 255, 255, 0.1)' },
                  isActive && Platform.OS === 'web' && { boxShadow: '0 0 14px ' + opt.preview + '55, 0 0 28px ' + opt.preview + '22' },
                ]}
                activeOpacity={0.7}
                onPress={() => setThemeName(opt.name)}
              >
                <View style={styles.themePreviewRow}>
                  <View style={[styles.previewDot, { backgroundColor: '#0A0A0A' }]} />
                  <View style={[styles.previewDot, { backgroundColor: opt.preview }]} />
                </View>
                <Text style={[styles.themeLabel, isActive && { color: opt.preview }]}>{opt.label}</Text>
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: opt.preview + '22', borderColor: opt.preview + '55' }]}>
                    <Text style={[styles.activeBadgeText, { color: opt.preview }]}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
    }),
  },
  themePreviewRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  previewDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.3,
  },
  activeBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
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
});
