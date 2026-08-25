import { getProfile } from '@/services';
import { useAuthStore } from '@/store';

export type ShowroomRole = {
  showroom_id: number;
  showroom_name?: string | null;
  role?: string | null;
};

type ProfileData = {
  showroom_roles?: ShowroomRole[] | null;
};

/** The showroom a user acts on by default: the one they own, else the first they belong to. */
export function pickPrimaryShowroom(profile: ProfileData | null): ShowroomRole | null {
  const roles = profile?.showroom_roles ?? [];
  return roles.find((role) => role.role === 'owner') ?? roles[0] ?? null;
}

/**
 * Resolves the showroom id every showroom-scoped endpoint needs.
 *
 * Returns the cached id when the store already has one, otherwise fetches the
 * profile once and caches it, so screens do not each re-derive it.
 */
export async function resolvePrimaryShowroomId(): Promise<number | undefined> {
  const cached = useAuthStore.getState().primaryShowroomId;

  if (cached) {
    return cached;
  }

  const response = await getProfile();
  const profile =
    (response as unknown as { data?: ProfileData })?.data ??
    (response as unknown as ProfileData);
  const showroomId = pickPrimaryShowroom(profile ?? null)?.showroom_id;

  if (showroomId) {
    useAuthStore.getState().setPrimaryShowroomId(showroomId);
  }

  return showroomId;
}
