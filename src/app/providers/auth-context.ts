import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

type SignInParams = {
  email: string;
  password: string;
};

export interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
