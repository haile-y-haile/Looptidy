import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLoops } from '../../context/LoopContext';
import type { LoopType, Priority, RiskLevel, Category } from '../../types';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { loopTypeLabels, categoryLabels } from '../../lib/utils';

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
  const { addLoop } = useLoops();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LoopType>('follow_up');
  const [priority, setPriority] = useState<Priority>('medium');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('none');
  const [category, setCategory] = useState<Category>('work');
  const [personName, setPersonName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for this loop.');
      return;
    }

    setSaving(true);
    try {
      const person = personName.trim()
        ? { id: `person-${Date.now()}`, name: personName.trim() }
        : undefined;

      await addLoop({
        title: title.trim(),
        description: description.trim(),
        type,
        status: type === 'blocked' ? 'blocked' : type === 'waiting_on_others' ? 'waiting' : 'open',
        priority,
        riskLevel,
        category,
        owner: { id: 'me', name: 'You' },
        waitingOn: type === 'waiting_on_others' || type === 'blocked' ? person : undefined,
        promisedTo: type === 'promised_by_me' ? person : undefined,
        dueDate: dueDate.trim() || undefined,
        decisions: [],
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save loop. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be tracked?"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add context..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {loopTypes.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, type === t && styles.chipSelected]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>
                {loopTypeLabels[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>
          {type === 'promised_by_me' ? 'Promised To' : 'Waiting On / Person'}
        </Text>
        <TextInput
          style={styles.input}
          value={personName}
          onChangeText={setPersonName}
          placeholder="Name (optional)"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD (optional)"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.chipRow}>
          {priorities.map((p) => (
            <Pressable
              key={p}
              style={[styles.chip, priority === p && styles.chipSelected]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.chipText, priority === p && styles.chipTextSelected]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Risk Level</Text>
        <View style={styles.chipRow}>
          {riskLevels.map((r) => (
            <Pressable
              key={r}
              style={[styles.chip, riskLevel === r && styles.chipSelected]}
              onPress={() => setRiskLevel(r)}
            >
              <Text style={[styles.chipText, riskLevel === r && styles.chipTextSelected]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, category === c && styles.chipSelected]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextSelected]}>
                {categoryLabels[c]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
            saving && styles.disabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Create Loop'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  label: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.surface,
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
