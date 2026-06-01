import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CAPTURE_TEMPLATES, type CaptureTemplateId } from '../lib/captureTemplates';
import { radius, spacing, typography } from '../lib/theme';

export function CaptureTemplatePicker({
  selectedId,
  onSelect,
}: {
  selectedId?: CaptureTemplateId;
  onSelect: (id: CaptureTemplateId) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>Smart capture</Text>
      <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
        Pick a template to pre-fill what matters for this open loop.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CAPTURE_TEMPLATES.map((t) => {
          const selected = selectedId === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => onSelect(t.id)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: selected ? theme.colors.primary : theme.colors.text },
                ]}
                numberOfLines={2}
              >
                {t.label}
              </Text>
              <Text
                style={[styles.cardSub, { color: theme.colors.textMuted }]}
                numberOfLines={2}
              >
                {t.subtitle}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.headline,
  },
  sub: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  card: {
    width: 148,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  cardTitle: {
    ...typography.callout,
    fontWeight: '800',
  },
  cardSub: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
