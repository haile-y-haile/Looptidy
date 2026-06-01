import { ScrollView, ScrollViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface ScreenScrollProps extends ScrollViewProps {
  contentContainerStyle?: ViewStyle;
}

export function ScreenScroll({
  style,
  contentContainerStyle,
  children,
  ...props
}: ScreenScrollProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[{ backgroundColor: theme.colors.background, flex: 1 }, style]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: theme.spacing.xxxl + insets.bottom },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
});
