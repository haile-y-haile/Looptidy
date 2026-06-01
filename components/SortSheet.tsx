import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { COMMAND_CENTER_SORTS, type CommandCenterSort } from '../lib/commandCenter';
import { radius, spacing, typography } from '../lib/theme';

export function SortSheet({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: CommandCenterSort;
  onSelect: (sort: CommandCenterSort) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              paddingBottom: spacing.xxl + insets.bottom,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Sort loops</Text>
          {COMMAND_CENTER_SORTS.map((opt) => {
            const selected = value === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => {
                  onSelect(opt.key);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: selected ? theme.colors.primaryLight : 'transparent',
                    borderColor: theme.colors.borderLight,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: selected ? theme.colors.primary : theme.colors.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  optionText: {
    ...typography.callout,
    fontWeight: '700',
  },
});
