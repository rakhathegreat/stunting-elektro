import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from './auth-context';
import { supabase } from '../../lib/supabase/client';

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session ?? null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signOut = async () => {
    const { data } = await supabase.auth.getSession();

    // If the session is already gone locally, ensure storage is cleared and exit early.
    if (!data.session) {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
      setSession(null);
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      const message = error.message?.toLowerCase() ?? '';
      if (error.status === 403 || message.includes('session not found') || message.includes('auth session missing')) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
        setSession(null);
        return;
      }

      console.error('Gagal melakukan sign out:', error);
      return;
    }

    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signOut,
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
