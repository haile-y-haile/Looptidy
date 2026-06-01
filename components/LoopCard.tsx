import { useCallback, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useRouter } from 'expo-router';
import type { OpenLoop } from '../types';
import { Badge } from './Badge';
import { AppIcon } from './AppIcon';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { motion } from '../lib/motion';
import { radius, shadows, spacing, typography } from '../lib/theme';
import {
  formatRelativeDate,
  getLoopTypeColor,
  getPriorityColor,
  getRiskColor,
  isOpenLoop,
  isOverdue,
  loopTypeLabels,
  priorityLabels,
  riskLevelLabels,
} from '../lib/utils';

const ACTION_WIDTH = 92;

interface LoopCardProps {
  loop: OpenLoop;
  index?: number;
}

function CloseSwipeAction({
  drag,
  onClose,
}: {
  drag: SharedValue<number>;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + ACTION_WIDTH }],
  }));

  return (
    <Animated.View style={[styles.actionWrap, style]}>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [
          styles.closeAction,
          { backgroundColor: theme.colors.danger },
          pressed && { opacity: 0.9 },
        ]}
      >
        <AppIcon name="checkmark-circle-outline" size={22} color="#FFFFFF" />
        <Text style={styles.closeLabel}>Close</Text>
      </Pressable>
    </Animated.View>
  );
}

export function LoopCard({ loop, index = 0 }: LoopCardProps) {
  const router = useRouter();
  const { closeLoop } = useLoops();
  const { theme } = useTheme();
  const swipeRef = useRef<{ close: () => void } | null>(null);
  const typeColor = getLoopTypeColor(loop.type);
  const overdue = loop.dueDate ? isOverdue(loop.dueDate) : false;
  const delay = Math.min(index, 5) * motion.stagger;
  const canSwipe = isOpenLoop(loop);

  const confirmClose = useCallback(() => {
    void hapticLight();
    Alert.alert('Close this loop?', 'You can still find it in your history later.', [
      { text: 'Cancel', style: 'cancel', onPress: () => swipeRef.current?.close() },
      {
        text: 'Close loop',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await closeLoop(loop.id);
            void hapticSuccess();
            swipeRef.current?.close();
          })();
        },
      },
    ]);
  }, [closeLoop, loop.id]);

  const renderRightActions = useCallback(
    (_progress: SharedValue<number>, drag: SharedValue<number>) => (
      <CloseSwipeAction drag={drag} onClose={confirmClose} />
    ),
    [confirmClose]
  );

  const cardBody = (
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
        </View>
        {loop.priority === 'urgent' || loop.priority === 'high' ? (
          <Badge
            label={priorityLabels[loop.priority]}
            color={getPriorityColor(loop.priority)}
            backgroundColor={`${getPriorityColor(loop.priority)}15`}
          />
        ) : null}
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
        {loop.title}
      </Text>

      {loop.waitingOn ? (
        <Text style={[styles.personLine, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          Waiting on {loop.waitingOn.name}
        </Text>
      ) : null}
      {loop.promisedTo ? (
        <Text style={[styles.personLine, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          Promised to {loop.promisedTo.name}
        </Text>
      ) : null}

      {loop.description ? (
        <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={2}>
          {loop.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {loop.dueDate ? (
          <Text
            style={[
              styles.meta,
              { color: overdue ? theme.colors.danger : theme.colors.textMuted },
            ]}
          >
            Due {formatRelativeDate(loop.dueDate)}
          </Text>
        ) : null}
        {loop.riskLevel === 'high' || loop.riskLevel === 'medium' ? (
          <Badge
            label={`${riskLevelLabels[loop.riskLevel]} risk`}
            color={getRiskColor(loop.riskLevel)}
            backgroundColor={`${getRiskColor(loop.riskLevel)}15`}
          />
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(motion.normal).springify().damping(18)}>
      {canSwipe ? (
        <ReanimatedSwipeable
          ref={swipeRef}
          friction={2}
          overshootRight={false}
          rightThreshold={40}
          renderRightActions={renderRightActions}
          containerStyle={styles.swipeContainer}
        >
          {cardBody}
        </ReanimatedSwipeable>
      ) : (
        cardBody
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
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
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  personLine: {
    ...typography.callout,
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
  actionWrap: {
    width: ACTION_WIDTH,
    marginBottom: spacing.md,
  },
  closeAction: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  closeLabel: {
    ...typography.caption,
    color: '#FFFFFF',
  },
});
