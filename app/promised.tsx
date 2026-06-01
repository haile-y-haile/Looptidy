import { ActivityIndicator } from 'react-native';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { LoopCard } from '../components/LoopCard';
import { EmptyState } from '../components/EmptyState';
import { ScreenScroll } from '../components/ScreenScroll';
import { ScreenCentered } from '../components/ScreenCentered';
import { isOpenLoop } from '../lib/utils';

export default function PromisedScreen() {
  const { theme } = useTheme();
  const { loops, loading } = useLoops();
  const promisedLoops = loops.filter(
    (l) => isOpenLoop(l) && l.type === 'promised_by_me'
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
      {promisedLoops.length > 0 ? (
        promisedLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          icon="🤝"
          title="No open promises"
          message="Commitments you make to others will show up here until they're done."
        />
      )}
    </ScreenScroll>
  );
}
