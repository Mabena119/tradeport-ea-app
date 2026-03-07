import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useApp } from "@/providers/app-provider";
import { Sidebar } from "@/components/sidebar";
import { VoiceOverlay } from "@/components/voice-assistant";

export default function TabLayout() {
  const { isFirstTime } = useApp();

  return (
    <View style={styles.container}>
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
      <VoiceOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
