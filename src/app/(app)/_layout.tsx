import { Tabs } from 'expo-router';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useSession } from '@/hooks/useSession';
import { useAuthStore } from '@/store';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

export default function AppLayout() {
  const { colors, isDark } = useTheme();
  const { isLoading, hasTokens } = useSession();
  const canEnterApp = useAuthStore((s) => s.canEnterApp);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 18);
  const tabBarBackground = isDark ? colors['secondary-container'] : colors.primary;
  const activeTabColor = isDark ? colors['on-surface'] : colors['on-primary'];
  const inactiveTabColor = isDark ? colors['secondary-fixed-dim'] : colors['surface-container-high'];
  const renderTabIcon =
    (name: TabIconName) =>
    ({ focused }: { focused: boolean }) => (
      <View style={styles.tabIcon}>
        <Ionicons
          name={name}
          color={focused ? activeTabColor : inactiveTabColor}
          size={24}
        />
        <View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: activeTabColor,
              opacity: focused ? 1 : 0,
            },
          ]}
        />
      </View>
    );

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasTokens) {
    return <Redirect href="/(auth)" />;
  }

  if (!canEnterApp) {
    return <Redirect href="/(setup)/loading" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: activeTabColor,
        tabBarInactiveTintColor: inactiveTabColor,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopWidth: 0,
          elevation: 0,
          height: 63 + bottomPadding,
          paddingTop: 18,
          paddingBottom: bottomPadding,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: renderTabIcon('grid'),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: renderTabIcon('car'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: renderTabIcon('receipt'),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          tabBarIcon: renderTabIcon('pricetag'),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: renderTabIcon('person'),
        }}
      />
      <Tabs.Screen
        name="vehicle/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    alignItems: 'center',
    gap: 7,
    justifyContent: 'center',
    minHeight: 38,
  },
  activeIndicator: {
    width: 18,
    height: 3,
    borderRadius: 3,
  },
});
