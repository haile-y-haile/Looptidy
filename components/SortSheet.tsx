import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['40%', '60%']}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      <BottomSheetView style={[styles.sheet, { paddingBottom: spacing.xxl + insets.bottom }]}>
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
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
