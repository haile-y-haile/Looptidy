import { useMemo, useState } from 'react';
import type { OpenLoop } from '../../types';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { EmptyState } from '../../components/EmptyState';
import { LoopCard } from '../../components/LoopCard';
import { ScreenScroll } from '../../components/ScreenScroll';
import { buildPeopleSummaries, getLoopsForPerson } from '../../lib/people';
import { buildNudgeForPersonKey } from '../../lib/nudge';
import { hapticLight, hapticSuccess } from '../../lib/haptics';
import { radius, spacing, typography } from '../../lib/theme';

export default function PersonDetailScreen() {
  const { personKey: keyParam } = useLocalSearchParams<{ personKey: string | string[] }>();
  const personKey = Array.isArray(keyParam) ? keyParam[0] : keyParam;
  const router = useRouter();
  const { theme } = useTheme();
  const { loops } = useLoops();

  const summaries = useMemo(() => buildPeopleSummaries(loops), [loops]);
  const person = useMemo(
    () => summaries.find((p) => p.key === personKey),
    [summaries, personKey]
  );
  const sections = useMemo(
    () => (personKey ? getLoopsForPerson(loops, personKey) : null),
    [loops, personKey]
  );

  if (!person || !sections) {
    return (
      <ScreenScroll>
        <EmptyState title="Person not found" message="They may not appear in any loops yet." />
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/people'))}
          style={({ pressed }) => [styles.notFoundBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={[styles.notFoundBtnText, { color: theme.colors.primary }]}>
            Back to People
          </Text>
        </Pressable>
      </ScreenScroll>
    );
  }

  const nudge = buildNudgeForPersonKey(summaries, loops, person.key);

  return (
    <>
      <Stack.Screen options={{ title: person.name }} />
      <ScreenScroll>
        {person.role ? (
          <Text style={[styles.role, { color: theme.colors.textSecondary }]}>{person.role}</Text>
        ) : null}
        {person.email ? (
          <Pressable
            onPress={() => void Linking.openURL(`mailto:${person.email}`)}
            style={({ pressed }) => pressed && { opacity: 0.85 }}
          >
            <Text style={[styles.email, { color: theme.colors.primary }]}>{person.email}</Text>
          </Pressable>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              void hapticLight();
              router.push({
                pathname: '/loops/new',
                params: {
                  type: 'waiting_on_others',
                  personName: person.name,
                },
              });
            }}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: theme.colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.actionBtnText}>Create loop</Text>
          </Pressable>
          {nudge ? (
            <Pressable
              onPress={() => {
                void (async () => {
                  await Clipboard.setStringAsync(nudge);
                  void hapticSuccess();
                  Alert.alert('Copied', 'Nudge message copied to clipboard.');
                })();
              }}
              style={({ pressed }) => [
                styles.actionBtnOutline,
                { borderColor: theme.colors.border },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={[styles.actionBtnOutlineText, { color: theme.colors.text }]}>
                Copy nudge
              </Text>
            </Pressable>
          ) : null}
        </View>

        {nudge ? (
          <View
            style={[
              styles.nudgePreview,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.nudgeLabel, { color: theme.colors.textMuted }]}>
              Suggested nudge
            </Text>
            <Text style={[styles.nudgeText, { color: theme.colors.textSecondary }]}>{nudge}</Text>
          </View>
        ) : null}

        <PersonSection title="Waiting on this person" loops={sections.waiting} />
        <PersonSection title="Promises I made" loops={sections.promised} />
        <PersonSection title="Decisions involving them" loops={sections.decisions} />
        <PersonSection title="Blocked" loops={sections.blocked} />
        <PersonSection title="Closed loops" loops={sections.closed} collapsed />
      </ScreenScroll>
    </>
  );
}

function PersonSection({
  title,
  loops,
  collapsed = false,
}: {
  title: string;
  loops: OpenLoop[];
  collapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed && loops.length > 0);
  return (
    <CollapsibleSection
      title={title}
      count={loops.length}
      collapsed={isCollapsed}
      onToggle={() => setIsCollapsed((c) => !c)}
    >
      {loops.length > 0 ? (
        loops.map((loop, i) => <LoopCard key={loop.id} loop={loop} index={i} />)
      ) : (
        <EmptyState compact title="No loops" message="No loops in this group." />
      )}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  notFoundBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  notFoundBtnText: {
    ...typography.callout,
    fontWeight: '700',
  },
  role: {
    ...typography.callout,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionBtnText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  actionBtnOutline: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionBtnOutlineText: {
    ...typography.callout,
    fontWeight: '800',
  },
  nudgePreview: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  nudgeLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  nudgeText: {
    ...typography.caption,
    lineHeight: 20,
  },
});
