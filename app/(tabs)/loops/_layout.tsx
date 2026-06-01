import { Stack } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';

export default function LoopsLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
        contentStyle: { backgroundColor: theme.colors.background },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Loop',
          presentation: 'modal',
          headerBackTitle: 'Cancel',
        }}
      />
      <Stack.Screen name="[id]" options={{ title: 'Loop Detail' }} />
    </Stack>
  );
}
