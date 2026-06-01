import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function ScreenCentered({ style, children, ...props }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
