import { PermissionGate, TabScreen } from '@/components/ui';

export default function TagsTab() {
  return (
    <PermissionGate permission="tags.manage">
      <TabScreen title="Tags" subtitle="Organize vehicle records" />
    </PermissionGate>
  );
}
