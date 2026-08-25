import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type VehicleFilter = 'All' | 'Cars' | 'Bikes' | 'Scooty';

// Mirrors the API's `current_status.status` vocabulary
// ('garage' | 'inspection' | 'ready_for_sale' | 'sold') so a vehicle sitting
// in the garage is not mislabelled as being repaired.
export type VehicleStatus = 'Available' | 'Sold' | 'In Garage' | 'Inspection';

export type VehicleCategory = Exclude<VehicleFilter, 'All'>;

export type VehicleStatusFilter = 'All' | VehicleStatus;

export type VehicleItem = {
  id: string;
  name: string;
  category: VehicleCategory;
  registration: string;
  price: string;
  buyingPrice: string;
  askingPrice: string;
  status: VehicleStatus;
  meta: string;
  note: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  /** Primary photo. Signed URL from the API — expires roughly an hour after it is issued. */
  imageUrl?: string;
  imageUrls?: string[];
  owner: string;
  color: string;
  engineNumber: string;
  chassisNumber: string;
  transmission: string;
  insuranceValidTill: string;
  lotLocation: string;
  photoCount?: number;
  expenses: VehicleExpense[];
  documents: VehicleDocument[];
};

export type VehicleExpense = {
  label: string;
  amount: string;
};

export type VehicleDocument = {
  label: string;
  status: 'complete' | 'missing';
};

export type VehicleCategoryTab = {
  label: string;
  value: VehicleCategory;
  count: number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export type VehicleStat = {
  value: string;
  label: string;
  tone: 'default' | 'success' | 'danger' | 'primary';
};
