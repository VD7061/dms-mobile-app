import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BackButton, Button, ShowroomPickerModal, type ShowroomRole } from '@/components/ui';
import { Grid, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { assignShowroom, createVehicle, getProfile } from '@/services';
import {
  FieldLabel,
  FormTextInput,
  IconTextInput,
  formFieldStyles,
} from './components/VehicleFormFields';
import { VehiclePhotosPicker, type VehiclePhoto } from './components/VehiclePhotosPicker';

type ProfileData = {
  showroom_roles?: ShowroomRole[] | null;
};

type VehicleForm = {
  vehicleType: string;
  fuelType: string;
  manufacturer: string;
  model: string;
  variant: string;
  color: string;
  yearOfManufacture: string;
  usageKm: string;
  rtoCode: string;
  registrationState: string;
  registrationNumber: string;
  transmissionType: string;
};

const demoVehicleDefaults = {
  vehicleType: 'car',
  fuelType: 'petrol',
  manufacturer: 'Toyota',
  model: 'Camry',
  variant: 'LE',
  color: 'Black',
  yearOfManufacture: '2020',
  usageKm: '50000',
  rtoCode: 'AS-01',
  registrationState: 'Assam',
  transmissionType: 'manual',
};

function createDefaultForm(): VehicleForm {
  return {
    ...demoVehicleDefaults,
    registrationNumber: generateRegistrationNumber(),
  };
}

function generateRegistrationNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const series = `${letters[randomInt(letters.length)]}${letters[randomInt(letters.length)]}`;
  const number = String(randomInt(9000) + 1000);

  return `AS01${series}${number}`;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function dedupeShowrooms(showrooms: ShowroomRole[]) {
  const byId = new Map<number, ShowroomRole>();

  for (const showroom of showrooms) {
    if (typeof showroom.showroom_id === 'number' && !byId.has(showroom.showroom_id)) {
      byId.set(showroom.showroom_id, showroom);
    }
  }

  return Array.from(byId.values());
}

function isFormComplete(form: VehicleForm) {
  return (
    form.vehicleType.trim().length > 0 &&
    form.fuelType.trim().length > 0 &&
    form.manufacturer.trim().length > 0 &&
    form.model.trim().length > 0 &&
    form.variant.trim().length > 0 &&
    form.color.trim().length > 0 &&
    Number(form.yearOfManufacture) > 1900 &&
    form.usageKm.trim().length > 0 &&
    form.rtoCode.trim().length > 1 &&
    form.registrationState.trim().length > 0 &&
    form.registrationNumber.replace(/\s/g, '').length > 3 &&
    form.transmissionType.trim().length > 0
  );
}

export function AddVehicleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [form, setForm] = useState<VehicleForm>(() => createDefaultForm());
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingVehicleId, setPendingVehicleId] = useState<number | null>(null);
  const [showroomOptions, setShowroomOptions] = useState<ShowroomRole[]>([]);

  const updateField = (field: keyof VehicleForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const completeAssignment = async (vehicleId: number, showroom: ShowroomRole) => {
    setIsAssigning(true);

    try {
      await assignShowroom({ vehicleId, showroomId: showroom.showroom_id });
      setPendingVehicleId(null);
      setShowroomOptions([]);
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to assign vehicle to showroom.'
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const resolveShowroomAssignment = async (vehicleId: number) => {
    const profileResponse = await getProfile();
    const profileData =
      (profileResponse as unknown as { data?: ProfileData })?.data ??
      (profileResponse as unknown as ProfileData);

    console.log('Profile showroom_roles for assignment', profileData?.showroom_roles);

    const showrooms = dedupeShowrooms(profileData?.showroom_roles ?? []);

    if (showrooms.length === 0) {
      throw new Error('No showroom found to assign this vehicle.');
    }

    if (showrooms.length === 1) {
      await completeAssignment(vehicleId, showrooms[0]);
      return;
    }

    setPendingVehicleId(vehicleId);
    setShowroomOptions(showrooms);
  };

  const handleSubmit = async () => {
    if (!isFormComplete(form) || isSubmitting) {
      return;
    }

    Keyboard.dismiss();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await createVehicle(form);
      const responseData =
        (response as unknown as { data?: { id?: number } })?.data ??
        (response as unknown as { id?: number });
      const vehicleId = responseData?.id;

      if (!vehicleId) {
        throw new Error('Vehicle created, but vehicle id is missing from server response.');
      }

      await resolveShowroomAssignment(vehicleId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={[styles.header, { paddingHorizontal: Grid.columns.margin }]}>
          <BackButton />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingHorizontal: Grid.columns.margin }]}
          showsVerticalScrollIndicator={false}>
          <Text style={[Typography.hero2, styles.title, { color: colors['on-background'] }]}>
            Add new{'\n'}vehicle
          </Text>
          <Text style={[Typography.body, styles.subtitle, { color: colors['on-surface'] }]}>
            Add basic inventory details. We need these fields for the create vehicle API.
          </Text>

          <View style={styles.fieldGroup}>
            <FieldLabel label="Photos" />
            <VehiclePhotosPicker photos={photos} onChange={setPhotos} />
          </View>

          <View style={formFieldStyles.formFields}>
            <View style={formFieldStyles.fieldRow}>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Vehicle type" />
                <FormTextInput
                  value={form.vehicleType}
                  onChangeText={(value) => updateField('vehicleType', value)}
                  placeholder="Car"
                  autoCapitalize="none"
                />
              </View>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Fuel type" />
                <FormTextInput
                  value={form.fuelType}
                  onChangeText={(value) => updateField('fuelType', value)}
                  placeholder="Petrol"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={formFieldStyles.fieldRow}>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Manufacturer" />
                <FormTextInput
                  value={form.manufacturer}
                  onChangeText={(value) => updateField('manufacturer', value)}
                  placeholder="Suzuki"
                />
              </View>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Model" />
                <FormTextInput
                  value={form.model}
                  onChangeText={(value) => updateField('model', value)}
                  placeholder="Swift Dzire VXI"
                />
              </View>
            </View>

            <View style={formFieldStyles.fieldRow}>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Variant" />
                <FormTextInput
                  value={form.variant}
                  onChangeText={(value) => updateField('variant', value)}
                  placeholder="LE"
                />
              </View>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Color" />
                <FormTextInput
                  value={form.color}
                  onChangeText={(value) => updateField('color', value)}
                  placeholder="White"
                />
              </View>
            </View>

            <View style={formFieldStyles.fieldRow}>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Year" />
                <FormTextInput
                  value={form.yearOfManufacture}
                  onChangeText={(value) =>
                    updateField('yearOfManufacture', value.replace(/\D/g, '').slice(0, 4))
                  }
                  placeholder="2020"
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Usage KM" />
                <FormTextInput
                  value={form.usageKm}
                  onChangeText={(value) =>
                    updateField('usageKm', value.replace(/\D/g, '').slice(0, 7))
                  }
                  placeholder="50000"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={formFieldStyles.fieldRow}>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="RTO code" />
                <FormTextInput
                  value={form.rtoCode}
                  onChangeText={(value) => updateField('rtoCode', value.toUpperCase())}
                  placeholder="AS-01"
                  autoCapitalize="characters"
                />
              </View>
              <View style={formFieldStyles.fieldColumn}>
                <FieldLabel label="Registration State" />
                <FormTextInput
                  value={form.registrationState}
                  onChangeText={(value) => updateField('registrationState', value)}
                  placeholder="Assam"
                />
              </View>
            </View>

            <View style={formFieldStyles.fieldGroup}>
              <FieldLabel label="Registration number" />
              <IconTextInput
                icon="car-sport-outline"
                value={form.registrationNumber}
                onChangeText={(value) => updateField('registrationNumber', value.toUpperCase())}
                placeholder="AS01 AB 1234"
                autoCapitalize="characters"
              />
            </View>

            <View style={formFieldStyles.fieldGroup}>
              <FieldLabel label="Transmission type" />
              <FormTextInput
                value={form.transmissionType}
                onChangeText={(value) => updateField('transmissionType', value)}
                placeholder="Manual"
                autoCapitalize="none"
              />
            </View>
          </View>

          {errorMessage ? (
            <Text style={[Typography.caption, styles.errorText, { color: colors.error }]}>
              {errorMessage}
            </Text>
          ) : null}

          <Button
            label="Continue"
            onPress={handleSubmit}
            disabled={!isFormComplete(form) || isSubmitting || isAssigning}
            loading={isSubmitting || isAssigning}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ShowroomPickerModal
        visible={Boolean(pendingVehicleId && showroomOptions.length > 1)}
        showrooms={showroomOptions}
        isAssigning={isAssigning}
        onClose={() => {
          if (!isAssigning) {
            setPendingVehicleId(null);
            setShowroomOptions([]);
          }
        }}
        onSelect={(showroom) => {
          if (pendingVehicleId) {
            completeAssignment(pendingVehicleId, showroom);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 17,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  fieldGroup: {
    gap: 8,
    marginBottom: 20,
  },
  errorText: {
    marginTop: 8,
    marginBottom: -8,
    lineHeight: 17,
  },
  submitButton: {
    marginTop: 28,
  },
});
