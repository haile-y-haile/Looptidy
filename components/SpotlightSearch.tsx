import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLoops } from '../context/LoopContext';
import { filterLoopsByQuery } from '../lib/loopSearch';
import { AppIcon } from './AppIcon';
import { LoopCard } from './LoopCard';
import { hapticLight } from '../lib/haptics';
import { radius, spacing, typography } from '../lib/theme';

export function SpotlightSearch({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loops } = useLoops();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [visible]);

  const results = filterLoopsByQuery(loops, query).slice(0, 5);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.backdrop} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              marginTop: insets.top + spacing.xxl,
            },
          ]}
        >
          <View style={[styles.searchBar, { borderBottomColor: theme.colors.borderLight }]}>
            <AppIcon name="search" size={20} color={theme.colors.textMuted} />
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Spotlight search..."
              placeholderTextColor={theme.colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="always"
            />
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeText, { color: theme.colors.primary }]}>Cancel</Text>
            </Pressable>
          </View>

          {query.trim().length > 0 && (
            <View style={styles.results}>
              {results.length > 0 ? (
                results.map((loop) => (
                  <Pressable key={loop.id} onPress={() => {
                    void hapticLight();
                    onClose();
                    router.push(`/loops/${loop.id}`);
                  }}>
                    <View pointerEvents="none">
                      <LoopCard loop={loop} />
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.noResults, { color: theme.colors.textMuted }]}>
                  No results found for "{query}"
                </Text>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
  },
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 56,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: spacing.sm,
    ...typography.body,
  },
  closeBtn: {
    paddingLeft: spacing.sm,
  },
  closeText: {
    ...typography.callout,
    fontWeight: '600',
  },
  results: {
    padding: spacing.md,
    gap: spacing.sm,
    maxHeight: 400,
  },
  noResults: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
