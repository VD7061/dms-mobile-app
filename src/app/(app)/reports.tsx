import { PermissionGate, TabScreen } from '@/components/ui';

export default function ReportsTab() {
  return (
    <PermissionGate permission="reports.view">
      <TabScreen title="Reports" subtitle="Track sales and expenses" />
    </PermissionGate>
  );
}
