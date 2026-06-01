import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppIcon } from './AppIcon';
import { useTheme } from '../context/ThemeContext';
import { motion } from '../lib/motion';
import { radius, spacing, typography } from '../lib/theme';
import { hapticLight } from '../lib/haptics';

type ReviewStepperProps = {
  steps: string[];
  currentIndex: number;
  onAdvance: () => void;
  onStepPress: (index: number) => void;
};

export function ReviewStepper({ steps, currentIndex, onAdvance, onStepPress }: ReviewStepperProps) {
  const { theme } = useTheme();
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: theme.colors.surface2 }]}>
        <View
          style={[styles.fill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]}
        />
      </View>
      <Text style={[styles.stepLabel, { color: theme.colors.textMuted }]}>
        Step {currentIndex + 1} of {steps.length}
      </Text>

      <Animated.View
        key={currentIndex}
        entering={FadeIn.duration(motion.normal)}
        style={[
          styles.currentCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.currentText, { color: theme.colors.text }]}>{steps[currentIndex]}</Text>
        <Pressable
          onPress={() => {
            void hapticLight();
            onAdvance();
          }}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: theme.colors.primary },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.nextLabel}>
            {currentIndex >= steps.length - 1 ? 'Finish review' : 'Next step'}
          </Text>
        </Pressable>
      </Animated.View>

      <Text style={[styles.listTitle, { color: theme.colors.textMuted }]}>All steps</Text>
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <Pressable
            key={step}
            onPress={() => {
              void hapticLight();
              onStepPress(index);
            }}
            style={[
              styles.stepRow,
              {
                backgroundColor: theme.colors.surface,
                borderColor: active ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.stepIcon,
                {
                  borderColor: done ? theme.colors.success : theme.colors.border,
                  backgroundColor: done ? theme.colors.successLight : 'transparent',
                },
              ]}
            >
              <AppIcon
                name={done ? 'checkmark' : 'ellipse-outline'}
                size={14}
                color={done ? theme.colors.success : theme.colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.stepText,
                { color: active ? theme.colors.text : theme.colors.textSecondary },
              ]}
            >
              {step}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  stepLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  currentCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  currentText: {
    ...typography.headline,
    lineHeight: 24,
  },
  nextBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextLabel: {
    ...typography.callout,
    color: '#FFFFFF',
  },
  listTitle: {
    ...typography.label,
    marginTop: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    ...typography.body,
    flex: 1,
  },
});
