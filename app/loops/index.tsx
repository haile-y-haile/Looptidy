import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import { LoopCard } from '../../components/LoopCard';
import { EmptyState } from '../../components/EmptyState';
import { ScreenScroll } from '../../components/ScreenScroll';
import { ScreenCentered } from '../../components/ScreenCentered';
import { SectionHeader } from '../../components/SectionHeader';
import { isOpenLoop } from '../../lib/utils';

export default function LoopsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { loops, loading } = useLoops();
  const openLoops = loops.filter(isOpenLoop);

  if (loading) {
    return (
      <ScreenCentered>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenCentered>
    );
  }

  return (
    <ScreenScroll>
      <SectionHeader
        title={`${openLoops.length} open`}
        action="+ New"
        onAction={() => router.push('/loops/new')}
      />
      {openLoops.length > 0 ? (
        openLoops.map((loop) => <LoopCard key={loop.id} loop={loop} />)
      ) : (
        <EmptyState
          title="No open loops"
          message="Create a new loop to start tracking follow-ups and promises."
        />
      )}
    </ScreenScroll>
  );
}
