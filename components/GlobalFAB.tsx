import { StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { useSpotlight } from '../context/SpotlightContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../lib/haptics';

export function GlobalFAB() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { openSpotlight } = useSpotlight();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          bottom: 100 + insets.bottom,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => {
        void hapticLight();
        openSpotlight();
      }}
    >
      <AppIcon name="search" size={24} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
