import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { useCan } from '@/hooks/useCan';
import { useTheme } from '@/hooks/useTheme';
import type { PermissionKey } from '@/permissions/permissions';

type PermissionGateProps = {
  children: ReactNode;
  permission: PermissionKey;
};

export function PermissionGate({ children, permission }: PermissionGateProps) {
  const { colors } = useTheme();
  const canAccess = useCan(permission);

  if (canAccess) {
    return children;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.title, styles.title, { color: colors['on-background'] }]}>
        No access
      </Text>
      <Text style={[Typography.body, styles.subtitle, { color: colors['on-surface-variant'] }]}>
        Your current showroom role cannot open this section.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
    textAlign: 'center',
  },
});
