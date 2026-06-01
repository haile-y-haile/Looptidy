import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LoopProvider } from '../context/LoopContext';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <LoopProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '600', color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Today' }} />
        <Stack.Screen name="loops" options={{ headerShown: false }} />
        <Stack.Screen name="waiting" options={{ title: 'Waiting On Others' }} />
        <Stack.Screen name="promised" options={{ title: 'Promised by Me' }} />
        <Stack.Screen name="decisions" options={{ title: 'Decision Log' }} />
        <Stack.Screen name="weekly-review" options={{ title: 'Weekly Review' }} />
      </Stack>
    </LoopProvider>
  );
}
