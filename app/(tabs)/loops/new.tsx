import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { statusForType, useLoops } from '../../../context/LoopContext';
import { useTheme } from '../../../context/ThemeContext';
import type { LoopAttachment, LoopType, Priority, RiskLevel, Category } from '../../../types';
import { CaptureTemplatePicker } from '../../../components/CaptureTemplatePicker';
import { DatePickerField } from '../../../components/DatePickerField';
import { ChipSelector } from '../../../components/ChipSelector';
import { ScreenScroll } from '../../../components/ScreenScroll';
import { hapticLight, hapticSuccess } from '../../../lib/haptics';
import {
  getCaptureTemplate,
  LOOP_TYPE_HELP,
  type CaptureTemplateId,
} from '../../../lib/captureTemplates';
import { requestReminderPermission, scheduleLoopReminder } from '../../../lib/reminders';
import { radius, spacing, typography } from '../../../lib/theme';
import { analyzeLoopText } from '../../../lib/heuristics';
import { generateId, loopTypeLabels, categoryLabels, getPriorityColor, getRiskColor, priorityLabels, riskLevelLabels } from '../../../lib/utils';
import { cancelLoopReminder } from '../../../lib/reminders';

const loopTypes: LoopType[] = [
  'waiting_on_others',
  'promised_by_me',
  'decision_needed',
  'blocked',
  'follow_up',
  'due',
];

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
const riskLevels: RiskLevel[] = ['none', 'low', 'medium', 'high'];
const categories: Category[] = ['work', 'personal', 'finance', 'health', 'home', 'other'];

export default function NewLoopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    template?: string;
    type?: string;
    priority?: string;
    riskLevel?: string;
    category?: string;
  }>();
  const { loops, addLoop, updateLoop } = useLoops();

  const editId = typeof params.id === 'string' ? params.id : undefined;
  const editingLoop = useMemo(
    () => (editId ? loops.find((l) => l.id === editId) : undefined),
    [editId, loops]
  );
  const isEditing = Boolean(editingLoop);

  const initialTemplate = getCaptureTemplate(
    typeof params.template === 'string' ? params.template : undefined
  );

  const [templateId, setTemplateId] = useState<CaptureTemplateId | undefined>(
    initialTemplate?.id
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LoopType>(initialTemplate?.type ?? 'follow_up');
  const [priority, setPriority] = useState<Priority>(initialTemplate?.priority ?? 'medium');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(initialTemplate?.riskLevel ?? 'none');
  const [category, setCategory] = useState<Category>(initialTemplate?.category ?? 'work');
  const [personName, setPersonName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderWhen, setReminderWhen] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [attachments, setAttachments] = useState<LoopAttachment[]>([]);
  const [saving, setSaving] = useState(false);

  const [userModifiedOptions, setUserModifiedOptions] = useState(false);

  useEffect(() => {
    if (!editingLoop) return;
    setTitle(editingLoop.title);
    setDescription(editingLoop.description ?? '');
    setType(editingLoop.type);
    setPriority(editingLoop.priority);
    setRiskLevel(editingLoop.riskLevel);
    setCategory(editingLoop.category);
    setPersonName(
      editingLoop.waitingOn?.name ?? editingLoop.promisedTo?.name ?? ''
    );
    setDueDate(editingLoop.dueDate ?? '');
    setReminderWhen(editingLoop.reminderAt ?? '');
    setAttachments(editingLoop.attachments ?? []);
    setUserModifiedOptions(true);
  }, [editingLoop?.id]);

  useEffect(() => {
    if (userModifiedOptions || isEditing) return;
    const heuristics = analyzeLoopText(`${title} ${description}`);

    if (heuristics.type) setType(heuristics.type);
    if (heuristics.priority) setPriority(heuristics.priority);
    if (heuristics.riskLevel) setRiskLevel(heuristics.riskLevel);
    if (heuristics.waitingOnName && !personName) setPersonName(heuristics.waitingOnName);
  }, [title, description, userModifiedOptions, personName, isEditing]);

  const activeTemplate = useMemo(
    () => (templateId ? getCaptureTemplate(templateId) : undefined),
    [templateId]
  );

  const applyTemplate = useCallback((id: CaptureTemplateId) => {
    const t = getCaptureTemplate(id);
    if (!t) return;
    setTemplateId(id);
    setType(t.type);
    setPriority(t.priority);
    setRiskLevel(t.riskLevel);
    setCategory(t.category);
  }, []);

  useEffect(() => {
    if (initialTemplate) applyTemplate(initialTemplate.id);
    else if (params.type && loopTypes.includes(params.type as LoopType)) {
      setType(params.type as LoopType);
    }
    if (params.priority && priorities.includes(params.priority as Priority)) {
      setPriority(params.priority as Priority);
    }
    if (params.riskLevel && riskLevels.includes(params.riskLevel as RiskLevel)) {
      setRiskLevel(params.riskLevel as RiskLevel);
    }
    if (params.category && categories.includes(params.category as Category)) {
      setCategory(params.category as Category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titlePlaceholder =
    activeTemplate?.titlePlaceholder ?? 'What needs to stay on your radar?';
  const descriptionPlaceholder =
    activeTemplate?.descriptionPlaceholder ?? 'Context, stakes, and what done looks like…';
  const personLabel =
    activeTemplate?.personLabel ?? 'Person (optional)';

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give this open loop a clear title before saving.');
      return;
    }

    setSaving(true);
    try {
      await hapticLight();
      const person = personName.trim()
        ? { id: `person-${Date.now()}`, name: personName.trim() }
        : undefined;

      const reminderAt = reminderWhen.trim() || undefined;
      let reminderEnabled = false;
      if (reminderAt) {
        const when = new Date(reminderAt);
        if (Number.isNaN(when.getTime())) {
          Alert.alert('Invalid reminder', 'Choose a valid reminder date and time.');
          setSaving(false);
          return;
        }
        const granted = await requestReminderPermission();
        if (!granted) {
          Alert.alert(
            'Notifications needed',
            'Local reminders need notification permission on this device. No remote push is used.'
          );
          setSaving(false);
          return;
        }
        reminderEnabled = true;
      }

      const loopFields = {
        title: title.trim(),
        description: description.trim(),
        type,
        status: statusForType(type),
        priority,
        riskLevel,
        category,
        owner: editingLoop?.owner ?? { id: 'me', name: 'You' },
        waitingOn: type === 'waiting_on_others' || type === 'blocked' ? person : undefined,
        promisedTo: type === 'promised_by_me' ? person : undefined,
        dueDate: dueDate.trim() || undefined,
        reminderEnabled,
        reminderAt: reminderEnabled ? reminderAt : undefined,
        reminderLabel: reminderEnabled ? `Follow up: ${title.trim()}` : undefined,
        attachments,
      };

      if (isEditing && editingLoop) {
        if (!reminderEnabled && editingLoop.localNotificationId) {
          await cancelLoopReminder(editingLoop);
        }

        await updateLoop(editingLoop.id, {
          ...loopFields,
          ...(reminderEnabled
            ? {}
            : {
                snoozedUntil: undefined,
                localNotificationId: undefined,
              }),
        });

        if (reminderEnabled && reminderAt) {
          const merged = {
            ...editingLoop,
            ...loopFields,
            reminderEnabled: true,
            reminderAt,
          };
          const notificationId = await scheduleLoopReminder(merged);
          await updateLoop(editingLoop.id, {
            localNotificationId: notificationId ?? undefined,
          });
        }

        await hapticSuccess();
        Alert.alert('Loop updated', 'Your changes were saved on this device.', [
          { text: 'Done', onPress: () => router.back() },
        ]);
        return;
      }

      const created = await addLoop({ ...loopFields, decisions: [] });

      if (reminderEnabled && reminderAt) {
        const notificationId = await scheduleLoopReminder({
          ...created,
          reminderEnabled: true,
          reminderAt,
        });
        if (notificationId) {
          await updateLoop(created.id, { localNotificationId: notificationId });
        }
      }

      await hapticSuccess();
      Alert.alert('Loop captured', 'Your open loop is saved on this device.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save loop. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addLinkAttachment = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const now = new Date().toISOString();
    setAttachments((prev) => [
      {
        id: generateId(),
        type: 'link',
        title: url.replace(/^https?:\/\//, '').slice(0, 40) || 'Link',
        url,
        createdAt: now,
      },
      ...prev,
    ]);
    setLinkUrl('');
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const canSave = title.trim().length > 0 && !saving && (!editId || editingLoop);
  const canAddLink = linkUrl.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
    >
      <Stack.Screen options={{ title: isEditing ? 'Edit Loop' : 'New Loop' }} />
      <ScreenScroll contentContainerStyle={{ paddingBottom: spacing.xxxl + insets.bottom }}>
        {!isEditing ? (
          <CaptureTemplatePicker
          selectedId={templateId}
          onSelect={(id) => {
            void hapticLight();
            applyTemplate(id);
          }}
        />
        ) : null}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What is this loop?</Text>

        <Text style={[styles.label, styles.firstLabel, { color: theme.colors.textSecondary }]}>
          Title
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder={titlePlaceholder}
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder={descriptionPlaceholder}
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Loop type</Text>
        <View style={styles.chipRow}>
          {loopTypes.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                type === t && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
              ]}
              onPress={() => {
                setType(t);
                setUserModifiedOptions(true);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme.colors.textSecondary },
                  type === t && { color: theme.colors.primary, fontWeight: '800' },
                ]}
              >
                {loopTypeLabels[t]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>{LOOP_TYPE_HELP[type]}</Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>People & timing</Text>

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{personLabel}</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={personName}
          onChangeText={setPersonName}
          placeholder="Name"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Due date</Text>
        <DatePickerField
          value={dueDate}
          onChange={setDueDate}
          mode="date"
          placeholder="Select due date"
          style={styles.pickerField}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Local reminder (optional)</Text>
        <DatePickerField
          value={reminderWhen}
          onChange={setReminderWhen}
          mode="datetime"
          placeholder="Select reminder date & time"
          style={styles.pickerField}
        />
        <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
          Permission is requested only when you save with a reminder set.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Priority & risk</Text>

        <ChipSelector
          label="Priority"
          options={priorities}
          value={priority}
          onChange={(v) => { setPriority(v); setUserModifiedOptions(true); }}
          formatLabel={(p) => priorityLabels[p]}
          toneForValue={(p) => getPriorityColor(p)}
        />

        <ChipSelector
          label="Risk level"
          options={riskLevels}
          value={riskLevel}
          onChange={(v) => { setRiskLevel(v); setUserModifiedOptions(true); }}
          formatLabel={(r) => riskLevelLabels[r]}
          toneForValue={(r) => getRiskColor(r)}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <Pressable
              key={c}
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                category === c && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
              ]}
              onPress={() => {
                setCategory(c);
                setUserModifiedOptions(true);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme.colors.textSecondary },
                  category === c && { color: theme.colors.primary, fontWeight: '800' },
                ]}
              >
                {categoryLabels[c]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Attachments</Text>
        <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
          Links save securely on this device.
        </Text>

        <View style={styles.attachRow}>
          <TextInput
            style={[
              styles.input,
              styles.linkInput,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
            ]}
            value={linkUrl}
            onChangeText={setLinkUrl}
            placeholder="Paste a link…"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
          />
          <Pressable
            onPress={() => {
              void hapticLight();
              addLinkAttachment();
            }}
            disabled={!canAddLink}
            style={({ pressed }) => [
              styles.addLinkButton,
              { backgroundColor: theme.colors.primary },
              !canAddLink && styles.disabled,
              canAddLink && pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addLinkButtonText}>Add</Text>
          </Pressable>
        </View>

        {attachments.length > 0 ? (
          <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
            {attachments.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.attachmentRow,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.attachmentTitle, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                  {a.title}
                </Text>
                <Pressable onPress={() => removeAttachment(a.id)}>
                  <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
            !canSave && styles.disabled,
            canSave && pressed && styles.pressed,
          ]}
          onPress={() => void handleSave()}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create loop'}
          </Text>
        </Pressable>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionTitle: {
    ...typography.headline,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  firstLabel: { marginTop: 0 },
  label: {
    ...typography.callout,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  helperText: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
  },
  pickerField: {
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '800',
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkInput: { flex: 1 },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  attachmentTitle: {
    ...typography.callout,
  },
  addLinkButton: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  addLinkButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  saveButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  saveButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
