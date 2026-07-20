import { selectActiveShowroom, useSessionStore } from '@/store';

export function useActiveShowroom() {
  return useSessionStore(selectActiveShowroom);
}
