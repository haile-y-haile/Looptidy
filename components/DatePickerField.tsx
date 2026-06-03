import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  formatPickerLabel,
  formatStoredDate,
  formatStoredDateTime,
  parseStoredDate,
} from '../lib/dateValues';
import { radius, spacing, typography } from '../lib/theme';

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  mode?: 'date' | 'datetime';
  placeholder?: string;
  minimumDate?: Date;
  style?: ViewStyle;
  onClear?: () => void;
};

export function DatePickerField({
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select date',
  minimumDate,
  style,
  onClear,
}: DatePickerFieldProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseStoredDate(value));

  const label = useMemo(() => formatPickerLabel(value, mode), [mode, value]);

  const openPicker = () => {
    setDraft(parseStoredDate(value));
    setOpen(true);
  };

  const commit = (date: Date) => {
    onChange(mode === 'date' ? formatStoredDate(date) : formatStoredDateTime(date));
    setOpen(false);
  };

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'dismissed' || !selected) return;
      commit(selected);
      return;
    }
    if (selected) setDraft(selected);
  };

  const clearValue = () => {
    onChange('');
    onClear?.();
  };

  return (
    <View style={style}>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          pressed && { opacity: 0.92 },
        ]}
      >
        <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
        <Text
          style={[
            styles.fieldText,
            { color: label ? theme.colors.text : theme.colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {label || placeholder}
        </Text>
        {value ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              clearValue();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear date"
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
        )}
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setOpen(false)}>
                  <Text style={[styles.sheetAction, { color: theme.colors.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                  {mode === 'date' ? 'Select date' : 'Select date & time'}
                </Text>
                <Pressable onPress={() => commit(draft)}>
                  <Text style={[styles.sheetAction, { color: theme.colors.primary }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode={mode}
                display="spinner"
                minimumDate={minimumDate}
                onChange={onPickerChange}
                themeVariant={theme.isDark ? 'dark' : 'light'}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : open ? (
        <DateTimePicker
          value={draft}
          mode={mode}
          display="default"
          minimumDate={minimumDate}
          onChange={onPickerChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  fieldText: {
    ...typography.body,
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheetTitle: {
    ...typography.callout,
    fontWeight: '700',
  },
  sheetAction: {
    ...typography.callout,
    fontWeight: '700',
  },
});
