import { useCallback, useEffect, useState } from 'react';
import { type RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Child } from '../types/children';
import { getPendingChildren } from '../services/childService';
import { supabase } from '../lib/supabase/client';

interface PendingChildState {
  pendingChild: Child | null;
  isWaiting: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CHANNEL_KEY = 'public:DataAnak';

export const usePendingChildRegistration = (): PendingChildState => {
  const [pendingChild, setPendingChild] = useState<Child | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const children = await getPendingChildren();
      const nextChild = children[0] ?? null;

      setPendingChild(nextChild);
      setIsWaiting(!nextChild);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pendaftaran anak');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const channel = supabase
      .channel(CHANNEL_KEY)
      .on<RealtimePostgresChangesPayload<Child>>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'DataAnak' },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return {
    pendingChild,
    isWaiting,
    isLoading,
    error,
    refresh,
  };
};

