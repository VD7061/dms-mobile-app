import { memo, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { VehicleItem, VehicleStatus } from '../types';

type VehicleCardProps = {
  vehicle: VehicleItem;
  onPress?: (id: string) => void;
};

// Memoized: the inventory list re-renders on every keystroke in the search bar
// and on every filter change, and each card is a fairly deep subtree.
function VehicleCardComponent({ vehicle, onPress }: VehicleCardProps) {
  const { colors } = useTheme();
  const statusColors = getStatusColors(vehicle.status, colors);
  const handlePress = useCallback(() => onPress?.(vehicle.id), [onPress, vehicle.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.thumbnail, { backgroundColor: colors['surface-container-high'] }]}>
        {vehicle.imageUrl ? (
          <Image
            source={{ uri: vehicle.imageUrl }}
            style={styles.thumbnailImage}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            // Keyed by vehicle rather than URL: the API hands back a freshly
            // signed URL on every listing fetch, and without this the view
            // would blank out and re-fade each time the list reloads.
            recyclingKey={vehicle.id}
            placeholderContentFit="contain"
          />
        ) : (
          <MaterialCommunityIcons name={vehicle.icon} size={34} color={colors.primary} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors['on-surface'] }]} numberOfLines={1}>
          {vehicle.name}
        </Text>
        <Text style={[styles.registration, { color: colors['on-surface'] }]}>
          {vehicle.registration}
        </Text>
        <Text style={[styles.meta, { color: colors['on-surface-variant'] }]} numberOfLines={1}>
          {vehicle.meta}
        </Text>
      </View>

      <View style={styles.side}>
        <Text style={[styles.price, { color: colors['on-surface'] }]}>{vehicle.price}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColors.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusColors.textColor }]}>
            {vehicle.status}
          </Text>
        </View>
        <Text style={[styles.note, { color: colors['on-surface-variant'] }]}>{vehicle.note}</Text>
      </View>
    </Pressable>
  );
}

export const VehicleCard = memo(VehicleCardComponent);

function getStatusColors(status: VehicleStatus, colors: ReturnType<typeof useTheme>['colors']) {
  const variants = {
    Available: {
      backgroundColor: colors['tertiary-fixed'],
      textColor: colors['on-tertiary-fixed'],
    },
    Sold: {
      backgroundColor: colors['error-container'],
      textColor: colors['on-error-container'],
    },
    'In Garage': {
      backgroundColor: colors['surface-container-high'],
      textColor: colors['on-surface-variant'],
    },
    Inspection: {
      backgroundColor: colors['secondary-container'],
      textColor: colors['on-secondary-container'],
    },
  };

  return variants[status];
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 105,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  thumbnail: {
    width: 70,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...Typography.screenTitle,
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 3,
  },
  registration: {
    ...Typography.body,
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 11,
    lineHeight: 14,
  },
  meta: {
    ...Typography.caption,
    lineHeight: 14,
  },
  side: {
    alignItems: 'flex-end',
    marginLeft: 10,
    minWidth: 72,
  },
  price: {
    ...Typography.screenTitle,
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 7,
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  statusText: {
    ...Typography.caption,
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 10,
    lineHeight: 12,
  },
  note: {
    ...Typography.caption,
    fontSize: 10,
    lineHeight: 14,
  },
});
