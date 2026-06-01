import { useEffect, useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import type { LoopAttachment, LoopType, Priority, RiskLevel, Category } from '../../types';
import { ScreenScroll } from '../../components/ScreenScroll';
import { hapticLight, hapticSuccess } from '../../lib/haptics';
import { showComingSoon } from '../../lib/comingSoon';
import { radius, spacing, typography } from '../../lib/theme';
import { generateId, loopTypeLabels, categoryLabels } from '../../lib/utils';

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
  const params = useLocalSearchParams<{ type?: string; priority?: string; riskLevel?: string; category?: string }>();
  const { addLoop } = useLoops();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LoopType>('follow_up');
  const [priority, setPriority] = useState<Priority>('medium');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('none');
  const [category, setCategory] = useState<Category>('work');
  const [personName, setPersonName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [attachments, setAttachments] = useState<LoopAttachment[]>([]);
  const [saving, setSaving] = useState(false);

  const template = useMemo(() => {
    const t = params.type;
    const p = params.priority;
    const r = params.riskLevel;
    const c = params.category;
    const out: Partial<{ type: LoopType; priority: Priority; riskLevel: RiskLevel; category: Category }> = {};
    if (t && loopTypes.includes(t as LoopType)) out.type = t as LoopType;
    if (p && priorities.includes(p as Priority)) out.priority = p as Priority;
    if (r && riskLevels.includes(r as RiskLevel)) out.riskLevel = r as RiskLevel;
    if (c && categories.includes(c as Category)) out.category = c as Category;
    return out;
  }, [params.category, params.priority, params.riskLevel, params.type]);

  useEffect(() => {
    if (template.type) setType(template.type);
    if (template.priority) setPriority(template.priority);
    if (template.riskLevel) setRiskLevel(template.riskLevel);
    if (template.category) setCategory(template.category);
    // Only on initial mount/template change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for this loop.');
      return;
    }

    setSaving(true);
    try {
      await hapticLight();
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
        attachments,
      });
      await hapticSuccess();
      router.back();
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
    const newAttachment: LoopAttachment = {
      id: generateId(),
      type: 'link',
      title: url.replace(/^https?:\/\//, '').slice(0, 40) || 'Link',
      url,
      createdAt: now,
    };
    setAttachments((prev) => [newAttachment, ...prev]);
    setLinkUrl('');
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const comingSoon = (label: string) => {
    showComingSoon(`${label} attachments`);
  };

  const canSave = title.trim().length > 0 && !saving;
  const canAddLink = linkUrl.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
    >
      <ScreenScroll contentContainerStyle={{ paddingBottom: spacing.xxxl + insets.bottom }}>
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
          placeholder="e.g. Follow up with Alex on proposal"
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
          placeholder="Add context..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type</Text>
        <View style={styles.chipRow}>
          {loopTypes.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                type === t && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
              ]}
              onPress={() => setType(t)}
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

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {type === 'promised_by_me' ? 'Promised To' : 'Waiting On / Person'}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={personName}
          onChangeText={setPersonName}
          placeholder="Name (optional)"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Due Date</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="Mar 15, 2026 or 2026-03-15"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Priority</Text>
        <View style={styles.chipRow}>
          {priorities.map((p) => (
            <Pressable
              key={p}
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                priority === p && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme.colors.textSecondary },
                  priority === p && { color: theme.colors.primary, fontWeight: '800' },
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Risk Level</Text>
        <View style={styles.chipRow}>
          {riskLevels.map((r) => (
            <Pressable
              key={r}
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                riskLevel === r && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
              ]}
              onPress={() => setRiskLevel(r)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme.colors.textSecondary },
                  riskLevel === r && { color: theme.colors.primary, fontWeight: '800' },
                ]}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

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
              onPress={() => setCategory(c)}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sharing</Text>
          <Pressable
            style={({ pressed }) => [
              styles.shareCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              void hapticLight();
              showComingSoon('Loop sharing');
            }}
          >
            <Text style={[styles.shareTitle, { color: theme.colors.text }]}>Share this loop</Text>
            <Text style={[styles.shareSub, { color: theme.colors.textSecondary }]}>
              Share with other LoopTidy users once accounts launch.
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Attachments (optional)</Text>
        <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
          Links save on this device. Photos, documents, and other files are coming soon.
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
            autoCorrect={false}
          />
          <Pressable
            onPress={() => {
              void hapticLight();
              addLinkAttachment();
            }}
            disabled={!canAddLink}
            style={({ pressed }) => [
              styles.addLinkButton,
              { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              !canAddLink && styles.disabled,
              canAddLink && pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addLinkButtonText}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.attachTiles}>
          <Pressable
            onPress={() => {
              void hapticLight();
              comingSoon('Document');
            }}
            style={({ pressed }) => [
              styles.attachTile,
              styles.attachTileSoon,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.attachIcon}>📄</Text>
            <Text style={[styles.attachLabel, { color: theme.colors.textSecondary }]}>Document</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void hapticLight();
              comingSoon('Photo');
            }}
            style={({ pressed }) => [
              styles.attachTile,
              styles.attachTileSoon,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.attachIcon}>🖼️</Text>
            <Text style={[styles.attachLabel, { color: theme.colors.textSecondary }]}>Photo</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void hapticLight();
              comingSoon('Audio');
            }}
            style={({ pressed }) => [
              styles.attachTile,
              styles.attachTileSoon,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.attachIcon}>🎙️</Text>
            <Text style={[styles.attachLabel, { color: theme.colors.textSecondary }]}>Audio</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void hapticLight();
              comingSoon('Video');
            }}
            style={({ pressed }) => [
              styles.attachTile,
              styles.attachTileSoon,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.attachIcon}>🎬</Text>
            <Text style={[styles.attachLabel, { color: theme.colors.textSecondary }]}>Video</Text>
          </Pressable>
        </View>

        {attachments.length > 0 ? (
          <View style={styles.attachList}>
            {attachments.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.attachItem,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.attachItemTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {a.title}
                  </Text>
                  {a.url ? (
                    <Text style={[styles.attachItemMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
                      {a.url}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => removeAttachment(a.id)}
                  hitSlop={10}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text style={[styles.removeText, { color: theme.colors.danger }]}>Remove</Text>
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
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Create loop'}</Text>
        </Pressable>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  firstLabel: {
    marginTop: 0,
  },
  label: {
    ...typography.callout,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  helperText: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
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
  chipPressed: {
    opacity: 0.85,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  shareCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  shareTitle: {
    ...typography.callout,
    fontWeight: '900',
  },
  shareSub: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkInput: {
    flex: 1,
  },
  addLinkButton: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  addLinkButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  attachTiles: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  attachTile: {
    minWidth: 120,
    flexGrow: 1,
    flexBasis: '45%',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attachTileSoon: {
    opacity: 0.88,
  },
  attachIcon: {
    fontSize: 16,
  },
  attachLabel: {
    ...typography.caption,
    fontWeight: '800',
  },
  attachList: {
    marginTop: spacing.sm,
  },
  attachItem: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  attachItemTitle: {
    ...typography.callout,
    fontWeight: '800',
  },
  attachItemMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  removeText: {
    ...typography.caption,
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
