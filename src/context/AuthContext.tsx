import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserProfileName } from '../types';
import { getSupabase, getSupabaseConfig } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Predefined profiles allowed to access
export const ALLOWED_USERS: Record<UserProfileName, { name: UserProfileName; emailHint: string; avatarColor: string; avatarBg: string; role: string }> = {
  Tejas: {
    name: 'Tejas',
    emailHint: 'tejas@household.local (or your registered Supabase email)',
    avatarColor: 'text-sky-700 dark:text-sky-300',
    avatarBg: 'bg-sky-100 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800',
    role: 'Co-Head of Household'
  },
  Hetvi: {
    name: 'Hetvi',
    emailHint: 'hetvi@household.local (or your registered Supabase email)',
    avatarColor: 'text-pink-700 dark:text-pink-300',
    avatarBg: 'bg-pink-100 dark:bg-pink-950/70 border-pink-300 dark:border-pink-800',
    role: 'Co-Head of Household'
  }
};

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabaseUser: User | null;
  isSupabaseConnected: boolean;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (name: UserProfileName) => void;
  logout: () => Promise<void>;
  updateProfileName: (name: UserProfileName) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkLocalSession = () => {
      const demoUser = localStorage.getItem('household_demo_user');
      if (demoUser && (demoUser === 'Tejas' || demoUser === 'Hetvi')) {
        setCurrentUser(createProfileObject(demoUser as UserProfileName, 'demo@household.local'));
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    const initAuth = async () => {
      const { isConfigured } = getSupabaseConfig();
      if (isMounted) setIsSupabaseConnected(isConfigured);

      const supabase = getSupabase();
      if (isConfigured && supabase) {
        try {
          // Timeout race ensures the app NEVER hangs on a blank loading screen
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise<{ data: { session: null }; error: null }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null }, error: null }), 2000)
          );

          const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
          if (!isMounted) return;

          if (session?.user) {
            setSupabaseUser(session.user);
            await resolveUserProfile(session.user);
          } else {
            checkLocalSession();
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              setSupabaseUser(session.user);
              // Run profile resolution asynchronously to avoid deadlocks
              setTimeout(() => {
                if (isMounted) resolveUserProfile(session.user);
              }, 0);
            } else {
              setSupabaseUser(null);
              const demoUser = localStorage.getItem('household_demo_user');
              if (demoUser && (demoUser === 'Tejas' || demoUser === 'Hetvi')) {
                setCurrentUser(createProfileObject(demoUser as UserProfileName, 'demo@household.local'));
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
          if (isMounted) checkLocalSession();
        }
      } else {
        if (isMounted) checkLocalSession();
      }
      if (isMounted) setIsLoading(false);
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const createProfileObject = (name: UserProfileName, email: string): UserProfile => {
    const meta = ALLOWED_USERS[name];
    return {
      id: name.toLowerCase(),
      name,
      email,
      avatarBg: meta.avatarBg,
      avatarColor: meta.avatarColor,
      role: meta.role
    };
  };

  const resolveUserProfile = async (user: User) => {
    const emailLower = (user.email || '').toLowerCase();
    let detectedName: UserProfileName = 'Tejas';

    // 1. Check metadata
    const metaName = user.user_metadata?.name;
    if (metaName === 'Tejas' || metaName === 'Hetvi') {
      detectedName = metaName;
    } else if (emailLower.includes('hetvi') || emailLower.includes('honey')) {
      detectedName = 'Hetvi';
    } else {
      detectedName = 'Tejas';
    }

    // 2. Query or upsert to Supabase profiles table with 1.5s timeout protection
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

        if (profile?.name && (profile.name === 'Tejas' || profile.name === 'Hetvi')) {
          detectedName = profile.name;
        } else {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email not confirmed yet. In your Supabase Dashboard -> Authentication -> Users, click your email and select "Confirm email", or disable "Confirm email" in Auth settings.'
          };
        }
        if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
          return {
            success: false,
            error: 'Invalid login credentials. Please verify your email and password. Note: The account must be created under Supabase Dashboard -> Authentication -> Users (not just in the database table).'
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

  const loginAsDemo = (name: UserProfileName) => {
    localStorage.setItem('household_demo_user', name);
    setCurrentUser(createProfileObject(name, `${name.toLowerCase()}@household.local`));
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
