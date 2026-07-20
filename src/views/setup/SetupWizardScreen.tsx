import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextField } from '@/components/ui';
import { Grid, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { createShowroom } from '@/services';
import { useSessionStore } from '@/store';

type SetupStep = 'welcome' | 'showroom' | 'vehicle' | 'done';
type VehicleType = 'Cars' | 'Bikes' | 'Scooty';

const setupSteps: SetupStep[] = ['welcome', 'showroom', 'vehicle', 'done'];
const vehicleTypes: VehicleType[] = ['Cars', 'Bikes', 'Scooty'];

export function SetupWizardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const upsertShowroomRole = useSessionStore((s) => s.upsertShowroomRole);
  const activeShowroom = useSessionStore((s) =>
    s.showroomRoles.find((item) => item.showroom_id === s.activeShowroomId)
  );
  const [step, setStep] = useState<SetupStep>(activeShowroom ? 'vehicle' : 'welcome');
  const [showroomName, setShowroomName] = useState(activeShowroom?.showroom_name ?? '');
  const [locationLabel, setLocationLabel] = useState('Guwahati, Assam');
  const [contactNumber, setContactNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Cars');
  const [numberPlate, setNumberPlate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const stepIndex = setupSteps.indexOf(step);
  const showroomDone = Boolean(activeShowroom);

  const handleCreateShowroom = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await createShowroom({
        name: showroomName.trim(),
        geolocation: {
          address: locationLabel,
          city: 'Guwahati',
          state: 'Assam',
        },
      });

      upsertShowroomRole({
        showroom_id: response.data.id,
        showroom_name: response.data.name,
        role: 'owner',
      });
      setStep('vehicle');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create showroom');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 'welcome') {
      setStep(showroomDone ? 'vehicle' : 'showroom');
      return;
    }

    if (step === 'showroom') {
      handleCreateShowroom();
      return;
    }

    if (step === 'vehicle') {
      setStep('done');
      return;
    }

    router.replace('/(app)');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.progress}>
        {setupSteps.map((item, index) => (
          <View key={item} style={styles.progressItem}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor:
                    index <= stepIndex ? colors.primary : colors['surface-container-high'],
                },
              ]}
            />
            <Text
              style={[
                Typography.caption,
                { color: index <= stepIndex ? colors.primary : colors['on-surface-variant'] },
              ]}>
              {item === 'welcome' ? 'Welcome' : item === 'showroom' ? 'Showroom' : item === 'vehicle' ? 'Vehicle' : 'Done'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'welcome' ? (
          <WelcomeStep
            showroomDone={showroomDone}
            onShowroomPress={() => setStep('showroom')}
            onVehiclePress={() => (showroomDone ? setStep('vehicle') : setError('You need to add your showroom first.'))}
          />
        ) : null}

        {step === 'showroom' ? (
          <ShowroomStep
            contactNumber={contactNumber}
            locationLabel={locationLabel}
            showroomName={showroomName}
            onChangeContactNumber={setContactNumber}
            onChangeShowroomName={setShowroomName}
            onPickLocation={() => setLocationLabel('Guwahati, Assam')}
          />
        ) : null}

        {step === 'vehicle' ? (
          <VehicleStep
            numberPlate={numberPlate}
            purchasePrice={purchasePrice}
            selectedType={vehicleType}
            onChangeNumberPlate={setNumberPlate}
            onChangePurchasePrice={setPurchasePrice}
            onSelectType={setVehicleType}
          />
        ) : null}

        {step === 'done' ? <DoneStep showroomName={activeShowroom?.showroom_name ?? showroomName} /> : null}

        {error ? (
          <Text style={[Typography.body, styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={loading ? 'Saving...' : step === 'done' ? 'Go to Dashboard' : 'Continue'}
          onPress={handleNext}
          disabled={loading || (step === 'showroom' && showroomName.trim().length === 0)}
        />
      </View>
    </SafeAreaView>
  );
}

function WelcomeStep({
  showroomDone,
  onShowroomPress,
  onVehiclePress,
}: {
  showroomDone: boolean;
  onShowroomPress: () => void;
  onVehiclePress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.step}>
      <View style={[styles.banner, { backgroundColor: colors['surface-container'] }]}>
        <Ionicons name="image-outline" size={34} color={colors.primary} />
        <Text style={[Typography.body, { color: colors.primary }]}>Add a banner image</Text>
      </View>
      <Text style={[Typography.hero, { color: colors['on-background'] }]}>Welcome!</Text>
      <Text style={[Typography.body, styles.description, { color: colors['on-background'] }]}>
        Let’s set up your dealership in 3 quick steps so you can start managing your inventory.
      </Text>
      <SetupCard
        done={showroomDone}
        icon="storefront-outline"
        title="Add your showroom"
        subtitle="Name, location & contact"
        onPress={onShowroomPress}
      />
      <SetupCard
        disabled={!showroomDone}
        icon="car-outline"
        title="Add your first vehicle"
        subtitle="Register via number plate"
        onPress={onVehiclePress}
      />
      {!showroomDone ? (
        <Text style={[Typography.body, styles.warning, { color: colors.error }]}>
          You’ll need to add your showroom first before you can register vehicles to it.
        </Text>
      ) : null}
    </View>
  );
}

function ShowroomStep({
  contactNumber,
  locationLabel,
  showroomName,
  onChangeContactNumber,
  onChangeShowroomName,
  onPickLocation,
}: {
  contactNumber: string;
  locationLabel: string;
  showroomName: string;
  onChangeContactNumber: (value: string) => void;
  onChangeShowroomName: (value: string) => void;
  onPickLocation: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.step}>
      <Text style={[styles.badge, { backgroundColor: colors['surface-container'], color: colors.primary }]}>
        Step 2 of 3
      </Text>
      <Text style={[Typography.hero, { color: colors['on-background'] }]}>Add your showroom</Text>
      <Text style={[Typography.body, styles.description, { color: colors['on-background'] }]}>
        Tell us about your dealership location
      </Text>
      <TextField
        label="Showroom name"
        labelIcon={<Ionicons name="storefront-outline" size={16} color={colors.primary} />}
        value={showroomName}
        onChangeText={onChangeShowroomName}
        placeholder="AutoDeals Guwahati"
      />
      <Text style={[Typography.body, { color: colors['on-background'] }]}>Location</Text>
      <Pressable
        onPress={onPickLocation}
        style={[styles.locationBox, { backgroundColor: colors['surface-container'] }]}>
        <Ionicons name="location" size={28} color={colors.primary} />
        <Text style={[Typography.body, { color: colors.primary }]}>{locationLabel || 'Tap to pin location'}</Text>
      </Pressable>
      <TextField
        label="Contact number"
        labelIcon={<Ionicons name="call-outline" size={16} color={colors.primary} />}
        value={contactNumber}
        onChangeText={onChangeContactNumber}
        placeholder="+91 XXXXX XXXXX"
        keyboardType="phone-pad"
      />
    </View>
  );
}

function VehicleStep({
  numberPlate,
  purchasePrice,
  selectedType,
  onChangeNumberPlate,
  onChangePurchasePrice,
  onSelectType,
}: {
  numberPlate: string;
  purchasePrice: string;
  selectedType: VehicleType;
  onChangeNumberPlate: (value: string) => void;
  onChangePurchasePrice: (value: string) => void;
  onSelectType: (value: VehicleType) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.step}>
      <Text style={[styles.badge, { backgroundColor: colors['surface-container'], color: colors.primary }]}>
        Step 3 of 3
      </Text>
      <Text style={[Typography.hero, { color: colors['on-background'] }]}>Add your first vehicle</Text>
      <Text style={[Typography.body, styles.description, { color: colors['on-background'] }]}>
        What type of vehicle do you sell?
      </Text>
      <View style={styles.vehicleTypeRow}>
        {vehicleTypes.map((type) => {
          const selected = type === selectedType;

          return (
            <Pressable
              key={type}
              onPress={() => onSelectType(type)}
              style={[
                styles.vehicleType,
                { backgroundColor: selected ? colors.primary : colors['surface-container'] },
              ]}>
              <Ionicons
                name={type === 'Cars' ? 'car-outline' : type === 'Bikes' ? 'bicycle-outline' : 'sparkles-outline'}
                size={28}
                color={selected ? colors['on-primary'] : colors.primary}
              />
              <Text style={[Typography.body, { color: selected ? colors['on-primary'] : colors.primary }]}>
                {type}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextField
        label="Number plate"
        labelIcon={<Ionicons name="clipboard-outline" size={16} color={colors.primary} />}
        value={numberPlate}
        onChangeText={onChangeNumberPlate}
        placeholder="AS01 AB 1234"
        autoCapitalize="characters"
      />
      <Text style={[Typography.caption, { color: colors['on-surface-variant'] }]}>
        We’ll auto-fill details via RTO API when vehicle APIs are ready.
      </Text>
      <TextField
        label="Purchase price"
        labelIcon={<Text style={[Typography.title, { color: colors.primary }]}>₹</Text>}
        value={purchasePrice}
        onChangeText={onChangePurchasePrice}
        placeholder="Enter amount"
        keyboardType="number-pad"
      />
    </View>
  );
}

function DoneStep({ showroomName }: { showroomName: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.step, styles.doneStep]}>
      <Ionicons name="checkmark" size={76} color={colors.primary} />
      <Text style={[Typography.hero, { color: colors['on-background'] }]}>You’re all set!</Text>
      <Text style={[Typography.body, { color: colors['on-background'] }]}>Your dealership is ready.</Text>
      <View style={[styles.doneCard, { borderColor: colors.primary }]}>
        <Ionicons name="storefront-outline" size={36} color={colors.primary} />
        <View style={styles.flex}>
          <Text style={[Typography.button, { color: colors['on-background'] }]}>{showroomName}</Text>
          <Text style={[Typography.body, { color: colors['on-surface-variant'] }]}>Guwahati, Assam</Text>
        </View>
        <Ionicons name="checkmark-circle" size={34} color={colors.primary} />
      </View>
    </View>
  );
}

function SetupCard({
  disabled = false,
  done = false,
  icon,
  title,
  subtitle,
  onPress,
}: {
  disabled?: boolean;
  done?: boolean;
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor: done ? colors.primary : colors.outline,
          opacity: disabled ? 0.5 : 1,
        },
      ]}>
      <View style={[styles.cardIcon, { backgroundColor: colors['surface-container'] }]}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[Typography.button, { color: colors['on-background'] }]}>{title}</Text>
        <Text style={[Typography.body, { color: colors['on-surface-variant'] }]}>{subtitle}</Text>
      </View>
      <Ionicons
        name={done ? 'checkmark-circle' : 'chevron-forward'}
        size={32}
        color={done ? colors.primary : colors['on-background']}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  progress: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Grid.columns.margin,
    paddingTop: 18,
  },
  progressItem: {
    flex: 1,
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 8,
  },
  content: {
    padding: Grid.columns.margin,
    paddingBottom: 120,
  },
  step: {
    gap: 18,
  },
  banner: {
    alignItems: 'center',
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    padding: 28,
  },
  description: {
    lineHeight: 22,
  },
  card: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  cardIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  warning: {
    borderColor: '#ff4d4d',
    borderRadius: 18,
    borderWidth: 1,
    lineHeight: 20,
    padding: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    fontFamily: Typography.button.fontFamily,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  locationBox: {
    alignItems: 'center',
    borderRadius: 18,
    gap: 10,
    padding: 28,
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    gap: 14,
  },
  vehicleType: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    gap: 8,
    paddingVertical: 20,
  },
  doneStep: {
    alignItems: 'center',
    paddingTop: 40,
  },
  doneCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginTop: 34,
    padding: 18,
    width: '100%',
  },
  error: {
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    bottom: 18,
    left: Grid.columns.margin,
    position: 'absolute',
    right: Grid.columns.margin,
  },
  flex: {
    flex: 1,
  },
});
