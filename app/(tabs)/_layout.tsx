import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useApp } from "@/providers/app-provider";
import { useTheme } from "@/providers/theme-provider";
import { Sidebar } from "@/components/sidebar";

export default function TabLayout() {
  const { isFirstTime } = useApp();
  const { fontFamilyCSS } = useTheme();

  return (
    <View style={[styles.container, Platform.OS === 'web' && { fontFamily: fontFamilyCSS } as any]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="metatrader" />
        <Tabs.Screen name="settings" />
        <Tabs.Screen name="quotes" options={{ tabBarButton: () => null }} />
      </Tabs>
      {!isFirstTime && <Sidebar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
