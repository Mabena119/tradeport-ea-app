import { Tabs } from "expo-router";
import { Home, Settings, TrendingUp } from "lucide-react-native";
import React from "react";
import { useApp } from "@/providers/app-provider";

export default function TabLayout() {
  const { isFirstTime } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isFirstTime ? {
          display: 'none',
        } : {
          backgroundColor: 'rgba(255, 26, 26, 0.95)',
          borderTopColor: '#FFFFFF',
          borderTopWidth: 2,
          backdropFilter: 'blur(20px)',
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFB3B3',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
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
        name="quotes"
        options={{
          title: "QUOTES",
          tabBarIcon: ({ color }) => <TrendingUp color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="metatrader"
        options={{
          title: "METATRADER",
          tabBarIcon: ({ color }) => <Settings color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}