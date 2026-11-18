import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'focora_local_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      // Local fallback auth
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // Default demo user matching Figma design
          const defaultUser: AuthUser = {
            id: 'demo-user',
            email: 'elena.vance@example.com',
            name: 'Elena Vance',
          };
          setUser(defaultUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
        }
      } else {
        // Default to Elena Vance from Figma design for seamless immediate preview
        const defaultUser: AuthUser = {
          id: 'demo-user',
          email: 'elena.vance@example.com',
          name: 'Elena Vance',
        };
        setUser(defaultUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
      }
      setLoading(false);
      return;
    }

    // Real Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      const authUser: AuthUser = {
        id: 'user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
        email,
        name: email.split('@')[0],
      };
      setUser(authUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!isConfigured) {
      const authUser: AuthUser = {
        id: 'user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
        email,
        name: name || email.split('@')[0],
      };
      setUser(authUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (!isConfigured) {
      localStorage.removeItem(LOCAL_USER_KEY);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const signInAsDemo = () => {
    const defaultUser: AuthUser = {
      id: 'demo-user',
      email: 'elena.vance@example.com',
      name: 'Elena Vance',
    };
    setUser(defaultUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        signInAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
