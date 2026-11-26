import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserProfileName } from '../types';
import { getSupabase, getSupabaseConfig } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Predefined profiles allowed to access
export const ALLOWED_USERS: Record<UserProfileName, { name: UserProfileName; emailHint: string; avatarColor: string; avatarBg: string; role: string }> = {
  Tejas: {
    name: 'Tejas',
    emailHint: 'tejas@personal.local (or your registered Supabase email)',
    avatarColor: 'text-emerald-700 dark:text-emerald-300',
    avatarBg: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800',
    role: 'Owner'
  }
};

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabaseUser: User | null;
  isSupabaseConnected: boolean;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string; needConfirmation?: boolean }>;
  loginAsDemo: (name: UserProfileName) => void;
  logout: () => Promise<void>;
  updateProfileName: (name: UserProfileName) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick check if there is an active session in local storage
const checkHasStoredSession = (): boolean => {
  try {
    if (localStorage.getItem('household_demo_user')) return true;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const val = localStorage.getItem(key);
        if (val && val.includes('access_token')) return true;
      }
    }
  } catch {
    return false;
  }
  return false;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const demoUser = localStorage.getItem('household_demo_user');
      if (demoUser === 'Tejas') {
        const meta = ALLOWED_USERS.Tejas;
        return {
          id: 'tejas',
          name: 'Tejas',
          email: 'tejas@personal.local',
          avatarBg: meta.avatarBg,
          avatarColor: meta.avatarColor,
          role: meta.role
        };
      }
    } catch {}
    return null;
  });
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { isConfigured } = getSupabaseConfig();
      if (isMounted) setIsSupabaseConnected(isConfigured);

      const supabase = getSupabase();
      if (isConfigured && supabase) {
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise<{ data: { session: null }; error: null }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null }, error: null }), 1500)
          );

          const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
          if (!isMounted) return;

          if (session?.user) {
            setSupabaseUser(session.user);
            resolveUserProfile(session.user);
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              setSupabaseUser(session.user);
              setTimeout(() => {
                if (isMounted) resolveUserProfile(session.user);
              }, 0);
            } else {
              setSupabaseUser(null);
              const demoUser = localStorage.getItem('household_demo_user');
              if (demoUser === 'Tejas') {
                setCurrentUser(createProfileObject('Tejas', 'tejas@personal.local'));
              } else {
                setCurrentUser(null);
              }
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Supabase auth init error:', err);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const createProfileObject = (_name: UserProfileName = 'Tejas', email: string): UserProfile => {
    const meta = ALLOWED_USERS.Tejas;
    return {
      id: 'tejas',
      name: 'Tejas',
      email,
      avatarBg: meta.avatarBg,
      avatarColor: meta.avatarColor,
      role: meta.role
    };
  };

  const resolveUserProfile = async (user: User) => {
    const detectedName: UserProfileName = 'Tejas';

    // Query or upsert to Supabase profiles table with 1.5s timeout protection
    const supabase = getSupabase();
    if (supabase) {
      try {
        const fetchProfile = supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();

        const timeout = new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 1500)
        );

        const { data: profile } = await Promise.race([fetchProfile, timeout]);

        if (!profile?.name) {
          // If no row in profiles, automatically insert it for this authenticated user (fire-and-forget)
          Promise.resolve(supabase.from('profiles').upsert({
            id: user.id,
            email: user.email || '',
            name: detectedName
          })).catch(() => {});
        }
      } catch (e) {
        console.warn('Could not query/upsert profiles table:', e);
      }
    }

    setCurrentUser(createProfileObject(detectedName, user.email || ''));
  };

  const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase URL and API Key are not configured yet. Click the gear icon at the top right to configure your connection.'
      };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const authPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Please check your network and try again.')), 8000)
      );

      const { data, error } = await Promise.race([authPromise, timeoutPromise]);

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email not confirmed yet. Please verify your email or confirm it in your Supabase Dashboard.'
          };
        }
        if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
          return {
            success: false,
            error: 'Invalid login credentials. Please verify your email address and password.'
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        setSupabaseUser(data.user);
        await resolveUserProfile(data.user);
        localStorage.removeItem('household_demo_user');
        return { success: true };
      }

      return { success: false, error: 'User account not found.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const signUpWithSupabase = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; needConfirmation?: boolean }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Database connection not initialized.' };
    }

    try {
      const emailTrim = email.trim();
      const detectedName: UserProfileName = 'Tejas';

      const authPromise = supabase.auth.signUp({
        email: emailTrim,
        password: password,
        options: {
          data: { name: detectedName }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Sign up timed out. Please check your network and try again.')), 5000)
      );

      const { data, error } = await Promise.race([authPromise, timeoutPromise]);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session?.user) {
        setSupabaseUser(data.session.user);
        await resolveUserProfile(data.session.user);
        localStorage.removeItem('household_demo_user');
        return { success: true };
      }

      // If user created but email confirmation is required by Supabase, allow instant access
      loginAsDemo(detectedName);
      return {
        success: true,
        needConfirmation: true
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Sign up failed.' };
    }
  };

  const loginAsDemo = (name: UserProfileName = 'Tejas') => {
    localStorage.setItem('household_demo_user', name);
    setCurrentUser(createProfileObject(name, `${name.toLowerCase()}@personal.local`));
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem('household_demo_user');
    setSupabaseUser(null);
    setCurrentUser(null);
  };

  const updateProfileName = (name: UserProfileName) => {
    if (currentUser) {
      const updated = createProfileObject(name, currentUser.email);
      setCurrentUser(updated);
      localStorage.setItem('household_demo_user', name);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        supabaseUser,
        isSupabaseConnected,
        loginWithSupabase,
        signUpWithSupabase,
        loginAsDemo,
        logout,
        updateProfileName
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
