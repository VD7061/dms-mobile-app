import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

type FetchFunction = () => Promise<void>;

type UseTabDataFetchOptions = {
  onFocus: FetchFunction;
  dependencies?: React.DependencyList;
};

export function useTabDataFetch({ onFocus, dependencies = [] }: UseTabDataFetchOptions) {
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setIsLoading(true);
        try {
          await onFocus();
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }

      load();

      return () => {
        cancelled = true;
      };
    }, dependencies)
  );

  return { isLoading, setIsLoading };
}
