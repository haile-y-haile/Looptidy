import { View, Text, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function CollapsibleSection({
  title,
  count,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  count?: number;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [
          styles.header,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          pressed && { opacity: 0.92 },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <View style={styles.right}>
          {typeof count === 'number' ? (
            <Text style={[styles.count, { color: theme.colors.textMuted }]}>{count}</Text>
          ) : null}
          <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>
            {collapsed ? '›' : '⌄'}
          </Text>
        </View>
      </Pressable>

      {!collapsed ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  header: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.headline,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  count: {
    ...typography.caption,
    fontWeight: '800',
  },
  chevron: {
    fontSize: 18,
    width: 18,
    textAlign: 'center',
  },
  body: {
    paddingTop: spacing.md,
  },
});

