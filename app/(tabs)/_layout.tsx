import { Tabs } from "expo-router";
import { Home, Settings, TrendingUp } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useApp } from "@/providers/app-provider";
import { useTheme } from "@/providers/theme-provider";

export default function TabLayout() {
  const { isFirstTime } = useApp();
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isFirstTime ? {
          display: 'none',
        } : {
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          ...(Platform.OS === 'web' && {
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }),
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ color }) => <Home color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="metatrader"
        options={{
          title: "METATRADER",
          tabBarIcon: ({ color }) => <TrendingUp color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          tabBarIcon: ({ color }) => <Settings color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: "QUOTES",
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
