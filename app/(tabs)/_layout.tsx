import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'AppIonicons': require('../../assets/fonts/Ionicons.ttf'),
    'Material Icons': require('../../assets/fonts/MaterialIcons.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-sharp" color={color} style={{ fontFamily: 'AppIonicons' }} />,
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="book" color={color} style={{ fontFamily: 'AppIonicons' }} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="information-circle" color={color} style={{ fontFamily: 'AppIonicons' }} />,
        }}
      />
    </Tabs>
  );
}
