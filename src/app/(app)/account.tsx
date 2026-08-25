import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily, Grid, Typography } from '@/constants/theme';
import { useLogout } from '@/hooks/useLogout';
import { useTheme } from '@/hooks/useTheme';
import { getProfile, listMembers } from '@/services';
import { useAuthStore, useThemeStore, type ThemePreference } from '@/store';

type ShowroomRole = {
  showroom_id: number;
  showroom_name?: string | null;
  role?: string | null;
};
type ProfileData = {
  name?: string | null;
  showroom_roles?: ShowroomRole[] | null;
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const THEME_CYCLE: ThemePreference[] = ['system', 'light', 'dark'];

function themePreferenceLabel(preference: ThemePreference) {
  if (preference === 'light') {
    return 'Light mode';
  }

  if (preference === 'dark') {
    return 'Dark mode';
  }

  return 'Following system';
}

export default function AccountTab() {
  const { colors } = useTheme();
  const fullName = useAuthStore((s) => s.fullName);
  const setPrimaryShowroomId = useAuthStore((s) => s.setPrimaryShowroomId);
  const { isLoggingOut, logout } = useLogout();
  const themePreference = useThemeStore((s) => s.themePreference);
  const setThemePreference = useThemeStore((s) => s.setThemePreference);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);

  const cycleThemePreference = () => {
    const nextIndex = (THEME_CYCLE.indexOf(themePreference) + 1) % THEME_CYCLE.length;
    setThemePreference(THEME_CYCLE[nextIndex]);
  };

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const data = (response as { data?: ProfileData })?.data ?? (response as ProfileData);
        setProfile(data ?? null);

        const primaryShowroom = getPrimaryShowroom(data ?? null);

        if (primaryShowroom) {
          setPrimaryShowroomId(primaryShowroom.showroom_id);

          listMembers({ showroomId: primaryShowroom.showroom_id })
            .then((membersResponse) => {
              if (cancelled) {
                return;
              }

              const total = (membersResponse as { data?: { total?: number } })?.data?.total;
              setEmployeeCount(typeof total === 'number' ? total : null);
            })
            .catch(() => {
              if (!cancelled) {
                setEmployeeCount(null);
              }
            });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = profile?.name || fullName || 'Dealer';
  const primaryShowroom = getPrimaryShowroom(profile);
  const roleLine = primaryShowroom
    ? `${capitalize(primaryShowroom.role ?? 'Member')} · ${primaryShowroom.showroom_name ?? 'Showroom'}`
    : 'Dealer profile and settings';

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarBlock}>
          <View style={[styles.avatar, { backgroundColor: colors['surface-container-high'] }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {getInitials(displayName)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors['on-surface'] }]}>{displayName}</Text>
          <Text style={[styles.roleLine, { color: colors['on-surface'] }]}>{roleLine}</Text>
          <Pressable
            style={[styles.editPill, { backgroundColor: colors['surface-container-high'] }]}>
            <Text style={[styles.editPillText, { color: colors.primary }]}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.rows}>
          <SettingsRow
            icon="person-add-outline"
            title="My Employees"
            subtitle="Manage sales, staff access"
            trailing={
              employeeCount !== null ? (
                <View
                  style={[styles.countBadge, { backgroundColor: colors['surface-container-high'] }]}>
                  <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                    {employeeCount}
                  </Text>
                </View>
              ) : undefined
            }
          />
          <SettingsRow
            icon="storefront-outline"
            title="My Showroom"
            subtitle={primaryShowroom?.showroom_name ?? 'No showroom yet'}
            trailing="chevron"
          />
          <SettingsRow
            icon="ribbon-outline"
            title="Subscription"
            subtitle={'Basic plan\nRenews 15 Aug'}
            trailing="chevron"
          />
          <SettingsRow
            icon="notifications-outline"
            title="Notification"
            subtitle="Manage alerts & reminders"
            trailing="chevron"
          />
          <SettingsRow
            icon={themePreference === 'dark' ? 'moon' : 'moon-outline'}
            title="Dark mode"
            subtitle={themePreferenceLabel(themePreference)}
            trailing="chevron"
            onPress={cycleThemePreference}
          />

          <Pressable
            onPress={logout}
            disabled={isLoggingOut}
            style={({ pressed }) => [
              styles.row,
              styles.logoutRow,
              { borderColor: colors.error, opacity: pressed ? 0.85 : 1 },
            ]}>
            <View style={[styles.rowIcon, { backgroundColor: colors['error-container'] }]}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
            </View>
            <Text style={[styles.logoutText, { color: colors.error }]}>
              {isLoggingOut ? 'Logging out' : 'Log Out'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  trailing?: 'chevron' | React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.primary, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.rowIcon, { backgroundColor: colors['surface-container-high'] }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors['on-surface'] }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors['on-surface'] }]}>{subtitle}</Text>
      </View>
      {trailing === 'chevron' ? (
        <Ionicons name="chevron-forward" size={20} color={colors['on-surface']} />
      ) : (
        trailing
      )}
    </Pressable>
  );
}

function getPrimaryShowroom(profile: ProfileData | null) {
  const roles = profile?.showroom_roles ?? [];
  return roles.find((role) => role.role === 'owner') ?? roles[0] ?? null;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Grid.columns.margin,
    paddingTop: 24,
    paddingBottom: 118,
  },
  avatarBlock: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.medium,
    fontSize: 40,
  },
  name: {
    fontFamily: FontFamily.medium,
    fontSize: 28,
    marginTop: 10,
  },
  roleLine: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
  editPill: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginTop: 6,
  },
  editPillText: {
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 13,
  },
  rows: {
    gap: 20,
    marginTop: 26,
  },
  row: {
    minHeight: 110,
    borderRadius: 20,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  rowIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 6,
  },
  rowTitle: {
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 16,
  },
  rowSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 17,
  },
  countBadge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  countBadgeText: {
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 13,
  },
  logoutRow: {
    minHeight: 90,
  },
  logoutText: {
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 16,
  },
});
