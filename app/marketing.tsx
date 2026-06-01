import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLockup } from '../components/BrandLockup';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { TAGLINE } from '../lib/fonts';
import { links } from '../lib/links';
import { radius, spacing, typography } from '../lib/theme';

function openUrl(url: string) {
  void Linking.openURL(url);
}

const FEATURES = [
  {
    title: 'Waiting on others',
    body: 'Track who owes you a reply, a deliverable, or a decision — without another spreadsheet.',
  },
  {
    title: 'Promises you made',
    body: 'Keep commitments visible so nothing slips when life gets busy.',
  },
  {
    title: 'Decisions & follow-ups',
    body: 'Capture outcomes and next steps so open questions do not linger.',
  },
  {
    title: 'Private by default',
    body: 'Your loops stay on your device. No account required for the MVP.',
  },
];

export default function MarketingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxxl },
          isWeb && styles.webScroll,
        ]}
      >
        <LinearGradient
          colors={
            theme.isDark
              ? ['rgba(13,148,136,0.28)', 'rgba(99,102,241,0.1)', 'transparent']
              : ['rgba(13,148,136,0.18)', 'rgba(99,102,241,0.06)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.hero, isWeb && styles.webHero]}>
          <BrandLockup variant="splash" logoSize={112} />
          <Text style={[styles.headline, { color: theme.colors.text }]}>
            Open loops,{'\n'}handled with care.
          </Text>
          <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
            LoopTidy is a calm place for follow-ups, promises, and decisions — personal enough for
            life, structured enough for work.
          </Text>
          <Text style={[styles.taglineAccent, { color: theme.colors.primary }]}>{TAGLINE}</Text>

          <View style={styles.ctaRow}>
            <PrimaryButton
              label="Join the TestFlight beta"
              onPress={() => openUrl(links.githubBetaRequest)}
              style={styles.cta}
            />
            <PrimaryButton
              label="Open the app"
              tone="secondary"
              onPress={() => router.replace('/')}
              style={styles.cta}
            />
            {router.canGoBack() ? (
              <Pressable onPress={() => router.back()} style={styles.secondaryCta}>
                <Text style={[styles.secondaryCtaText, { color: theme.colors.textSecondary }]}>
                  Back
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.linkRow}>
            <Pressable onPress={() => openUrl(links.testflightInstall)}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Install TestFlight
              </Text>
            </Pressable>
            <Text style={[styles.linkDot, { color: theme.colors.textMuted }]}>·</Text>
            <Pressable onPress={() => openUrl(links.githubRepo)}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>GitHub</Text>
            </Pressable>
            <Text style={[styles.linkDot, { color: theme.colors.textMuted }]}>·</Text>
            <Pressable onPress={() => openUrl(links.githubSupport)}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>Support</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => openUrl(links.githubBetaRequest)}
            style={({ pressed }) => [
              styles.storeBadge,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pressed && { opacity: 0.92 },
            ]}
          >
            <Image source={require('../assets/icon.png')} style={styles.storeIcon} />
            <View style={styles.storeCopy}>
              <Text style={[styles.storeTitle, { color: theme.colors.text }]}>LoopTidy for iOS</Text>
              <Text style={[styles.storeSub, { color: theme.colors.textMuted }]}>
                TestFlight beta — request an invite on GitHub
              </Text>
            </View>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Why LoopTidy</Text>
        <View style={[styles.featureGrid, isWeb && styles.webGrid]}>
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={[
                styles.featureCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureBody, { color: theme.colors.textSecondary }]}>
                {feature.body}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.footerCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.footerTitle, { color: theme.colors.text }]}>
            Ready to close what matters?
          </Text>
          <Text style={[styles.footerBody, { color: theme.colors.textSecondary }]}>
            Start with Today — your focus loop, due items, and a weekly review ritual.
          </Text>
          <PrimaryButton
            label="Request beta access"
            onPress={() => openUrl(links.githubBetaRequest)}
          />
          <Pressable onPress={() => router.replace('/')} style={styles.secondaryCta}>
            <Text style={[styles.secondaryCtaText, { color: theme.colors.textSecondary }]}>
              Already have the app? Open LoopTidy
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xxl,
  },
  webScroll: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  webHero: {
    paddingTop: spacing.xl,
  },
  headline: {
    ...typography.largeTitle,
    textAlign: 'center',
    fontSize: 34,
    lineHeight: 40,
  },
  lead: {
    ...typography.body,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 480,
  },
  taglineAccent: {
    ...typography.callout,
    textAlign: 'center',
  },
  ctaRow: {
    width: '100%',
    maxWidth: 360,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cta: {
    width: '100%',
  },
  secondaryCta: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryCtaText: {
    ...typography.callout,
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: 360,
  },
  linkText: {
    ...typography.callout,
  },
  linkDot: {
    ...typography.caption,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    marginTop: spacing.md,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  storeCopy: {
    flex: 1,
  },
  storeTitle: {
    ...typography.headline,
  },
  storeSub: {
    ...typography.caption,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.lg,
  },
  featureGrid: {
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexGrow: 1,
    flexBasis: '100%',
  },
  featureTitle: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  featureBody: {
    ...typography.body,
  },
  footerCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  footerTitle: {
    ...typography.title,
    textAlign: 'center',
  },
  footerBody: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
