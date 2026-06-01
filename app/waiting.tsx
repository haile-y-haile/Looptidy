import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { LoopCard } from '../components/LoopCard';
import { EmptyState } from '../components/EmptyState';
import { colors, spacing } from '../lib/theme';
import { isOpenLoop } from '../lib/utils';

export default function WaitingScreen() {
  const { loops, loading } = useLoops();
  const waitingLoops = loops.filter(
    (l) => isOpenLoop(l) && l.type === 'waiting_on_others'
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
      {waitingLoops.length > 0 ? (
        waitingLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          title="Nothing waiting"
          message="You're not waiting on anyone right now."
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
