import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function PeopleLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'People' }} />
      <Stack.Screen name="[personKey]" options={{ title: 'Person' }} />
    </Stack>
  );
}
