import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { CAPTURE_TEMPLATES, type CaptureTemplateId } from '../lib/captureTemplates';
import { hapticLight } from '../lib/haptics';
import { radius, spacing, typography } from '../lib/theme';

export function QuickCaptureSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pick = (templateId: CaptureTemplateId) => {
    void hapticLight();
    onClose();
    if (templateId === 'decision_needed') {
      router.push('/decision-speed');
      return;
    }
    if (templateId === 'meeting_dump') {
      router.push('/meeting-dump');
      return;
    }
    router.push({ pathname: '/loops/new', params: { template: templateId } });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Quick capture</Text>
          <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
            Start a new open loop with a template.
          </Text>
          {CAPTURE_TEMPLATES.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => pick(t.id)}
              style={({ pressed }) => [
                styles.row,
                { borderColor: theme.colors.borderLight },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{t.label}</Text>
              <Text style={[styles.rowSub, { color: theme.colors.textMuted }]}>{t.subtitle}</Text>
            </Pressable>
          ))}
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
    padding: spacing.lg,
    maxHeight: '80%',
  },
  title: {
    ...typography.title,
  },
  sub: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  rowTitle: {
    ...typography.callout,
    fontWeight: '800',
  },
  rowSub: {
    ...typography.caption,
    marginTop: 2,
  },
});
