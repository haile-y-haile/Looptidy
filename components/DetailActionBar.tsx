import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../lib/theme';
import { PrimaryButton } from './PrimaryButton';

type DetailActionBarProps = {
  onAddNote: () => void;
  onClose: () => void;
  noteDisabled?: boolean;
  showClose?: boolean;
};

export function DetailActionBar({
  onAddNote,
  onClose,
  noteDisabled = true,
  showClose = true,
}: DetailActionBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, spacing.md),
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      <PrimaryButton
        label="Save note"
        onPress={onAddNote}
        disabled={noteDisabled}
        style={styles.flex}
      />
      {showClose ? (
        <PrimaryButton label="Close loop" onPress={onClose} tone="danger" style={styles.flex} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  flex: {
    flex: 1,
  },
});
