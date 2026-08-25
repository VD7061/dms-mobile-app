import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, Grid } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { getProfile, listVehicles } from '@/services';
import { useAuthStore } from '@/store';
import { categoryToApiGroupKey, mapApiVehicleToItem, type ApiVehicleListing } from './apiMapper';
import { InventoryHeader } from './components/InventoryHeader';
import { VehicleCard } from './components/VehicleCard';
import { VehicleCardCompact } from './components/VehicleCardCompact';
import { VehicleCategoryTabs } from './components/VehicleCategoryTabs';
import { VehicleSearchBar } from './components/VehicleSearchBar';
import type { VehicleCategory, VehicleFilter, VehicleItem } from './types';

type ViewMode = 'card' | 'compact';

const LISTING_LIMIT = 100;
const emptyGroup = { total: 0, page: 1, limit: LISTING_LIMIT, vehicles: [] };

type ShowroomRole = { showroom_id: number; role?: string | null };
type ProfileData = { showroom_roles?: ShowroomRole[] | null };

function getPrimaryShowroomId(profile: ProfileData | null) {
  const roles = profile?.showroom_roles ?? [];
  const owned = roles.find((role) => role.role === 'owner');
  return (owned ?? roles[0])?.showroom_id;
}

export function VehiclesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  // Read imperatively rather than subscribing: the focus effect below *sets*
  // this value, and subscribing made the effect's identity change mid-load,
  // which re-ran the whole fetch a second time on every first visit.
  const primaryShowroomIdRef = useRef(useAuthStore.getState().primaryShowroomId);
  const [selectedFilter, setSelectedFilter] = useState<VehicleFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [listing, setListing] = useState<ApiVehicleListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const horizontalPadding = screenWidth < 360 ? 16 : Grid.columns.margin;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      setIsLoading(true);
      setErrorMessage('');

      const knownShowroomId = primaryShowroomIdRef.current;
      const resolveShowroomId = knownShowroomId
        ? Promise.resolve(knownShowroomId)
        : getProfile().then((profileResponse) => {
            const profileData =
              (profileResponse as unknown as { data?: ProfileData })?.data ??
              (profileResponse as unknown as ProfileData);
            const resolvedId = getPrimaryShowroomId(profileData);

            if (resolvedId) {
              primaryShowroomIdRef.current = resolvedId;
              useAuthStore.getState().setPrimaryShowroomId(resolvedId);
            }

            return resolvedId;
          });

      resolveShowroomId
        .then((showroomId) => {
          if (!showroomId) {
            throw new Error('No showroom found for this account yet.');
          }

          return listVehicles({ showroomId, limit: LISTING_LIMIT });
        })
        .then((response) => {
          if (cancelled) {
            return;
          }

          const responseData = response as unknown as { data?: ApiVehicleListing };
          const data = responseData?.data ?? (responseData as unknown as ApiVehicleListing);
          setListing(data ?? null);
        })
        .catch((error) => {
          if (!cancelled) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to load vehicles.');
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const groups = listing ?? { cars: emptyGroup, bikes: emptyGroup, scooties: emptyGroup };
  const totalVehicleCount = groups.cars.total + groups.bikes.total + groups.scooties.total;

  const categoryTabs = useMemo(
    () => [
      { value: 'All' as const, label: 'All', count: totalVehicleCount, icon: 'dna' as const },
      { value: 'Cars' as const, label: 'Cars', count: groups.cars.total, icon: 'car-sports' as const },
      { value: 'Bikes' as const, label: 'Bikes', count: groups.bikes.total, icon: 'motorbike' as const },
      { value: 'Scooty' as const, label: 'Scooty', count: groups.scooties.total, icon: 'scooter' as const },
    ] as const,
    [groups, totalVehicleCount]
  );

  const selectedFilterVehicles = useMemo<VehicleItem[]>(() => {
    if (selectedFilter === 'All') {
      return [
        ...groups.cars.vehicles.map(mapApiVehicleToItem),
        ...groups.bikes.vehicles.map(mapApiVehicleToItem),
        ...groups.scooties.vehicles.map(mapApiVehicleToItem),
      ];
    }
    return groups[categoryToApiGroupKey(selectedFilter as VehicleCategory)].vehicles.map(mapApiVehicleToItem);
  }, [groups, selectedFilter]);

  const filteredVehicles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query.length === 0) {
      return selectedFilterVehicles;
    }

    return selectedFilterVehicles.filter((vehicle) =>
      [vehicle.name, vehicle.registration, vehicle.meta, vehicle.status]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery, selectedFilterVehicles]);

  const openVehicle = useCallback(
    (id: string) => router.push({ pathname: '/vehicle/[id]', params: { id } }),
    [router]
  );

  const renderVehicle = useCallback(
    ({ item }: { item: VehicleItem }) =>
      viewMode === 'compact' ? (
        <VehicleCardCompact vehicle={item} onPress={openVehicle} />
      ) : (
        <VehicleCard vehicle={item} onPress={openVehicle} />
      ),
    [openVehicle, viewMode]
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <InventoryHeader
          totalCount={totalVehicleCount}
          onAddPress={() => router.push('/vehicle/add')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <VehicleSearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <VehicleCategoryTabs
          tabs={categoryTabs}
          selectedCategory={selectedFilter === 'All' ? undefined : (selectedFilter as VehicleCategory)}
          onSelect={setSelectedFilter}
        />
      </View>

      {errorMessage ? (
        <Text style={[styles.errorText, { color: colors.error, paddingHorizontal: horizontalPadding }]}>
          {errorMessage}
        </Text>
      ) : null}

      {isLoading && !listing ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.scroll}
          data={filteredVehicles}
          keyExtractor={keyExtractor}
          renderItem={renderVehicle}
          ListHeaderComponent={null}
          contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
          ItemSeparatorComponent={() => (
            <View style={{ height: viewMode === 'compact' ? 8 : 12 }} />
          )}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
        />
      )}

    </SafeAreaView>
  );
}

function keyExtractor(vehicle: VehicleItem) {
  return vehicle.id;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: 29,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.caption,
    marginTop: 8,
  },
});
