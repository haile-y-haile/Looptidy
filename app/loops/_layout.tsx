import { Stack } from 'expo-router';
import { colors } from '../../lib/theme';

export default function LoopsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'All Loops' }} />
      <Stack.Screen name="new" options={{ title: 'New Loop', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Loop Detail' }} />
    </Stack>
  );
}
