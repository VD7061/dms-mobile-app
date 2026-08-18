import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, Grid } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { listVehicles } from '@/services';
import { categoryToApiGroupKey, mapApiVehicleToItem, type ApiVehicleListing } from './apiMapper';
import { AddVehicleButton } from './components/AddVehicleButton';
import { InventoryHeader } from './components/InventoryHeader';
import { VehicleCard } from './components/VehicleCard';
import { VehicleCategoryTabs } from './components/VehicleCategoryTabs';
import { VehicleListHeader } from './components/VehicleListHeader';
import { VehicleSearchBar } from './components/VehicleSearchBar';
import { VehicleStatsRow } from './components/VehicleStatsRow';
import { VehicleStatusChips } from './components/VehicleStatusChips';
import { vehicleCategoryTabs, vehicleStatusFilters } from './data';
import type { VehicleCategory, VehicleItem, VehicleStat, VehicleStatus, VehicleStatusFilter } from './types';

const LISTING_LIMIT = 100;
const ALL_STATUSES = ['garage', 'inspection', 'ready_for_sale', 'sold'];
const emptyGroup = { total: 0, page: 1, limit: LISTING_LIMIT, vehicles: [] };

export function VehiclesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('Cars');
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [listing, setListing] = useState<ApiVehicleListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const horizontalPadding = screenWidth < 360 ? 16 : Grid.columns.margin;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      setIsLoading(true);
      setErrorMessage('');

      listVehicles()
        .then((response) => {
          if (cancelled) {
            return;
          }

          console.log('Vehicle listing response', response);

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

  const categoryTabs = useMemo(() => {
    return vehicleCategoryTabs.map((tab) => ({
      ...tab,
      count: groups[categoryToApiGroupKey(tab.value)].total,
    }));
  }, [groups]);

  const selectedCategoryVehicles = useMemo<VehicleItem[]>(() => {
    return groups[categoryToApiGroupKey(selectedCategory)].vehicles.map(mapApiVehicleToItem);
  }, [groups, selectedCategory]);

  const statusCounts = useMemo(() => {
    return selectedCategoryVehicles.reduce<Record<VehicleStatus, number>>(
      (counts, vehicle) => {
        counts[vehicle.status] += 1;
        return counts;
      },
      { Available: 0, Sold: 0, 'In Repair': 0 }
    );
  }, [selectedCategoryVehicles]);

  const stats = useMemo<VehicleStat[]>(() => {
    return [
      { value: String(selectedCategoryVehicles.length), label: 'Total', tone: 'default' },
      { value: String(statusCounts.Available), label: 'Available', tone: 'success' },
      { value: String(statusCounts['In Repair']), label: 'Dead stock', tone: 'danger' },
      {
        value: formatStockValue(selectedCategoryVehicles),
        label: 'Stock value',
        tone: 'primary',
      },
    ];
  }, [selectedCategoryVehicles, statusCounts]);

  const filteredVehicles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return selectedCategoryVehicles.filter((vehicle) => {
      const matchesStatus = selectedStatus === 'All' || vehicle.status === selectedStatus;
      const searchableText = [
        vehicle.name,
        vehicle.registration,
        vehicle.meta,
        vehicle.price,
        vehicle.status,
        vehicle.note,
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = query.length === 0 || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [searchQuery, selectedCategoryVehicles, selectedStatus]);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <InventoryHeader totalCount={totalVehicleCount} />
        <VehicleSearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <VehicleCategoryTabs
          tabs={categoryTabs}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <VehicleStatusChips
          filters={vehicleStatusFilters}
          selectedFilter={selectedStatus}
          counts={statusCounts}
          onSelect={setSelectedStatus}
        />
        <VehicleStatsRow stats={stats} />
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}>
          <VehicleListHeader selectedCategory={selectedCategory} count={filteredVehicles.length} />

          <View style={styles.list}>
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPress={() => router.push({ pathname: '/vehicle/[id]', params: { id: vehicle.id } })}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <View
        style={[
          styles.fixedFooter,
          {
            backgroundColor: colors.background,
            paddingHorizontal: horizontalPadding,
          },
        ]}>
        <AddVehicleButton onPress={() => router.push('/vehicle/add')} />
      </View>
    </SafeAreaView>
  );
}

function formatStockValue(vehicles: VehicleItem[]) {
  const totalRupees = vehicles.reduce((sum, vehicle) => sum + parsePrice(vehicle.price), 0);

  if (totalRupees >= 100000) {
    return `₹${(totalRupees / 100000).toFixed(1).replace('.0', '')}L`;
  }

  return `₹${Math.round(totalRupees / 1000)}K`;
}

function parsePrice(price: string) {
  const amount = Number(price.replace(/[₹LK]/g, ''));

  if (price.includes('L')) {
    return amount * 100000;
  }

  if (price.includes('K')) {
    return amount * 1000;
  }

  return amount;
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
    paddingBottom: 24,
  },
  list: {
    gap: 14,
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
  fixedFooter: {
    paddingBottom: 18,
    paddingTop: 12,
  },
});
