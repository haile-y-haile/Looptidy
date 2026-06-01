import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { ScreenScroll } from '../components/ScreenScroll';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import {
  backupToJson,
  buildFullBackup,
  decisionsToCsv,
  openLoopsToCsv,
  weeklyReviewsToCsv,
  weeklyReviewsToJson,
} from '../lib/export';
import { validateBackupJson } from '../lib/import';
import {
  clearWeeklyReviews,
  getWeeklyReviews,
  replaceWeeklyReviews,
} from '../lib/weeklyReviewStorage';
import { radius, spacing, typography } from '../lib/theme';

async function shareText(filename: string, body: string, mimeType: string) {
  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, body);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType, UTI: mimeType });
  } else {
    Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
  }
}

export default function BackupRestoreScreen() {
  const { theme } = useTheme();
  const { loops, replaceAllLoops, resetToDemoData, deleteAllLocalData, refreshLoops } =
    useLoops();
  const [busy, setBusy] = useState(false);

  const runExport = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      void hapticLight();
      await fn();
      void hapticSuccess();
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  const exportFullJson = () =>
    runExport(async () => {
      const reviews = await getWeeklyReviews();
      const backup = buildFullBackup(loops, reviews);
      await shareText(
        `looptidy-backup-${Date.now()}.json`,
        backupToJson(backup),
        'application/json'
      );
    });

  const exportOpenCsv = () =>
    runExport(async () => {
      await shareText(`looptidy-open-loops-${Date.now()}.csv`, openLoopsToCsv(loops), 'text/csv');
    });

  const exportDecisionsCsv = () =>
    runExport(async () => {
      await shareText(`looptidy-decisions-${Date.now()}.csv`, decisionsToCsv(loops), 'text/csv');
    });

  const exportReviewsJson = () =>
    runExport(async () => {
      const reviews = await getWeeklyReviews();
      await shareText(
        `looptidy-weekly-reviews-${Date.now()}.json`,
        weeklyReviewsToJson(reviews),
        'application/json'
      );
    });

  const exportReviewsCsv = () =>
    runExport(async () => {
      const reviews = await getWeeklyReviews();
      await shareText(
        `looptidy-weekly-reviews-${Date.now()}.csv`,
        weeklyReviewsToCsv(reviews),
        'text/csv'
      );
    });

  const importBackup = async () => {
    void hapticLight();
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    setBusy(true);
    try {
      const uri = result.assets[0].uri;
      const raw = await FileSystem.readAsStringAsync(uri);
      const validation = validateBackupJson(raw);
      if (!validation.ok) {
        Alert.alert('Invalid backup', validation.error);
        return;
      }

      Alert.alert(
        'Restore backup?',
        'This replaces all loops and weekly review history on this device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                await replaceAllLoops(validation.backup.loops);
                await replaceWeeklyReviews(validation.backup.weeklyReviews);
                await refreshLoops();
                void hapticSuccess();
                Alert.alert('Restore complete', 'Your LoopTidy data was restored from backup.');
              })();
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Import failed', e instanceof Error ? e.message : 'Could not read file.');
    } finally {
      setBusy(false);
    }
  };

  const confirmResetDemo = () => {
    Alert.alert('Reset demo data?', 'Loads the sample loops and replaces current loops.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: () => {
          void (async () => {
            await resetToDemoData();
            void hapticSuccess();
            Alert.alert('Done', 'Demo data has been restored.');
          })();
        },
      },
    ]);
  };

  const confirmDeleteAll = () => {
    Alert.alert(
      'Delete all local LoopTidy data?',
      'Removes all loops and weekly review history on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await deleteAllLocalData();
              await clearWeeklyReviews();
              void hapticSuccess();
              Alert.alert('Deleted', 'All local LoopTidy data has been removed.');
            })();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Backup & Restore' }} />
      <ScreenScroll>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Export and restore stays on your device. Use the share sheet to save files to Files or
          AirDrop.
        </Text>

        <Text style={[styles.section, { color: theme.colors.textMuted }]}>Export</Text>
        <GlassCard style={styles.card} intensity={28}>
          <ExportRow label="Full backup (JSON)" onPress={() => void exportFullJson()} disabled={busy} />
          <ExportRow label="Open loops (CSV)" onPress={() => void exportOpenCsv()} disabled={busy} />
          <ExportRow
            label="Decisions (CSV)"
            onPress={() => void exportDecisionsCsv()}
            disabled={busy}
          />
          <ExportRow
            label="Weekly reviews (JSON)"
            onPress={() => void exportReviewsJson()}
            disabled={busy}
          />
          <ExportRow
            label="Weekly reviews (CSV)"
            onPress={() => void exportReviewsCsv()}
            disabled={busy}
            isLast
          />
        </GlassCard>

        <Text style={[styles.section, { color: theme.colors.textMuted }]}>Restore</Text>
        <Pressable
          onPress={() => void importBackup()}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.colors.primary },
            (busy || pressed) && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.primaryBtnText}>Import LoopTidy JSON backup</Text>
        </Pressable>

        <Text style={[styles.section, { color: theme.colors.textMuted }]}>Danger zone</Text>
        <View
          style={[
            styles.dangerCard,
            { backgroundColor: theme.colors.dangerLight, borderColor: theme.colors.danger },
          ]}
        >
          <DangerRow label="Reset demo data" onPress={confirmResetDemo} />
          <DangerRow label="Delete all local loops" onPress={confirmDeleteAll} isLast />
          <Text style={[styles.dangerHint, { color: theme.colors.textSecondary }]}>
            Account deletion is unavailable — LoopTidy has no cloud accounts yet.
          </Text>
        </View>
      </ScreenScroll>
    </>
  );
}

function ExportRow({
  label,
  onPress,
  disabled,
  isLast,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[styles.rowAction, { color: theme.colors.primary }]}>Share</Text>
    </Pressable>
  );
}

function DangerRow({
  label,
  onPress,
  isLast,
}: {
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: `${theme.colors.danger}33` },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.dangerLabel, { color: theme.colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  section: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowLabel: {
    ...typography.callout,
  },
  rowAction: {
    ...typography.caption,
    fontWeight: '800',
  },
  primaryBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  primaryBtnText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dangerCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  dangerLabel: {
    ...typography.callout,
    fontWeight: '800',
  },
  dangerHint: {
    ...typography.caption,
    marginTop: spacing.md,
  },
});
