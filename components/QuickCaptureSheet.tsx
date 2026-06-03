import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter as useExpoRouter } from 'expo-router';
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
  const router = useExpoRouter();
  const insets = useSafeAreaInsets();
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const pick = (templateId: CaptureTemplateId) => {
    void hapticLight();
    onClose();
    if (templateId === 'decision_needed') {
      router.push('/decision-speed');
      return;
    }
    router.push({ pathname: '/loops/new', params: { template: templateId } });
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['50%', '70%']}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      <BottomSheetView style={[styles.sheet, { paddingBottom: spacing.xxl + insets.bottom }]}>
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
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: spacing.lg,
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
