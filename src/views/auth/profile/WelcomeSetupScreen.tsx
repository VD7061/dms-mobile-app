import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { Grid, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type SetupStep = 'welcome' | 'showroom' | 'vehicle' | 'done';

const tabs = [
  'Welcome',
  'Showroom',
  'Vehicle',
  'Done',
] as const;

export function WelcomeSetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const fullName = useAuthStore((s) => s.fullName);
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const [step, setStep] = useState<SetupStep>('welcome');
  const [showroomComplete, setShowroomComplete] = useState(false);
  const [vehicleComplete, setVehicleComplete] = useState(false);
  const [showroomName, setShowroomName] = useState('AutoDeals Guwahati');
  const [locationPinned, setLocationPinned] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const activeTab = showroomComplete && step === 'welcome' ? 'Welcome' : tabForStep(step);

  const canContinue = useMemo(() => {
    if (step === 'showroom') {
      return showroomName.trim().length > 1;
    }

    if (step === 'vehicle') {
      return vehicleNumber.trim().length > 2;
    }

    return true;
  }, [showroomName, step, vehicleNumber]);

  const handlePrimaryAction = () => {
    if (step === 'welcome' && !showroomComplete) {
      setStep('showroom');
      return;
    }

    if (step === 'welcome' && showroomComplete) {
      setStep('vehicle');
      return;
    }

    if (step === 'showroom') {
      setShowroomComplete(true);
      setStep('welcome');
      return;
    }

    if (step === 'vehicle') {
      setVehicleComplete(true);
      setStep('done');
      return;
    }

    completeProfile(fullName);
    router.replace('/(app)');
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <StepTabs activeTab={activeTab} showroomComplete={showroomComplete} vehicleComplete={vehicleComplete} />

          <ScrollView
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
                contactNumber={contactNumber}
                locationPinned={locationPinned}
                onShowroomNameChange={setShowroomName}
                onContactNumberChange={setContactNumber}
                onLocationPress={() => setLocationPinned(true)}
              />
            ) : null}

            {step === 'vehicle' ? (
              <VehiclePart vehicleNumber={vehicleNumber} onVehicleNumberChange={setVehicleNumber} />
            ) : null}

            {step === 'done' ? (
              <DonePart showroomName={showroomName} vehicleNumber={vehicleNumber} />
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label={buttonLabel(step)}
              onPress={handlePrimaryAction}
              disabled={!canContinue}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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

function buttonLabel(step: SetupStep) {
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
      <View style={styles.progressTrack}>
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
                  fontFamily: active ? Typography.screenTitle.fontFamily : Typography.micro.fontFamily,
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
      <BrandUpload />

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

function BrandUpload() {
  const { colors } = useTheme();

  return (
    <View style={styles.brandWrap}>
      <View
        style={[
          styles.bannerUpload,
          {
            backgroundColor: colors['surface-container'],
            borderColor: colors.outline,
          },
        ]}>
        <Ionicons name="image-outline" size={34} color={colors.primary} />
        <Text style={[Typography.caption, styles.bannerLabel, { color: colors.primary }]}>
          Add a banner image
        </Text>
        <View style={[styles.editBadge, { backgroundColor: colors.background }]}>
          <Ionicons name="pencil" size={17} color={colors.primary} />
        </View>
      </View>

      <View style={styles.logoRow}>
        <View style={styles.logoCluster}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors['surface-container-low'],
                borderColor: colors.background,
              },
            ]}>
            <Ionicons name="storefront-outline" size={32} color={colors.primary} />
          </View>
          <View style={[styles.plusBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={18} color={colors['on-primary']} />
          </View>
        </View>
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
  contactNumber,
  locationPinned,
  onShowroomNameChange,
  onContactNumberChange,
  onLocationPress,
}: {
  showroomName: string;
  contactNumber: string;
  locationPinned: boolean;
  onShowroomNameChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onLocationPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.formPart}>
      <View style={styles.stepBadge}>
        <Text style={[Typography.screenTitle, styles.stepBadgeText, { color: colors.primary }]}>
          Step 2 of 3
        </Text>
      </View>

      <View style={styles.formHeader}>
        <Text style={[Typography.hero2, styles.formTitle, { color: colors['on-background'] }]}>
          Add your{'\n'}showroom
        </Text>
        <Text style={[Typography.body, styles.formSubtitle, { color: colors['on-surface'] }]}>
          Tell us about your dealership{'\n'}location
        </Text>
      </View>

      <View style={styles.formFields}>
        <FieldLabel label="Showroom name" />
        <IconTextInput
          icon="storefront-outline"
          value={showroomName}
          onChangeText={onShowroomNameChange}
          placeholder="AutoDeals Guwahati"
        />

        <FieldLabel label="Location" />
        <Pressable
          onPress={onLocationPress}
          style={[
            styles.locationCard,
            {
              backgroundColor: colors['surface-container'],
            },
          ]}>
          <Ionicons name="location" size={34} color={colors.primary} />
          <Text style={[Typography.caption, styles.locationText, { color: colors.primary }]}>
            {locationPinned ? 'Location pinned' : 'Tap to pin location'}
          </Text>
        </Pressable>

        <FieldLabel label="Contact number" />
        <IconTextInput
          icon="call-outline"
          value={contactNumber}
          onChangeText={onContactNumberChange}
          placeholder="+91 XXXXX XXXXX"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}

function VehiclePart({
  vehicleNumber,
  onVehicleNumberChange,
}: {
  vehicleNumber: string;
  onVehicleNumberChange: (value: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.formPart}>
      <View style={styles.stepBadge}>
        <Text style={[Typography.screenTitle, styles.stepBadgeText, { color: colors.primary }]}>
          Step 3 of 3
        </Text>
      </View>

      <View style={styles.formHeader}>
        <Text style={[Typography.hero2, styles.formTitle, { color: colors['on-background'] }]}>
          Add your first{'\n'}vehicle
        </Text>
        <Text style={[Typography.body, styles.formSubtitle, { color: colors['on-surface'] }]}>
          Register a vehicle with its number plate.
        </Text>
      </View>

      <View style={styles.formFields}>
        <FieldLabel label="Vehicle number" />
        <IconTextInput
          icon="car-sport-outline"
          value={vehicleNumber}
          onChangeText={onVehicleNumberChange}
          placeholder="AS 01 AB 1234"
          autoCapitalize="characters"
        />
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
  },
  tabsWrap: {
    paddingTop: 6,
    gap: 13,
  },
  progressTrack: {
    height: 8,
    borderRadius: 20,
    backgroundColor: '#DCEBFF',
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
    fontSize: 11,
    lineHeight: 14,
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
    alignItems: 'flex-start',
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
    borderRadius: 18,
    backgroundColor: '#DEE7FF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginLeft: 10,
    marginBottom: 24,
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
    fontSize: 30,
    lineHeight: 36,
  },
  formSubtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  formFields: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Typography.screenTitle.fontFamily,
    marginTop: 5,
  },
  inputWrap: {
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1.25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
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
  locationText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '500',
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
