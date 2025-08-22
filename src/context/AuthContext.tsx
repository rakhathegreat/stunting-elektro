import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  session: Session | null;
  signInUser: (params: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  /* 监听 Supabase 客户端恢复会话 */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, signInUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within AuthContextProvider');
  return ctx;
};