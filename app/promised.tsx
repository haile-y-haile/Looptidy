import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { LoopCard } from '../components/LoopCard';
import { EmptyState } from '../components/EmptyState';
import { colors, spacing } from '../lib/theme';
import { isOpenLoop } from '../lib/utils';

export default function PromisedScreen() {
  const { loops, loading } = useLoops();
  const promisedLoops = loops.filter(
    (l) => isOpenLoop(l) && l.type === 'promised_by_me'
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {promisedLoops.length > 0 ? (
        promisedLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          title="No open promises"
          message="You haven't committed to any follow-ups that are still open."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
