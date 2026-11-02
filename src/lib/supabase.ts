import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'household_supabase_url';
const STORAGE_KEY_KEY = 'household_supabase_anon_key';

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = localUrl || envUrl || '';
  const anonKey = localKey || envKey || '';

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http'))
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  // Reinitialize client
  initSupabaseClient();
};

let supabaseInstance: SupabaseClient | null = null;

export const initSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
      return null;
    }
  }
  supabaseInstance = null;
  return null;
};

// Initialize on module load
initSupabaseClient();

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
};
