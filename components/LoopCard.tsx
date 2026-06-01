import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import type { OpenLoop } from '../types';
import { Badge } from './Badge';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, spacing, typography } from '../lib/theme';
import {
  formatRelativeDate,
  getLoopTypeColor,
  getPriorityColor,
  getRiskColor,
  isOverdue,
  loopTypeLabels,
  priorityLabels,
  riskLevelLabels,
  loopStatusLabels,
} from '../lib/utils';

interface LoopCardProps {
  loop: OpenLoop;
}

export function LoopCard({ loop }: LoopCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const typeColor = getLoopTypeColor(loop.type);
  const overdue = loop.dueDate ? isOverdue(loop.dueDate) : false;

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          {
            translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
          },
        ],
      }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          pressed && styles.pressed,
        ]}
      onPress={() => router.push(`/loops/${loop.id}`)}
      >
        <View style={[styles.accent, { backgroundColor: `${typeColor}55` }]} />

      <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.statusDot, { backgroundColor: typeColor }]} />
            <Text style={[styles.typeText, { color: theme.colors.textSecondary }]}>
              {loopTypeLabels[loop.type]}
            </Text>
            <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
              • {loopStatusLabels[loop.status]}
            </Text>
          </View>
        {loop.priority !== 'low' && (
          <Badge
            label={priorityLabels[loop.priority]}
            color={getPriorityColor(loop.priority)}
            backgroundColor={`${getPriorityColor(loop.priority)}15`}
          />
        )}
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
        {loop.title}
      </Text>

      {loop.description ? (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {loop.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {loop.waitingOn ? (
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            Waiting on {loop.waitingOn.name}
          </Text>
        ) : null}
        {loop.promisedTo ? (
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            Promised to {loop.promisedTo.name}
          </Text>
        ) : null}
        {loop.dueDate ? (
          <Text style={[styles.meta, { color: theme.colors.textMuted }, overdue && styles.overdue]}>
            Due {formatRelativeDate(loop.dueDate)}
          </Text>
        ) : null}
          {loop.riskLevel !== 'none' && loop.riskLevel !== 'low' ? (
          <Badge
            label={`${riskLevelLabels[loop.riskLevel]} risk`}
            color={getRiskColor(loop.riskLevel)}
            backgroundColor={`${getRiskColor(loop.riskLevel)}15`}
          />
        ) : null}
      </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  typeText: {
    ...typography.caption,
    fontWeight: '800',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    marginLeft: 4,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    ...typography.caption,
  },
  overdue: {
    color: '#F04438',
    fontWeight: '600',
  },
});
