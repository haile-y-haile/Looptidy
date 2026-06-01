import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLoops } from '../../context/LoopContext';
import { LoopCard } from '../../components/LoopCard';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../lib/theme';
import { isOpenLoop } from '../../lib/utils';

export default function LoopsScreen() {
  const { loops, loading } = useLoops();
  const openLoops = loops.filter(isOpenLoop);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {openLoops.length > 0 ? (
        openLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          title="No open loops"
          message="Create a new loop to start tracking follow-ups and promises."
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
