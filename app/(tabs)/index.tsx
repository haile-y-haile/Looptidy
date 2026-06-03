import { View, Text, StyleSheet, Pressable, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { QuickCaptureSheet } from '../../components/QuickCaptureSheet';
import { Animated as RNAnimated, Easing } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import { LoopCard } from '../../components/LoopCard';
import { EmptyState } from '../../components/EmptyState';
import { ScreenScroll } from '../../components/ScreenScroll';
import { ScreenCentered } from '../../components/ScreenCentered';
import { GlassCard } from '../../components/GlassCard';
import { hapticLight, hapticSuccess } from '../../lib/haptics';
import { radius, spacing, typography } from '../../lib/theme';
import type { OpenLoop } from '../../types';
import { isDueSoon, isOpenLoop, isOverdue } from '../../lib/utils';
import { useScopeChanges } from '../../context/ScopeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { PMSignalsCard } from '../../components/PMSignalsCard';
import { computePMSignals } from '../../lib/pmSignals';
import { buildLoopNudgeMessage } from '../../lib/nudge';
import { getWeeklyReviewBannerDismissed, setWeeklyReviewBannerDismissed } from '../../lib/preferences';
import { Ionicons } from '@expo/vector-icons';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { loops, loading, refreshLoops } = useLoops();
  const { scopeChanges } = useScopeChanges();
  const { feedbackItems } = useFeedback();

  const pmSignals = useMemo(
    () => computePMSignals(loops, scopeChanges, feedbackItems),
    [loops, scopeChanges, feedbackItems]
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [showWeeklyBanner, setShowWeeklyBanner] = useState(false);

  const headerEnter = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const day = new Date().getDay();
      // Show Friday (5), Saturday (6), Sunday (0)
      if (day === 5 || day === 6 || day === 0) {
        const dismissed = await getWeeklyReviewBannerDismissed();
        if (!cancelled && !dismissed) {
          setShowWeeklyBanner(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openLoops = loops.filter(isOpenLoop);
  
  const dueCount = openLoops.filter((l) => l.dueDate && (isDueSoon(l.dueDate) || isOverdue(l.dueDate))).length;
  const overdueCount = openLoops.filter((l) => l.dueDate && isOverdue(l.dueDate)).length;

  const scoreLoop = (l: OpenLoop) => {
    let s = 0;
    if (l.dueDate && isOverdue(l.dueDate)) s += 120;
    if (l.dueDate && isDueSoon(l.dueDate)) s += 80;
    if (l.priority === 'urgent') s += 70;
    if (l.priority === 'high') s += 40;
    if (l.riskLevel === 'high') s += 60;
    if (l.riskLevel === 'medium') s += 25;
    if (l.status === 'blocked') s += 35;
    if (l.type === 'waiting_on_others') s += 20;
    return s;
  };

  const focusLoop = useMemo(() => {
    return [...openLoops].sort((a, b) => scoreLoop(b) - scoreLoop(a))[0];
  }, [openLoops]);

  const upNext = useMemo(() => {
    return [...openLoops].sort((a, b) => scoreLoop(b) - scoreLoop(a)).slice(0, 3);
  }, [openLoops]);

  const onRefresh = async () => {
    setRefreshing(true);
    await hapticLight();
    try {
      await refreshLoops();
      await hapticSuccess();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    RNAnimated.timing(headerEnter, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerEnter]);

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  const handleDismissBanner = async () => {
    await hapticLight();
    setShowWeeklyBanner(false);
    await setWeeklyReviewBannerDismissed();
  };

  return (
    <ScreenScroll
      contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={theme.colors.primary}
        />
      }
    >
      <RNAnimated.View
        style={{
          opacity: headerEnter,
          transform: [
            { translateY: headerEnter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          ],
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>Today</Text>
          <View style={styles.metaLine}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {openLoops.length} need attention{dueCount > 0 ? ` · ${dueCount} due soon` : ''}{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}
          </Text>
        </View>
      </View>
      </RNAnimated.View>

      {showWeeklyBanner ? (
        <View style={[styles.banner, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
          <View style={styles.bannerTexts}>
            <Text style={[styles.bannerTitle, { color: theme.colors.primary }]}>Weekly review</Text>
            <Text style={[styles.bannerSub, { color: theme.colors.text }]}>Ready to triage your open loops for the week?</Text>
          </View>
          <View style={styles.bannerActions}>
            <Pressable
              onPress={() => {
                void hapticLight();
                router.push('/weekly-review');
              }}
              style={({ pressed }) => [styles.bannerBtn, { backgroundColor: theme.colors.primary }, pressed && styles.pressed]}
            >
              <Text style={styles.bannerBtnText}>Start</Text>
            </Pressable>
            <Pressable onPress={handleDismissBanner} style={({ pressed }) => [styles.bannerDismiss, pressed && styles.pressed]}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <GlassCard style={styles.focusCard} intensity={45} contentPadding={spacing.xxl}>
        <Text style={[styles.focusLabel, { color: theme.colors.textMuted }]}>Today's focus</Text>
        {focusLoop ? (
          <>
            <Text style={[styles.focusTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {focusLoop.title}
            </Text>
            <Text style={[styles.focusSub, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {focusLoop.waitingOn ? `Waiting on ${focusLoop.waitingOn.name}` : focusLoop.promisedTo ? `Promised to ${focusLoop.promisedTo.name}` : ''}
            </Text>
            <View style={styles.focusActions}>
              <Pressable
                onPress={() => {
                  void hapticLight();
                  router.push(`/loops/${focusLoop.id}`);
                }}
                style={({ pressed }) => [
                  styles.focusButtonPrimary,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.focusButtonPrimaryText}>Open</Text>
              </Pressable>
              {focusLoop.waitingOn || focusLoop.promisedTo ? (
                <Pressable
                  onPress={async () => {
                    void hapticLight();
                    const msg = buildLoopNudgeMessage(focusLoop);
                    await Clipboard.setStringAsync(msg);
                    Alert.alert('Copied', 'Follow-up message copied to clipboard.');
                  }}
                  style={({ pressed }) => [
                    styles.focusButtonSecondary,
                    { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.focusButtonSecondaryText, { color: theme.colors.text }]}>
                    Copy follow-up
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : (
          <EmptyState compact title="All clear" message="No urgent loops need attention right now." />
        )}
      </GlassCard>

      <PMSignalsCard signals={pmSignals} />

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            pressed && styles.pressed,
          ]}
          onPress={() => {
            void hapticLight();
            setQuickCaptureOpen(true);
          }}
        >
          <Text style={styles.primaryButtonText}>Quick capture</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push('/loops/new')}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
            New loop
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Up Next</Text>
      <Animated.FlatList
        data={upNext}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <LoopCard loop={item} index={index} />}
        itemLayoutAnimation={LinearTransition.springify()}
        scrollEnabled={false}
        contentContainerStyle={styles.upNextList}
        ListEmptyComponent={
          <EmptyState compact title="Nothing up next" message="You're in good shape." />
        }
      />

      <View style={styles.linkRow}>
        <Pressable
          onPress={() => router.push('/insights')}
          style={({ pressed }) => [
            styles.footerLink,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.footerLinkText, { color: theme.colors.text }]}>Insights</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/people')}
          style={({ pressed }) => [
            styles.footerLink,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.footerLinkText, { color: theme.colors.text }]}>People</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/weekly-review')}
          style={({ pressed }) => [
            styles.footerLink,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.footerLinkText, { color: theme.colors.text }]}>Weekly review</Text>
        </Pressable>
      </View>

      <QuickCaptureSheet visible={quickCaptureOpen} onClose={() => setQuickCaptureOpen(false)} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.largeTitle,
  },
  metaLine: {
    marginTop: spacing.xs,
  },
  metaText: {
    ...typography.body,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  bannerTexts: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.callout,
    fontWeight: '800',
  },
  bannerSub: {
    ...typography.caption,
    marginTop: 2,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bannerBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  bannerBtnText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bannerDismiss: {
    padding: spacing.xs,
  },
  focusCard: {
    marginBottom: spacing.lg,
  },
  focusLabel: {
    ...typography.label,
  },
  focusTitle: {
    ...typography.title,
    marginTop: spacing.sm,
  },
  focusSub: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  focusActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  focusButtonPrimary: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  focusButtonPrimaryText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  focusButtonSecondary: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  focusButtonSecondaryText: {
    ...typography.callout,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...typography.callout,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  upNextList: {
    marginBottom: spacing.xxl,
  },
  linkRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
    flexWrap: 'wrap',
  },
  footerLink: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  footerLinkText: {
    ...typography.caption,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
