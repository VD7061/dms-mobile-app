import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomSheet, Button, ShowroomPickerModal, type ShowroomRole } from '@/components/ui';
import { FontFamily, Grid, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { assignShowroom, createShowroom, createVehicle, getProfile, uploadVehicleImage } from '@/services';
import { useAuthStore } from '@/store';
import {
  fuelTypeOptions,
  transmissionTypeOptions,
  vehicleTypeOptions,
  yearOfManufactureOptions,
} from '@/views/vehicles/data';
import { SelectField } from '@/views/vehicles/components/VehicleFormFields';
import { VehiclePhotosPicker, type VehiclePhoto } from '@/views/vehicles/components/VehiclePhotosPicker';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type SetupStep = 'welcome' | 'showroom' | 'vehicle' | 'done';
type PickedImage = {
  uri: string;
  name?: string | null;
  type?: string | null;
};
type ProfileData = {
  name?: string | null;
  country_code?: string | null;
  phone_number?: string | null;
  required_name?: boolean;
  has_showrooms?: boolean;
  has_vehicles?: boolean;
  showroom_roles?: ShowroomRole[] | null;
};
type ProfileResponse = {
  data?: ProfileData;
};
type VehicleForm = {
  vehicleType: string;
  manufacturer: string;
  model: string;
  variant: string;
  color: string;
  yearOfManufacture: string;
  rtoCode: string;
  registrationNumber: string;
  registrationState: string;
  usageKm: string;
  fuelType: string;
  transmissionType: string;
};

const tabs = [
  'Welcome',
  'Showroom',
  'Vehicle',
  'Done',
] as const;
const PROFILE_RECHECK_DELAY_MS = 1000;
const DASHBOARD_DELAY_MS = 5000;
const demoVehicleDefaults = {
  vehicleType: 'car',
  manufacturer: 'Toyota',
  model: 'Camry',
  variant: 'LE',
  color: 'Black',
  yearOfManufacture: '2020',
  rtoCode: 'AS-01',
  registrationState: 'Assam',
  usageKm: '50000',
  fuelType: 'petrol',
  transmissionType: 'manual',
};

function createDefaultVehicleForm(): VehicleForm {
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

export function WelcomeSetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string }>();
  const fullName = useAuthStore((s) => s.fullName);
  const countryCode = useAuthStore((s) => s.countryCode);
  const phoneNumber = useAuthStore((s) => s.phoneNumber);
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const setCanEnterApp = useAuthStore((s) => s.setCanEnterApp);
  const setFullName = useAuthStore((s) => s.setFullName);
  const setProfileContact = useAuthStore((s) => s.setProfileContact);
  const setPrimaryShowroomId = useAuthStore((s) => s.setPrimaryShowroomId);
  const startsAtVehicle = params.step === 'vehicle';
  const [step, setStep] = useState<SetupStep>(startsAtVehicle ? 'vehicle' : 'welcome');
  const [showroomComplete, setShowroomComplete] = useState(startsAtVehicle);
  const [vehicleComplete, setVehicleComplete] = useState(false);
  const [showroomName, setShowroomName] = useState('AutoDeals Guwahati');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [showroomState, setShowroomState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationPinned, setLocationPinned] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isCreatingShowroom, setIsCreatingShowroom] = useState(false);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [isAssigningVehicle, setIsAssigningVehicle] = useState(false);
  const [isCheckingNextStep, setIsCheckingNextStep] = useState(false);
  const [logoImage, setLogoImage] = useState<PickedImage | null>(null);
  const [bannerImage, setBannerImage] = useState<PickedImage | null>(null);
  const [photoPickerTarget, setPhotoPickerTarget] = useState<'logo' | 'banner' | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(() => createDefaultVehicleForm());
  const [vehiclePhotos, setVehiclePhotos] = useState<VehiclePhoto[]>([]);
  const [pendingVehicleId, setPendingVehicleId] = useState<number | null>(null);
  const [showroomOptions, setShowroomOptions] = useState<ShowroomRole[]>([]);
  const hasShowroomSelection = Boolean(pendingVehicleId && showroomOptions.length > 1);
  const isSubmitting = isCreatingShowroom || isCreatingVehicle || isAssigningVehicle || isCheckingNextStep;
  const readonlyPhoneNumber = formatProfilePhone(countryCode, phoneNumber);
  const activeTab = showroomComplete && step === 'welcome' ? 'Welcome' : tabForStep(step);

  const canContinue = useMemo(() => {
    if (step === 'showroom') {
      return showroomName.trim().length > 1;
    }

    if (step === 'vehicle') {
      return isVehicleFormComplete(vehicleForm);
    }

    return true;
  }, [showroomName, step, vehicleForm]);

  useEffect(() => {
    if (step !== 'done') {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCanEnterApp(true);
      completeProfile(fullName);
      router.replace('/(app)');
    }, DASHBOARD_DELAY_MS);

    return () => clearTimeout(timer);
  }, [completeProfile, fullName, router, setCanEnterApp, step]);

  const applyPickedImage = (target: 'logo' | 'banner', asset: ImagePicker.ImagePickerAsset) => {
    const image = {
      uri: asset.uri,
      name: asset.fileName,
      type: asset.mimeType,
    };

    if (target === 'banner') {
      setBannerImage(image);
      return;
    }

    setLogoImage(image);
  };

  const handleTakePhoto = async (target: 'logo' | 'banner') => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Camera access needed',
        'Please allow camera access to take a showroom photo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: target === 'banner' ? [16, 6] : [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    applyPickedImage(target, result.assets[0]);
  };

  const handleChooseFromLibrary = async (target: 'logo' | 'banner') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Please allow photo access to select a showroom image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: target === 'banner' ? [16, 6] : [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    applyPickedImage(target, result.assets[0]);
  };

  const handlePickImage = (target: 'logo' | 'banner') => {
    setPhotoPickerTarget(target);
  };

  const handleClosePhotoPicker = () => {
    setPhotoPickerTarget(null);
  };

  const handleSelectPhotoSource = (source: 'camera' | 'library') => {
    if (!photoPickerTarget) {
      return;
    }

    const target = photoPickerTarget;
    setPhotoPickerTarget(null);

    if (source === 'camera') {
      handleTakePhoto(target);
      return;
    }

    handleChooseFromLibrary(target);
  };

  const handleUseCurrentLocation = async () => {
    if (isFetchingLocation) {
      return;
    }

    setIsFetchingLocation(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Location access needed',
          'Please allow location access to auto-fill showroom address details.'
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      setLocationPinned(true);

      const [place] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (place) {
        const streetAddress = [place.name, place.street, place.district]
          .filter(Boolean)
          .join(', ');

        setAddress(streetAddress);
        setCity(place.city ?? place.subregion ?? '');
        setShowroomState(place.region ?? '');
        setPincode(place.postalCode ?? '');
      }
    } catch (error) {
      Alert.alert(
        'Location unavailable',
        error instanceof Error ? error.message : 'Unable to fetch your current location.'
      );
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const updateVehicleField = (field: keyof VehicleForm, value: string) => {
    setVehicleForm((current) => ({
      ...current,
      [field]: formatVehicleFieldValue(field, value),
    }));
  };

  const fetchProfileForNextStep = async () => {
    const response = await getProfile();
    const profile = (response as unknown as ProfileResponse).data;

    if (!profile) {
      throw new Error('Profile data missing from server response.');
    }

    if (profile.name) {
      setFullName(profile.name);
    }

    setProfileContact({
      countryCode: profile.country_code ?? undefined,
      phoneNumber: profile.phone_number ?? undefined,
    });

    return profile;
  };

  const moveToNextSetupStep = (profile: ProfileData) => {
    if (profile.required_name) {
      setCanEnterApp(false);
      router.replace('/(setup)/profile');
      return;
    }

    if (!profile.has_showrooms) {
      setCanEnterApp(false);
      setShowroomComplete(false);
      setVehicleComplete(false);
      setStep('showroom');
      return;
    }

    setShowroomComplete(true);

    if (!profile.has_vehicles) {
      setCanEnterApp(false);
      setVehicleComplete(false);
      setStep('vehicle');
      return;
    }

    setCanEnterApp(false);
    setVehicleComplete(true);
    setStep('done');
  };

  const completeVehicleAssignment = async (vehicleId: number, showroom: ShowroomRole) => {
    setIsAssigningVehicle(true);

    try {
      const response = await assignShowroom({
        vehicleId,
        showroomId: showroom.showroom_id,
      });
      const responseBody = getApiResponseBody(response);

      if (__DEV__) {
        console.log('Assign vehicle showroom response', responseBody);
      }

      if (vehiclePhotos.length > 0) {
        const uploadResults = await Promise.allSettled(
          vehiclePhotos.map((photo) => uploadVehicleImage({ vehicleId, label: photo.label, photo }))
        );

        if (__DEV__) {
          console.log('Vehicle photo upload results', uploadResults);
        }
      }

      setPrimaryShowroomId(showroom.showroom_id);
      setPendingVehicleId(null);
      setShowroomOptions([]);
      setVehicleComplete(true);
      setCanEnterApp(false);
      setStep('done');
    } catch (error) {
      if (__DEV__) {
        console.log('Assign vehicle showroom error', error);
      }
      showApiAlertInProduction(
        'Vehicle assignment failed',
        error,
        'Unable to assign vehicle to showroom.'
      );
    } finally {
      setIsAssigningVehicle(false);
    }
  };

  const resolveShowroomAssignment = async (vehicleId: number, profile: ProfileData) => {
    if (__DEV__) {
      console.log('Profile showroom_roles for assignment', profile.showroom_roles);
    }

    const showrooms = getAssignableShowrooms(profile);

    if (showrooms.length === 0) {
      throw new Error('No showroom found to assign this vehicle.');
    }

    if (showrooms.length === 1) {
      await completeVehicleAssignment(vehicleId, showrooms[0]);
      return;
    }

    setPendingVehicleId(vehicleId);
    setShowroomOptions(showrooms);
  };

  const handleCreateShowroom = async () => {
    if (isCreatingShowroom) {
      return;
    }

    const nextShowroomName = showroomName.trim();

    if (nextShowroomName.length <= 1) {
      Alert.alert('Showroom name needed', 'Please enter your showroom name.');
      return;
    }

    setIsCreatingShowroom(true);

    try {
      const response = await createShowroom({
        name: nextShowroomName,
        geolocation: {
          address,
          city,
          state: showroomState,
          pincode,
          lat: latitude,
          lng: longitude,
        },
        logo: logoImage,
        banner: bannerImage,
      });
      const responseBody = getApiResponseBody(response);

      if (__DEV__) {
        console.log('Create showroom response', responseBody);
      }

      setShowroomComplete(true);
      setIsCheckingNextStep(true);
      await delay(PROFILE_RECHECK_DELAY_MS);
      const profile = await fetchProfileForNextStep();
      moveToNextSetupStep(profile);
    } catch (error) {
      showApiAlertInProduction('Showroom create failed', error);
    } finally {
      setIsCreatingShowroom(false);
      setIsCheckingNextStep(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (isCreatingVehicle) {
      return;
    }

    if (!isVehicleFormComplete(vehicleForm)) {
      Alert.alert('Vehicle details needed', 'Please fill all required vehicle details.');
      return;
    }

    setIsCreatingVehicle(true);

    try {
      if (__DEV__) {
        console.log('Create vehicle form', vehicleForm);
      }

      const response = await createVehicle(vehicleForm);
      const responseBody = getApiResponseBody(response);

      if (__DEV__) {
        console.log('Create vehicle response', responseBody);
      }

      const vehicleId = getCreatedVehicleId(responseBody);

      if (!vehicleId) {
        throw new Error('Vehicle created, but vehicle id is missing from server response.');
      }

      setVehicleNumber(vehicleForm.registrationNumber);
      setIsCheckingNextStep(true);
      await delay(PROFILE_RECHECK_DELAY_MS);
      const profile = await fetchProfileForNextStep();
      await resolveShowroomAssignment(vehicleId, profile);
    } catch (error) {
      if (__DEV__) {
        console.log('Create vehicle error', error);
      }
      showApiAlertInProduction('Vehicle create failed', error, 'Unable to create vehicle.');
    } finally {
      setIsCreatingVehicle(false);
      setIsCheckingNextStep(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (step === 'welcome' && !showroomComplete) {
      setStep('showroom');
      return;
    }

    if (step === 'welcome' && showroomComplete) {
      setStep('vehicle');
      return;
    }

    if (step === 'showroom') {
      await handleCreateShowroom();
      return;
    }

    if (step === 'vehicle') {
      await handleCreateVehicle();
      return;
    }

    completeProfile(fullName);
    setCanEnterApp(true);
    router.replace('/(app)');
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={8}>
        <View style={styles.content}>
          <StepTabs activeTab={activeTab} showroomComplete={showroomComplete} vehicleComplete={vehicleComplete} />

          <ScrollView
            key={step}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {step === 'welcome' ? (
              <WelcomePart
                showroomComplete={showroomComplete}
                vehicleComplete={vehicleComplete}
                onShowroomPress={() => setStep('showroom')}
                onVehiclePress={() => showroomComplete && setStep('vehicle')}
              />
            ) : null}

            {step === 'showroom' ? (
              <ShowroomPart
                showroomName={showroomName}
                address={address}
                city={city}
                showroomState={showroomState}
                pincode={pincode}
                latitude={latitude}
                longitude={longitude}
                phoneNumber={readonlyPhoneNumber}
                logoImageUri={logoImage?.uri}
                bannerImageUri={bannerImage?.uri}
                locationPinned={locationPinned}
                isFetchingLocation={isFetchingLocation}
                onShowroomNameChange={setShowroomName}
                onAddressChange={setAddress}
                onCityChange={setCity}
                onShowroomStateChange={setShowroomState}
                onPincodeChange={setPincode}
                onLatitudeChange={setLatitude}
                onLongitudeChange={setLongitude}
                onPickLogo={() => handlePickImage('logo')}
                onPickBanner={() => handlePickImage('banner')}
                onLocationPress={handleUseCurrentLocation}
              />
            ) : null}

            {step === 'vehicle' ? (
              <VehiclePart
                form={vehicleForm}
                onFieldChange={updateVehicleField}
                photos={vehiclePhotos}
                onPhotosChange={setVehiclePhotos}
              />
            ) : null}

            {step === 'done' ? (
              <DonePart showroomName={showroomName} vehicleNumber={vehicleNumber} />
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label={buttonLabel(step, {
                isCheckingNextStep,
                isCreatingShowroom,
                isCreatingVehicle,
                isAssigningVehicle,
              })}
              onPress={handlePrimaryAction}
              disabled={!canContinue || isSubmitting || hasShowroomSelection}
              loading={(step === 'showroom' || step === 'vehicle') && isSubmitting}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      <ShowroomPickerModal
        visible={hasShowroomSelection}
        showrooms={showroomOptions}
        isAssigning={isAssigningVehicle}
        onClose={() => {
          if (!isAssigningVehicle) {
            setPendingVehicleId(null);
            setShowroomOptions([]);
          }
        }}
        onSelect={(showroom) => {
          if (pendingVehicleId) {
            completeVehicleAssignment(pendingVehicleId, showroom);
          }
        }}
      />
      <PhotoSourceSheet
        visible={Boolean(photoPickerTarget)}
        onClose={handleClosePhotoPicker}
        onSelectSource={handleSelectPhotoSource}
      />
    </SafeAreaView>
  );
}

function tabForStep(step: SetupStep) {
  if (step === 'showroom') {
    return 'Showroom';
  }

  if (step === 'vehicle') {
    return 'Vehicle';
  }

  if (step === 'done') {
    return 'Done';
  }

  return 'Welcome';
}

function formatProfilePhone(countryCode: string, phoneNumber: string) {
  if (!phoneNumber) {
    return '';
  }

  const digits = phoneNumber.replace(/\D/g, '');
  const code = countryCode.replace(/\D/g, '');
  const localNumber = code && digits.startsWith(code) ? digits.slice(code.length) : digits;

  return code ? `+${code} - ${localNumber}` : localNumber;
}

function getApiResponseBody(response: unknown) {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data?: unknown }).data;
  }

  return response;
}

function getCreatedVehicleId(response: unknown) {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const vehicleId = (response as { id?: unknown }).id;
  return typeof vehicleId === 'number' ? vehicleId : null;
}

function getAssignableShowrooms(profile: ProfileData) {
  const byId = new Map<number, ShowroomRole>();

  for (const showroom of profile.showroom_roles ?? []) {
    if (typeof showroom.showroom_id === 'number' && !byId.has(showroom.showroom_id)) {
      byId.set(showroom.showroom_id, showroom);
    }
  }

  return Array.from(byId.values());
}

function isVehicleFormComplete(form: VehicleForm) {
  return (
    form.vehicleType.trim().length > 0 &&
    form.manufacturer.trim().length > 0 &&
    form.model.trim().length > 0 &&
    form.variant.trim().length > 0 &&
    form.color.trim().length > 0 &&
    Number(form.yearOfManufacture) > 1900 &&
    form.rtoCode.trim().length > 1 &&
    form.registrationNumber.replace(/\s/g, '').length > 3 &&
    form.registrationState.trim().length > 0 &&
    Number(form.usageKm) >= 0 &&
    form.fuelType.trim().length > 0 &&
    form.transmissionType.trim().length > 0
  );
}

function formatVehicleFieldValue(field: keyof VehicleForm, value: string) {
  if (field === 'yearOfManufacture') {
    return value.replace(/\D/g, '').slice(0, 4);
  }

  if (field === 'usageKm') {
    return value.replace(/\D/g, '').slice(0, 7);
  }

  if (field === 'rtoCode' || field === 'registrationNumber') {
    return value.toUpperCase();
  }

  if (field === 'vehicleType' || field === 'fuelType' || field === 'transmissionType') {
    return value.toLowerCase();
  }

  return value;
}

function getApiErrorMessage(error: unknown, fallback = 'Unable to create showroom.') {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body?: unknown }).body;
    return toAlertMessage(body, fallback);
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    return toAlertMessage(response?.data, fallback);
  }

  return toAlertMessage(error, fallback);
}

function showApiAlertInProduction(title: string, error: unknown, fallback?: string) {
  if (__DEV__) {
    return;
  }

  Alert.alert(title, getApiErrorMessage(error, fallback));
}

function toAlertMessage(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    const payload = value as { message?: unknown; error?: unknown };
    const nestedMessage = toAlertMessage(payload.message ?? payload.error, '');

    if (nestedMessage) {
      return nestedMessage;
    }

    try {
      const text = JSON.stringify(value, null, 2);
      return text.length > 900 ? `${text.slice(0, 900)}...` : text;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buttonLabel(
  step: SetupStep,
  state: {
    isCheckingNextStep?: boolean;
    isCreatingShowroom?: boolean;
    isCreatingVehicle?: boolean;
    isAssigningVehicle?: boolean;
  } = {}
) {
  if (state.isCheckingNextStep) {
    return 'Checking next step';
  }

  if (state.isCreatingShowroom) {
    return 'Saving showroom';
  }

  if (state.isCreatingVehicle) {
    return 'Saving vehicle';
  }

  if (state.isAssigningVehicle) {
    return 'Assigning showroom';
  }

  if (step === 'welcome') {
    return 'Next';
  }

  if (step === 'done') {
    return 'Go to Dashboard';
  }

  return 'Continue';
}

function StepTabs({
  activeTab,
  showroomComplete,
  vehicleComplete,
}: {
  activeTab: (typeof tabs)[number];
  showroomComplete: boolean;
  vehicleComplete: boolean;
}) {
  const { colors } = useTheme();
  const activeIndex = tabs.indexOf(activeTab);
  const completeIndex =
    vehicleComplete ? 3 : activeTab === 'Vehicle' ? 2 : showroomComplete ? 1 : activeIndex;

  return (
    <View style={styles.tabsWrap}>
      <View style={[styles.progressTrack, { backgroundColor: colors['surface-container'] }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${Math.max(((completeIndex + 1) / tabs.length) * 100, 22)}%`,
            },
          ]}
        />
      </View>
      <View style={styles.tabLabels}>
        {tabs.map((tab) => {
          const active = tab === activeTab;

          return (
            <Text
              key={tab}
              style={[
                Typography.micro,
                styles.tabLabel,
                {
                  color: active ? colors.primary : colors['on-surface-variant'],
                  fontFamily: active ? Typography.screenTitle.fontFamily : FontFamily.medium,
                },
              ]}>
              {tab}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function WelcomePart({
  showroomComplete,
  vehicleComplete,
  onShowroomPress,
  onVehiclePress,
}: {
  showroomComplete: boolean;
  vehicleComplete: boolean;
  onShowroomPress: () => void;
  onVehiclePress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.welcomePart}>
      <View style={styles.header}>
        <Text style={[Typography.hero2, styles.welcomeTitle, { color: colors['on-background'] }]}>
          Welcome!
        </Text>
        <Text style={[Typography.body, styles.subtitleLeft, { color: colors['on-surface'] }]}>
          Let's set up your dealership in 3 quick steps so you can start managing your inventory.
        </Text>
      </View>

      <View style={styles.taskStack}>
        <SetupTaskCard
          title="Add your showroom"
          subtitle="Name, location & contact"
          icon="storefront-outline"
          state={showroomComplete ? 'complete' : 'active'}
          onPress={onShowroomPress}
        />
        <SetupTaskCard
          title="Add your first vehicle"
          subtitle="Register via number plate"
          icon="car-sport-outline"
          state={vehicleComplete ? 'complete' : showroomComplete ? 'active' : 'locked'}
          onPress={onVehiclePress}
        />
      </View>

      {!showroomComplete ? (
        <View style={[styles.warningBox, { borderColor: colors.error }]}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
          <Text style={[Typography.caption, styles.warningText, { color: colors.error }]}>
            You'll need to add your showroom first before you can register vehicles to it.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function BrandUpload({
  logoImageUri,
  bannerImageUri,
  onPickLogo,
  onPickBanner,
}: {
  logoImageUri?: string;
  bannerImageUri?: string;
  onPickLogo: () => void;
  onPickBanner: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.brandWrap}>
      <Pressable
        onPress={onPickBanner}
        style={[
          styles.bannerUpload,
          {
            backgroundColor: colors['surface-container'],
            borderColor: colors.outline,
          },
        ]}>
        {bannerImageUri ? (
          <Image source={{ uri: bannerImageUri }} style={styles.bannerImage} />
        ) : (
          <>
            <Ionicons name="image-outline" size={34} color={colors.primary} />
            <Text style={[Typography.caption, styles.bannerLabel, { color: colors.primary }]}>
              Add a banner image
            </Text>
          </>
        )}
        <View style={[styles.editBadge, { backgroundColor: colors.background }]}>
          <Ionicons name="pencil" size={17} color={colors.primary} />
        </View>
      </Pressable>

      <View style={styles.logoRow}>
        <Pressable onPress={onPickLogo} style={styles.logoCluster}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors['surface-container-low'],
                borderColor: colors.background,
              },
            ]}>
            {logoImageUri ? (
              <Image source={{ uri: logoImageUri }} style={styles.logoImage} />
            ) : (
              <Ionicons name="storefront-outline" size={32} color={colors.primary} />
            )}
          </View>
          <View style={[styles.plusBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={18} color={colors['on-primary']} />
          </View>
        </Pressable>
        <Text style={[Typography.caption, styles.logoLabel, { color: colors.primary }]}>
          Add your logo & banner
        </Text>
        <View style={[styles.optionalPill, { backgroundColor: colors['surface-container-high'] }]}>
          <Text style={[Typography.micro, styles.optionalText, { color: colors.primary }]}>
            Optional
          </Text>
        </View>
      </View>
    </View>
  );
}

function SetupTaskCard({
  title,
  subtitle,
  icon,
  state,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  state: 'active' | 'complete' | 'locked';
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isLocked = state === 'locked';
  const isComplete = state === 'complete';
  const iconBackground = isLocked ? colors['surface-container'] : colors.primary;
  const iconColor = isLocked ? colors['on-surface-variant'] : colors['on-primary'];

  return (
    <Pressable
      disabled={isLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.taskCard,
        {
          borderColor: isLocked ? colors.outline : colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.taskIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <View style={styles.taskText}>
        <Text
          style={[
            Typography.body,
            styles.taskTitle,
            { color: isLocked ? colors['on-surface-variant'] : colors['on-surface'] },
          ]}>
          {title}
        </Text>
        <Text style={[Typography.caption, styles.taskSubtitle, { color: colors['on-surface-variant'] }]}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.taskAction}>
        {isComplete ? (
          <Ionicons name="checkmark-circle" size={34} color={colors.primary} />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={28}
            color={isLocked ? colors['on-surface-variant'] : colors['on-surface']}
          />
        )}
      </View>
    </Pressable>
  );
}

function ShowroomPart({
  showroomName,
  address,
  city,
  showroomState,
  pincode,
  latitude,
  longitude,
  phoneNumber,
  logoImageUri,
  bannerImageUri,
  locationPinned,
  isFetchingLocation,
  onShowroomNameChange,
  onAddressChange,
  onCityChange,
  onShowroomStateChange,
  onPincodeChange,
  onLatitudeChange,
  onLongitudeChange,
  onPickLogo,
  onPickBanner,
  onLocationPress,
}: {
  showroomName: string;
  address: string;
  city: string;
  showroomState: string;
  pincode: string;
  latitude: string;
  longitude: string;
  phoneNumber: string;
  logoImageUri?: string;
  bannerImageUri?: string;
  locationPinned: boolean;
  isFetchingLocation: boolean;
  onShowroomNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onShowroomStateChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onPickLogo: () => void;
  onPickBanner: () => void;
  onLocationPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.formPart}>
      <View style={[styles.stepBadge, { backgroundColor: colors['surface-container'] }]}>
        <Text style={[Typography.screenTitle, styles.stepBadgeText, { color: colors.primary }]}>
          Step 2 of 3
        </Text>
      </View>

      <View style={styles.formHeader}>
        <Text style={[Typography.hero2, styles.formTitle, { color: colors['on-background'] }]}>
          Add your{'\n'}showroom
        </Text>
        <Text style={[Typography.body, styles.formSubtitle, { color: colors['on-surface'] }]}>
          Add showroom details now. Logo, banner, and location fields are optional.
        </Text>
      </View>

      <BrandUpload
        logoImageUri={logoImageUri}
        bannerImageUri={bannerImageUri}
        onPickLogo={onPickLogo}
        onPickBanner={onPickBanner}
      />

      <View style={styles.formFields}>
        <View style={styles.fieldGroup}>
          <FieldLabel label="Showroom name" />
          <IconTextInput
            icon="storefront-outline"
            value={showroomName}
            onChangeText={onShowroomNameChange}
            placeholder="Showroom name"
          />
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label="Phone number" />
          <ReadonlyField value={phoneNumber || 'Phone number'} />
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label="Address" />
          <FormTextInput
            value={address}
            onChangeText={onAddressChange}
            placeholder="Street address"
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <FieldLabel label="City" />
            <FormTextInput value={city} onChangeText={onCityChange} placeholder="City" />
          </View>
          <View style={styles.fieldColumn}>
            <FieldLabel label="State" />
            <FormTextInput value={showroomState} onChangeText={onShowroomStateChange} placeholder="State" />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Pincode" />
            <FormTextInput
              value={pincode}
              onChangeText={(value) => onPincodeChange(value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Pincode"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Latitude" />
            <FormTextInput
              value={latitude}
              onChangeText={onLatitudeChange}
              placeholder="26.1445"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label="Longitude" />
          <FormTextInput
            value={longitude}
            onChangeText={onLongitudeChange}
            placeholder="91.7362"
            keyboardType="decimal-pad"
          />
        </View>

        <Pressable
          onPress={onLocationPress}
          disabled={isFetchingLocation}
          style={[
            styles.locationMiniCard,
            {
              backgroundColor: colors['surface-container'],
              opacity: isFetchingLocation ? 0.75 : 1,
            },
          ]}>
          <Ionicons
            name={isFetchingLocation ? 'sync-outline' : 'location'}
            size={22}
            color={colors.primary}
          />
          <Text style={[Typography.caption, styles.locationText, { color: colors.primary }]}>
            {isFetchingLocation
              ? 'Fetching location...'
              : locationPinned
                ? 'Location pinned'
                : 'Use current location'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function PhotoSourceSheet({
  visible,
  onClose,
  onSelectSource,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectSource: (source: 'camera' | 'library') => void;
}) {
  const { colors } = useTheme();

  const options: { source: 'camera' | 'library'; icon: IconName; label: string }[] = [
    { source: 'camera', icon: 'camera-outline', label: 'Take photo' },
    { source: 'library', icon: 'images-outline', label: 'Choose from library' },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[Typography.title, styles.photoSheetTitle, { color: colors['on-background'] }]}>
        Add photo
      </Text>

      <View style={styles.photoSheetOptions}>
        {options.map((option) => (
          <Pressable
            key={option.source}
            onPress={() => onSelectSource(option.source)}
            style={({ pressed }) => [
              styles.photoSheetOption,
              {
                backgroundColor: colors['surface-container-low'],
                borderColor: colors['outline-variant'],
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <View style={[styles.photoSheetIcon, { backgroundColor: colors['surface-container'] }]}>
              <Ionicons name={option.icon} size={22} color={colors.primary} />
            </View>
            <Text style={[Typography.body, styles.photoSheetLabel, { color: colors['on-surface'] }]}>
              {option.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors['on-surface-variant']} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

function VehiclePart({
  form,
  onFieldChange,
  photos,
  onPhotosChange,
}: {
  form: VehicleForm;
  onFieldChange: (field: keyof VehicleForm, value: string) => void;
  photos: VehiclePhoto[];
  onPhotosChange: (photos: VehiclePhoto[]) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.formPart}>
      <View style={[styles.stepBadge, { backgroundColor: colors['surface-container'] }]}>
        <Text style={[Typography.screenTitle, styles.stepBadgeText, { color: colors.primary }]}>
          Step 3 of 3
        </Text>
      </View>

      <View style={styles.formHeader}>
        <Text style={[Typography.hero2, styles.formTitle, { color: colors['on-background'] }]}>
          Add your first{'\n'}vehicle
        </Text>
        <Text style={[Typography.body, styles.formSubtitle, { color: colors['on-surface'] }]}>
          Add basic inventory details. We need these fields for the create vehicle API.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <FieldLabel label="Photos" />
        <VehiclePhotosPicker photos={photos} onChange={onPhotosChange} />
      </View>

      <View style={styles.formFields}>
        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Vehicle type" />
            <SelectField
              label="Vehicle type"
              value={form.vehicleType}
              options={vehicleTypeOptions}
              onChange={(value) => onFieldChange('vehicleType', value)}
              placeholder="Select type"
            />
          </View>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Fuel type" />
            <SelectField
              label="Fuel type"
              value={form.fuelType}
              options={fuelTypeOptions}
              onChange={(value) => onFieldChange('fuelType', value)}
              placeholder="Select fuel"
            />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Manufacturer" />
            <FormTextInput
              value={form.manufacturer}
              onChangeText={(value) => onFieldChange('manufacturer', value)}
              placeholder="Toyota"
            />
          </View>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Model" />
            <FormTextInput
              value={form.model}
              onChangeText={(value) => onFieldChange('model', value)}
              placeholder="Camry"
            />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Variant" />
            <FormTextInput
              value={form.variant}
              onChangeText={(value) => onFieldChange('variant', value)}
              placeholder="LE"
            />
          </View>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Color" />
            <FormTextInput
              value={form.color}
              onChangeText={(value) => onFieldChange('color', value)}
              placeholder="Black"
            />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Year" />
            <SelectField
              label="Year of manufacture"
              value={form.yearOfManufacture}
              options={yearOfManufactureOptions}
              onChange={(value) => onFieldChange('yearOfManufacture', value)}
              placeholder="Select year"
            />
          </View>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Usage KM" />
            <FormTextInput
              value={form.usageKm}
              onChangeText={(value) => onFieldChange('usageKm', value)}
              placeholder="50000"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <FieldLabel label="RTO code" />
            <FormTextInput
              value={form.rtoCode}
              onChangeText={(value) => onFieldChange('rtoCode', value)}
              placeholder="KA-01"
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.fieldColumn}>
            <FieldLabel label="Registration State" />
            <FormTextInput
              value={form.registrationState}
              onChangeText={(value) => onFieldChange('registrationState', value)}
              placeholder="Karnataka"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label="Registration number" />
          <IconTextInput
            icon="car-sport-outline"
            value={form.registrationNumber}
            onChangeText={(value) => onFieldChange('registrationNumber', value)}
            placeholder="KA01AB1234"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label="Transmission type" />
          <SelectField
            label="Transmission type"
            value={form.transmissionType}
            options={transmissionTypeOptions}
            onChange={(value) => onFieldChange('transmissionType', value)}
            placeholder="Select transmission"
          />
        </View>
      </View>
    </View>
  );
}

function DonePart({ showroomName, vehicleNumber }: { showroomName: string; vehicleNumber: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.donePart}>
      <View style={[styles.doneIcon, { backgroundColor: colors['surface-container'] }]}>
        <Ionicons name="checkmark-circle" size={52} color={colors.primary} />
      </View>
      <Text style={[Typography.hero2, styles.doneTitle, { color: colors['on-background'] }]}>
        You're all set!
      </Text>
      <Text style={[Typography.body, styles.doneSubtitle, { color: colors['on-surface'] }]}>
        {showroomName} is ready with {vehicleNumber || 'your first vehicle'}.
      </Text>
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  const { colors } = useTheme();

  return (
    <Text style={[Typography.body, styles.fieldLabel, { color: colors['on-background'] }]}>
      {label}
    </Text>
  );
}

function IconTextInput({
  icon,
  style,
  ...inputProps
}: React.ComponentProps<typeof TextInput> & { icon: IconName }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.inputWrap, { borderColor: colors.primary }]}>
      <Ionicons name={icon} size={23} color={colors.primary} />
      <TextInput
        {...inputProps}
        placeholderTextColor={colors['on-surface-variant']}
        style={[
          Typography.body,
          styles.input,
          {
            color: colors['on-surface'],
          },
          style,
        ]}
      />
    </View>
  );
}

function FormTextInput({
  style,
  ...inputProps
}: React.ComponentProps<typeof TextInput>) {
  const { colors } = useTheme();

  return (
    <TextInput
      {...inputProps}
      placeholderTextColor={colors['on-surface-variant']}
      style={[
        Typography.body,
        styles.formInput,
        {
          color: colors['on-surface'],
          borderColor: colors.outline,
          backgroundColor: colors.background,
        },
        style,
      ]}
    />
  );
}

function ReadonlyField({ value }: { value: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.readonlyField,
        {
          borderColor: colors.outline,
          backgroundColor: colors.background,
        },
      ]}>
      <Ionicons name="call-outline" size={20} color={colors.primary} />
      <Text style={[Typography.body, styles.readonlyText, { color: colors['on-surface'] }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Grid.columns.margin,
    paddingTop: 18,
    paddingBottom: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 21,
    paddingBottom: 28,
  },
  tabsWrap: {
    paddingTop: 6,
    gap: 13,
  },
  progressTrack: {
    height: 10,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
  },
  tabLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 13,
    lineHeight: 16,
  },
  welcomePart: {
    gap: 24,
    paddingTop: 2,
  },
  brandWrap: {
    minHeight: 184,
  },
  bannerUpload: {
    height: 132,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerLabel: {
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '500',
  },
  editBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    position: 'absolute',
    left: 18,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
  },
  logoCluster: {
    width: 73,
    height: 73,
  },
  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  plusBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLabel: {
    lineHeight: 18,
    paddingBottom: 7,
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '500',
  },
  optionalPill: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  optionalText: {
    lineHeight: 13,
    fontFamily: Typography.micro.fontFamily,
    fontWeight: '500',
  },
  header: {
    gap: 13,
  },
  welcomeTitle: {
    lineHeight: 38,
  },
  subtitleLeft: {
    fontSize: 15,
    lineHeight: 24,
  },
  taskStack: {
    gap: 18,
  },
  taskCard: {
    minHeight: 94,
    borderRadius: 14,
    borderWidth: 1.25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 20,
  },
  taskIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
    gap: 5,
  },
  taskTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Typography.screenTitle.fontFamily,
  },
  taskSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  taskAction: {
    width: 34,
    alignItems: 'center',
  },
  warningBox: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  warningText: {
    flex: 1,
    lineHeight: 17,
  },
  formPart: {
    paddingTop: 2,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginLeft: 10,
    marginBottom: 20,
  },
  stepBadgeText: {
    fontSize: 15,
    lineHeight: 18,
    fontFamily: Typography.screenTitle.fontFamily,
  },
  formHeader: {
    gap: 18,
    marginBottom: 25,
  },
  formTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: FontFamily.medium,
  },
  formSubtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  formFields: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldColumn: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily: FontFamily.medium,
  },
  formInput: {
    minHeight: 77,
    borderRadius: 20,
    borderWidth: 1.4,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.body.fontFamily,
  },
  readonlyField: {
    minHeight: 77,
    borderRadius: 20,
    borderWidth: 1.4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readonlyText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.body.fontFamily,
  },
  inputWrap: {
    minHeight: 77,
    borderRadius: 20,
    borderWidth: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 0,
    fontFamily: Typography.body.fontFamily,
  },
  locationCard: {
    height: 116,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    marginBottom: 10,
  },
  locationMiniCard: {
    minHeight: 77,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: FontFamily.medium,
  },
  photoSheetTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  photoSheetOptions: {
    gap: 12,
  },
  photoSheetOption: {
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  photoSheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSheetLabel: {
    flex: 1,
  },
  donePart: {
    flex: 1,
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  doneIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    textAlign: 'center',
    lineHeight: 36,
  },
  doneSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingTop: 10,
  },
});
