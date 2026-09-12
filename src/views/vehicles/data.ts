import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type SelectOption = {
  value: string;
  label: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

// Confirmed against the API: ApiVehicle['vehicle_type'] is 'car' | 'bike' | 'scooty'.
export const vehicleTypeOptions: SelectOption[] = [
  { value: 'car', label: 'Car', icon: 'car-hatchback' },
  { value: 'bike', label: 'Bike', icon: 'motorbike' },
  { value: 'scooty', label: 'Scooty', icon: 'scooter' },
];

// NOT confirmed against the backend — the API docs only show one example value
// each ('petrol', 'manual'), not a full enum. If a save fails with an
// unrecognized value, add it here; every screen picks it up from this list.
export const fuelTypeOptions: SelectOption[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
];

export const transmissionTypeOptions: SelectOption[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

const CURRENT_YEAR = new Date().getFullYear();

// Descending so the most likely year (recent) is at the top of the sheet.
export const yearOfManufactureOptions: SelectOption[] = Array.from(
  { length: CURRENT_YEAR - 1980 + 2 },
  (_, index) => {
    const year = CURRENT_YEAR + 1 - index;
    return { value: String(year), label: String(year) };
  }
);
