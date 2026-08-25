import { useLocalSearchParams } from 'expo-router';
import { EditVehicleScreen } from '@/views/vehicles';

export default function EditVehicleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditVehicleScreen vehicleId={id} />;
}
