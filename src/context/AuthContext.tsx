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
    const initAuth = async () => {
      setIsLoading(true);
      const { isConfigured } = getSupabaseConfig();
      setIsSupabaseConnected(isConfigured);

      const supabase = getSupabase();
      if (isConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setSupabaseUser(session.user);
            resolveUserProfile(session.user);
          } else {
            // Check local preview session if any
            checkLocalSession();
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setSupabaseUser(session.user);
              resolveUserProfile(session.user);
            } else {
              setSupabaseUser(null);
              // don't clear demo if in demo mode
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
          checkLocalSession();
        }
      } else {
        checkLocalSession();
      }
      setIsLoading(false);
    };

    const checkLocalSession = () => {
      const demoUser = localStorage.getItem('household_demo_user');
      if (demoUser && (demoUser === 'Tejas' || demoUser === 'Hetvi')) {
        setCurrentUser(createProfileObject(demoUser as UserProfileName, 'demo@household.local'));
      }
      setIsLoading(false);
    };

    initAuth();
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

    // Check metadata or email
    const metaName = user.user_metadata?.name;
    if (metaName === 'Tejas' || metaName === 'Hetvi') {
      detectedName = metaName;
    } else if (emailLower.includes('hetvi') || emailLower.includes('honey')) {
      detectedName = 'Hetvi';
    } else {
      detectedName = 'Tejas';
    }

    setCurrentUser(createProfileObject(detectedName, user.email || ''));
  };

  const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase credentials not configured yet. Please configure in settings or test using Quick Access.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
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
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
    localStorage.removeItem('household_demo_user');
    setSupabaseUser(null);
    setCurrentUser(null);
  };

  const updateProfileName = (name: UserProfileName) => {
    if (currentUser) {
      setCurrentUser(createProfileObject(name, currentUser.email));
      if (!supabaseUser) {
        localStorage.setItem('household_demo_user', name);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
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
