import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui';
import { FontFamily, Grid, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { vehicleInventory } from './data';
import type { VehicleDocument, VehicleExpense, VehicleItem, VehicleStatus } from './types';

type VehicleDetailsScreenProps = {
  vehicleId: string;
};

const PHOTO_CHIP_COUNT = 4;

export function VehicleDetailsScreen({ vehicleId }: VehicleDetailsScreenProps) {
  const { colors, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const horizontalPadding = screenWidth < 360 ? 16 : Grid.columns.margin;
  const vehicle = vehicleInventory.find((item) => item.id === vehicleId);

  if (!vehicle) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}>
        <View style={[styles.missingContent, { paddingHorizontal: horizontalPadding }]}>
          <BackButton />
          <Text style={[styles.title, { color: colors['on-surface'] }]}>Vehicle not found</Text>
          <Text style={[styles.bodyText, { color: colors['on-surface-variant'] }]}>
            This vehicle may have been removed from inventory.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColors(vehicle.status, colors, isDark);
  const heroBackground = colors['surface-container-high'];
  const chipBackground = colors['surface-container-high'];
  const outlineCardBackground = colors['surface-container-lowest'];
  const borderColor = colors.primary;
  const dividerColor = colors.primary;
  const specs = getVehicleSpecs(vehicle);
  const profit = getProfitNote(vehicle.buyingPrice, vehicle.askingPrice);
  const totalPhotos = vehicle.photoCount ?? PHOTO_CHIP_COUNT;
  const visibleChipCount = Math.min(totalPhotos, PHOTO_CHIP_COUNT);
  const extraPhotos = Math.max(totalPhotos - PHOTO_CHIP_COUNT, 0);
  const actionItems = [
    { label: 'Edit', icon: 'square-edit-outline' as const },
    { label: 'Change State', icon: 'swap-horizontal' as const },
    { label: 'Sell', icon: 'tag-outline' as const },
    { label: 'Add Expense', icon: 'plus' as const },
  ];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <BackButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: heroBackground }]}>
          <MaterialCommunityIcons name={vehicle.icon} size={96} color={colors['on-surface-variant']} />
          <View style={[styles.favoriteButton, { backgroundColor: outlineCardBackground }]}>
            <MaterialCommunityIcons name="heart-outline" size={16} color={colors.primary} />
          </View>
        </View>

        <View style={styles.photoChips}>
          {Array.from({ length: visibleChipCount }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.photoChip,
                {
                  backgroundColor: chipBackground,
                  borderColor: index === 0 ? borderColor : 'transparent',
                  borderWidth: index === 0 ? 1 : 0,
                },
              ]}>
              <MaterialCommunityIcons name={vehicle.icon} size={20} color={colors.primary} />
            </View>
          ))}
          {extraPhotos > 0 ? (
            <View style={[styles.photoChip, styles.photoChipCount, { backgroundColor: chipBackground }]}>
              <Text style={[styles.photoChipCountText, { color: colors.primary }]}>+{extraPhotos}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors['on-surface'] }]}>{vehicle.name}</Text>
            <Text style={[styles.registrationText, { color: colors['on-surface'] }]}>
              {vehicle.registration}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColors.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusColors.textColor }]}>
              {vehicle.status}
            </Text>
          </View>
        </View>

        <View style={styles.priceGrid}>
          <PriceCard label="Buying price" value={vehicle.buyingPrice} />
          <PriceCard label="Asking price" value={vehicle.askingPrice} note={profit} />
        </View>

        <View style={styles.actionsGrid}>
          {actionItems.map((item) => (
            <View
              key={item.label}
              style={[
                styles.actionTile,
                { backgroundColor: outlineCardBackground, borderColor },
              ]}>
              <MaterialCommunityIcons name={item.icon} size={20} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors['on-surface'] }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.specPanel, { backgroundColor: outlineCardBackground, borderColor }]}>
          {specs.map((spec, index) => (
            <View
              key={spec.label}
              style={[
                styles.specCell,
                {
                  borderBottomColor: dividerColor,
                  borderRightColor: dividerColor,
                  borderBottomWidth: index < 2 ? StyleSheet.hairlineWidth : 0,
                  borderRightWidth: index % 2 === 0 ? StyleSheet.hairlineWidth : 0,
                },
              ]}>
              <Text style={[styles.specLabel, { color: colors['on-surface'] }]}>
                {spec.label}
              </Text>
              <Text style={[styles.specValue, { color: colors['on-surface'] }]}>
                {spec.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.locationCard, { backgroundColor: chipBackground, borderColor }]}>
          <View>
            <Text style={[styles.specLabel, { color: colors['on-surface'] }]}>
              Current location
            </Text>
            <View style={styles.locationValue}>
              <MaterialCommunityIcons name="map-marker" size={15} color={colors['on-surface']} />
              <Text style={[styles.locationText, { color: colors['on-surface'] }]}>
                {vehicle.lotLocation}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors['on-surface']} />
        </View>

        <Text style={[styles.sectionKicker, { color: colors['on-surface-variant'] }]}>MORE INFO</Text>
        <View style={[styles.infoCard, { backgroundColor: outlineCardBackground, borderColor }]}>
          <DetailRow label="Engine number" value={vehicle.engineNumber} showDivider dividerColor={dividerColor} />
          <DetailRow label="Chassis number" value={vehicle.chassisNumber} showDivider dividerColor={dividerColor} />
          <DetailRow label="Transmission" value={vehicle.transmission} showDivider dividerColor={dividerColor} />
          <DetailRow label="Color" value={vehicle.color} showDivider dividerColor={dividerColor} />
          <DetailRow label="Insurance valid till" value={vehicle.insuranceValidTill} />
        </View>

        <ExpenseSection expenses={vehicle.expenses} />

        <Text style={[styles.sectionKicker, { color: colors['on-surface-variant'] }]}>DOCUMENTS</Text>
        <View style={styles.documentList}>
          {vehicle.documents.map((document) => (
            <DocumentRow key={document.label} document={document} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PriceCard({ label, value, note }: { label: string; value: string; note?: string | null }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.priceCard,
        { backgroundColor: colors['surface-container'], borderColor: colors.primary },
      ]}>
      <Text style={[styles.priceLabel, { color: colors['on-surface'] }]}>{label}</Text>
      <Text style={[styles.priceValue, { color: colors['on-surface'] }]}>{value}</Text>
      {note ? <Text style={[styles.priceNote, { color: colors.tertiary }]}>{note}</Text> : null}
    </View>
  );
}

function DetailRow({
  label,
  value,
  showDivider,
  dividerColor,
  valueColor,
}: {
  label: string;
  value: string;
  showDivider?: boolean;
  dividerColor?: string;
  valueColor?: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.detailRow,
        showDivider && {
          borderBottomColor: dividerColor ?? colors['outline-variant'],
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}>
      <Text style={[styles.detailLabel, { color: colors['on-surface-variant'] }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor ?? colors['on-surface'] }]}>{value}</Text>
    </View>
  );
}

function ExpenseSection({ expenses }: { expenses: VehicleExpense[] }) {
  const { colors } = useTheme();
  const total = expenses.reduce((sum, expense) => sum + parseRupeeAmount(expense.amount), 0);

  return (
    <View
      style={[
        styles.expenseCard,
        { backgroundColor: colors['surface-container-lowest'], borderColor: colors.primary },
      ]}>
      <View style={styles.expenseHeader}>
        <Text style={[styles.sectionTitle, { color: colors['on-surface'] }]}>Vehicle Expenses</Text>
        <View style={[styles.addSmallButton, { backgroundColor: colors['surface-container-high'] }]}>
          <MaterialCommunityIcons name="plus" size={12} color={colors.primary} />
          <Text style={[styles.addSmallText, { color: colors.primary }]}>Add</Text>
        </View>
      </View>
      {expenses.map((expense) => (
        <DetailRow
          key={expense.label}
          label={expense.label}
          value={expense.amount}
          showDivider
          dividerColor={colors.primary}
        />
      ))}
      <DetailRow label="Total expenses" value={formatRupeeAmount(total)} valueColor={colors.error} />
    </View>
  );
}

function DocumentRow({ document }: { document: VehicleDocument }) {
  const { colors } = useTheme();
  const complete = document.status === 'complete';

  return (
    <View
      style={[
        styles.documentRow,
        { backgroundColor: colors['surface-container-lowest'], borderColor: colors.primary },
      ]}>
      <View style={styles.documentTitle}>
        <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.primary} />
        <Text style={[styles.documentLabel, { color: colors['on-surface'] }]}>
          {document.label}
        </Text>
      </View>
      <MaterialCommunityIcons
        name={complete ? 'check' : 'alert-outline'}
        size={19}
        color={complete ? colors.tertiary : colors.error}
      />
    </View>
  );
}

function getVehicleSpecs(vehicle: VehicleItem) {
  const [year = '-', kilometers = '-', fuel = '-'] = vehicle.meta.split(' · ');

  return [
    { label: 'Year', value: year },
    { label: 'Odometer', value: kilometers.replace('K', ',000') },
    { label: 'Fuel', value: fuel },
    { label: 'Owner', value: vehicle.owner },
  ];
}

function parseRupeeAmount(amount: string) {
  return Number(amount.replace(/[₹,]/g, ''));
}

function formatRupeeAmount(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function parseLakhAmount(value: string) {
  const match = value.replace(/[₹,\s]/g, '').match(/^([\d.]+)\s*([lLcC]?)/);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);

  if (!Number.isFinite(amount)) {
    return null;
  }

  const unit = match[2]?.toLowerCase();

  if (unit === 'l') {
    return amount * 100000;
  }

  if (unit === 'c') {
    return amount * 10000000;
  }

  return amount;
}

function getProfitNote(buyingPrice: string, askingPrice: string) {
  const buying = parseLakhAmount(buyingPrice);
  const asking = parseLakhAmount(askingPrice);

  if (buying === null || asking === null) {
    return null;
  }

  const diff = asking - buying;

  if (diff === 0) {
    return null;
  }

  const formatted = `₹${Math.abs(diff).toLocaleString('en-IN')}`;
  return diff > 0 ? `${formatted} profit` : `${formatted} loss`;
}

function getStatusColors(
  status: VehicleStatus,
  colors: ReturnType<typeof useTheme>['colors'],
  isDark: boolean
) {
  const variants = {
    Available: {
      backgroundColor: colors['surface-container-high'],
      textColor: colors.primary,
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
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 31,
    paddingTop: 17,
  },
  heroCard: {
    height: 179,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    right: 13,
    top: 13,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoChips: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  photoChip: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoChipCount: {
    flexBasis: 0,
  },
  photoChipCountText: {
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 17,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 24,
    lineHeight: 29,
  },
  registrationText: {
    fontFamily: FontFamily.regular,
    fontSize: 17,
    lineHeight: 21,
    marginTop: 2,
  },
  bodyText: {
    ...Typography.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    lineHeight: 12,
  },
  priceGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 17,
  },
  priceCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 10,
    borderWidth: 0.5,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  priceLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 16,
  },
  priceValue: {
    fontFamily: FontFamily.medium,
    fontSize: 24,
    lineHeight: 29,
    marginTop: 4,
  },
  priceNote: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },
  actionTile: {
    flex: 1,
    height: 65,
    borderRadius: 15,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    lineHeight: 11,
    marginTop: 7,
    textAlign: 'center',
  },
  specPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 15,
    borderWidth: 0.5,
    marginTop: 13,
    overflow: 'hidden',
  },
  specCell: {
    width: '50%',
    minHeight: 82,
    paddingHorizontal: 17,
    paddingVertical: 16,
  },
  specLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 13,
  },
  specValue: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 18,
    marginTop: 8,
  },
  locationCard: {
    borderRadius: 15,
    borderWidth: 0.5,
    minHeight: 63,
    marginTop: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 7,
  },
  locationText: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 18,
  },
  sectionKicker: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 9,
    marginTop: 17,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    minHeight: 51,
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 17,
  },
  detailValue: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 18,
    flexShrink: 1,
    textAlign: 'right',
  },
  expenseCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    marginTop: 18,
    overflow: 'hidden',
  },
  expenseHeader: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  addSmallButton: {
    height: 25,
    minWidth: 62,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
  },
  addSmallText: {
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 12,
  },
  documentList: {
    gap: 10,
  },
  documentRow: {
    height: 59,
    borderRadius: 15,
    borderWidth: 0.5,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  documentLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 18,
  },
  missingContent: {
    flex: 1,
    paddingTop: 18,
  },
});
