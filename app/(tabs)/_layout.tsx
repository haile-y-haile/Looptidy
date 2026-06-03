import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { TabBarBackground } from '../../components/TabBarBackground';
import { GlobalFAB } from '../../components/GlobalFAB';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: IoniconName;
  color: string;
  focused: boolean;
}) {
  const filled = name.replace('-outline', '') as IoniconName;
  return <Ionicons name={focused ? filled : name} size={24} color={color} />;
}

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarBackground: () => <TabBarBackground />,
          tabBarStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingTop: 6,
            height: Platform.OS === 'ios' ? 88 : 64,
            position: Platform.OS === 'ios' ? 'absolute' : undefined,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 2 : 4,
          },
          sceneStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="home-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="loops"
          options={{
            title: 'Loops',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="albums-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="decisions"
          options={{
            title: 'Decisions',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="git-branch-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="settings-outline" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      <GlobalFAB />
    </>
  );
}
