import { useEffect, useState } from 'react';
import { getTokens } from '@/services';
import { useAuthStore } from '@/store';

export function useSession() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasTokens, setHasTokens] = useState(false);
  const setIsLoggedIn = useAuthStore((s) => s.setIsLoggedIn);
  const setCanEnterApp = useAuthStore((s) => s.setCanEnterApp);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const tokens = await getTokens();

      if (cancelled) {
        return;
      }

      const nextHasTokens = Boolean(tokens);
      setHasTokens(nextHasTokens);
      setIsLoggedIn(nextHasTokens);

      if (!nextHasTokens) {
        setCanEnterApp(false);
      }

      setIsLoading(false);
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [setCanEnterApp, setIsLoggedIn]);

  return { isLoading, hasTokens };
}
