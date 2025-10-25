import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

const CACHE_TTL = 1000 * 60; // 1 minute

interface Options<T> {
  enabled?: boolean;
  initialData?: T;
}

interface ResourceState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: Dispatch<SetStateAction<T>>;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();

export const useSupabaseResource = <T>(key: string, fetcher: () => Promise<T>, options: Options<T> = {}): ResourceState<T> => {
  const { enabled = true, initialData } = options;
  const [data, setStateData] = useState<T>(initialData as T);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const setData: Dispatch<SetStateAction<T>> = useCallback((value) => {
    setStateData((previous) => {
      const nextValue =
        typeof value === 'function'
          ? (value as (prevState: T) => T)(previous)
          : value;

      cache.set(key, { data: nextValue, timestamp: Date.now() });
      return nextValue;
    });
  }, [key]);

  const load = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cached = cache.get(key);
      const now = Date.now();
      if (cached && now - cached.timestamp < CACHE_TTL) {
        setData(cached.data as T);
        setIsLoading(false);
        return;
      }

      const result = await fetcher();
      cache.set(key, { data: result, timestamp: now });

      if (mountedRef.current) {
        setData(result);
      } else {
        cache.set(key, { data: result, timestamp: now });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, fetcher, key]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      void load();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, load]);

  const refresh = useCallback(async () => {
    cache.delete(key);
    await load();
  }, [key, load]);

  return {
    data,
    isLoading,
    error,
    refresh,
    setData,
  };
};
