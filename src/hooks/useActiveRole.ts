import { selectActiveRole, useSessionStore } from '@/store';

export function useActiveRole() {
  return useSessionStore(selectActiveRole);
}
