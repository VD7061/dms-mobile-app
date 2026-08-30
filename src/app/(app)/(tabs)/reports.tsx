import { TabScreen } from '@/components/ui/TabScreen';
import { PERMISSIONS, RequirePermission } from '@/permissions';

export default function ReportsTab() {
  return (
    <RequirePermission permission={PERMISSIONS.REPORTS_READ}>
      <TabScreen title="Reports" subtitle="Track sales and expenses" />
    </RequirePermission>
  );
}
