import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/useAuthStore';
import LockScreen from './(auth)/lock';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const { isUnlocked } = useAuthStore();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.canvas} />
      {!isUnlocked ? (
        <LockScreen />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="entry/add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="entry/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      )}
    </SafeAreaProvider>
  );
}
