import { ActivityIndicator } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { LoopCard } from '../components/LoopCard';
import { EmptyState } from '../components/EmptyState';
import { ScreenScroll } from '../components/ScreenScroll';
import { ScreenCentered } from '../components/ScreenCentered';
import { isOpenLoop } from '../lib/utils';

export default function WaitingScreen() {
  const { theme } = useTheme();
  const { loops, loading } = useLoops();
  const waitingLoops = loops.filter(
    (l) => isOpenLoop(l) && l.type === 'waiting_on_others'
  );

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  return (
    <ScreenScroll>
      {waitingLoops.length > 0 ? (
        waitingLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          icon="⏳"
          title="Nothing waiting"
          message="When you're blocked on someone else, create a waiting-on loop to track it here."
        />
      )}
    </ScreenScroll>
  );
}
