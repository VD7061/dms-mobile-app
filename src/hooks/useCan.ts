import { canRole, type PermissionKey } from '@/permissions/permissions';
import { selectActiveRole, useSessionStore } from '@/store';

export function useCan(permission: PermissionKey) {
  const activeRole = useSessionStore(selectActiveRole);

  return canRole(activeRole, permission);
}
