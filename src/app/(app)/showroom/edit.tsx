import { EditShowroomScreen } from '@/views/showroom/EditShowroomScreen';
import { PERMISSIONS, RequirePermission } from '@/permissions';

export default function EditShowroom() {
  return (
    <RequirePermission permission={PERMISSIONS.SHOWROOM_UPDATE}>
      <EditShowroomScreen />
    </RequirePermission>
  );
}
