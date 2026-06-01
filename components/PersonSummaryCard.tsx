import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PersonSummary } from '../lib/people';
import { useTheme } from '../context/ThemeContext';
import { Badge } from './Badge';
import { radius, spacing, typography } from '../lib/theme';
import { formatRelativeDate } from '../lib/utils';

export function PersonSummaryCard({
  person,
  onPress,
}: {
  person: PersonSummary;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{person.name}</Text>
          {person.role ? (
            <Text style={[styles.role, { color: theme.colors.textMuted }]}>{person.role}</Text>
          ) : null}
        </View>
        {person.highRiskCount > 0 ? (
          <Badge
            label={`${person.highRiskCount} risk`}
            color={theme.colors.danger}
            backgroundColor={theme.colors.dangerLight}
          />
        ) : null}
      </View>
      <View style={styles.counts}>
        {person.waitingCount > 0 ? (
          <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
            {person.waitingCount} waiting
          </Text>
        ) : null}
        {person.promisedCount > 0 ? (
          <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
            {person.promisedCount} promised
          </Text>
        ) : null}
        {person.blockedCount > 0 ? (
          <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
            {person.blockedCount} blocked
          </Text>
        ) : null}
      </View>
      {person.lastFollowUpAt ? (
        <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
          Last activity {formatRelativeDate(person.lastFollowUpAt)}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.headline,
  },
  role: {
    ...typography.caption,
    marginTop: 2,
  },
  counts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  count: {
    ...typography.caption,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
});
