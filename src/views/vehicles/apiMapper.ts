import type { VehicleCategory, VehicleItem, VehicleStatus } from './types';

export type ApiVehicleStatus = 'garage' | 'inspection' | 'ready_for_sale' | 'sold';

export type ApiVehicleImage = {
  id: number;
  url: string;
};

/**
 * Images arrive grouped by section, e.g. `{ exterior: [...], interior: [...] }`,
 * and the key is simply absent when a vehicle has no photos in that section.
 */
export type ApiVehicleImages = Record<string, ApiVehicleImage[] | undefined>;

// Sections are tried in this order when picking the card/hero thumbnail.
const IMAGE_SECTION_PRIORITY = ['exterior', 'interior', 'engine', 'odometer'];

export type ApiVehicle = {
  id: number;
  vehicle_type: 'car' | 'bike' | 'scooty';
  manufacturer: string;
  model: string;
  variant?: string | null;
  color?: string | null;
  year_of_manufacture: number;
  rto_code?: string | null;
  registration_number: string;
  registration_state?: string | null;
  usage_km: number;
  fuel_type: string;
  transmission_type: string;
  current_status?: { status: ApiVehicleStatus; started_at?: string } | null;
  pricing?: {
    buying_price?: number;
    price_tag?: number;
    currency?: string;
    tagged_at?: string;
  } | null;
  images?: ApiVehicleImages | null;
};

export type ApiVehicleGroup = {
  total: number;
  page: number;
  limit: number;
  vehicles: ApiVehicle[];
};

export type ApiVehicleListing = {
  cars: ApiVehicleGroup;
  bikes: ApiVehicleGroup;
  scooties: ApiVehicleGroup;
};

export function categoryToApiGroupKey(category: VehicleCategory): keyof ApiVehicleListing {
  if (category === 'Bikes') {
    return 'bikes';
  }

  if (category === 'Scooty') {
    return 'scooties';
  }

  return 'cars';
}

function mapApiStatus(status?: ApiVehicleStatus | null): VehicleStatus {
  if (status === 'ready_for_sale') {
    return 'Available';
  }

  if (status === 'sold') {
    return 'Sold';
  }

  return 'In Repair';
}

function mapVehicleIcon(vehicleType: ApiVehicle['vehicle_type']): VehicleItem['icon'] {
  if (vehicleType === 'bike') {
    return 'motorbike';
  }

  if (vehicleType === 'scooty') {
    return 'scooter';
  }

  return 'car-hatchback';
}

function mapVehicleCategory(vehicleType: ApiVehicle['vehicle_type']): VehicleCategory {
  if (vehicleType === 'bike') {
    return 'Bikes';
  }

  if (vehicleType === 'scooty') {
    return 'Scooty';
  }

  return 'Cars';
}

function formatRupees(amount?: number | null) {
  if (amount === undefined || amount === null) {
    return '—';
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1).replace('.0', '')}L`;
  }

  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }

  return `₹${amount}`;
}

function formatUsageKm(km: number) {
  if (km >= 1000) {
    return `${Math.round(km / 1000)}K km`;
  }

  return `${km} km`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function daysSince(dateString?: string) {
  if (!dateString) {
    return null;
  }

  const diffMs = Date.now() - new Date(dateString).getTime();

  if (!Number.isFinite(diffMs)) {
    return null;
  }

  return Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0);
}

function formatNote(status: VehicleStatus, startedAt?: string) {
  const days = daysSince(startedAt);

  if (days === null) {
    return '';
  }

  if (status === 'Sold') {
    return `Sold ${days} days ago`;
  }

  if (status === 'Available') {
    return `${days} days in lot`;
  }

  return `In prep ${days} days`;
}

function collectImages(images?: ApiVehicleImages | null): ApiVehicleImage[] {
  if (!images) {
    return [];
  }

  const known = IMAGE_SECTION_PRIORITY.flatMap((section) => images[section] ?? []);
  const rest = Object.entries(images)
    .filter(([section]) => !IMAGE_SECTION_PRIORITY.includes(section))
    .flatMap(([, sectionImages]) => sectionImages ?? []);

  return [...known, ...rest].filter((image) => Boolean(image?.url));
}

export function mapApiVehicleToItem(vehicle: ApiVehicle): VehicleItem {
  const status = mapApiStatus(vehicle.current_status?.status);
  const buyingPrice = formatRupees(vehicle.pricing?.buying_price);
  const askingPrice = formatRupees(vehicle.pricing?.price_tag);
  const images = collectImages(vehicle.images);

  return {
    id: String(vehicle.id),
    name: `${vehicle.manufacturer} ${vehicle.model}`.trim(),
    category: mapVehicleCategory(vehicle.vehicle_type),
    registration: vehicle.registration_number,
    price: askingPrice,
    buyingPrice,
    askingPrice,
    status,
    meta: `${vehicle.year_of_manufacture} · ${formatUsageKm(vehicle.usage_km)} · ${capitalize(vehicle.fuel_type)}`,
    note: formatNote(status, vehicle.current_status?.started_at),
    icon: mapVehicleIcon(vehicle.vehicle_type),
    imageUrl: images[0]?.url,
    imageUrls: images.map((image) => image.url),
    photoCount: images.length,
    owner: '',
    color: vehicle.color ?? '',
    engineNumber: '',
    chassisNumber: '',
    transmission: capitalize(vehicle.transmission_type),
    insuranceValidTill: '',
    lotLocation: '',
    expenses: [],
    documents: [],
  };
}
