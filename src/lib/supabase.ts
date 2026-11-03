import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'household_supabase_url';
const STORAGE_KEY_KEY = 'household_supabase_anon_key';

// Pre-configured default Supabase cloud database for Tejas & Hetvi household
const DEFAULT_SUPABASE_URL = 'https://zuctnfowdpndgumumrnx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1Y3RuZm93ZHBuZGd1bXVtcm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjYxNzEsImV4cCI6MjEwNjAwMjE3MX0.SAAVDWVf9pgLdFLrQOgoF6AueQRMS8bMwJeUXTpz8SA';

/**
 * Normalizes user input into a valid Supabase project URL (https://xyz.supabase.co)
 */
export function cleanSupabaseUrl(input: string): string {
  if (!input) return DEFAULT_SUPABASE_URL;
  let val = input.trim();
  
  // If user pasted dashboard URL like https://supabase.com/dashboard/project/abcdefghijk/...
  const dashMatch = val.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashMatch && dashMatch[1]) {
    return `https://${dashMatch[1]}.supabase.co`;
  }

  // Ensure https protocol
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    val = 'https://' + val;
  }

  // Remove trailing slashes and any subpaths like /rest/v1
  val = val.replace(/\/+$/, '');
  val = val.replace(/\/(rest|auth)\/v1.*$/i, '');

  return val;
}

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  const rawUrl = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const url = cleanSupabaseUrl(rawUrl);
  const anonKey = (localKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http'))
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  const cleanedUrl = cleanSupabaseUrl(url);
  const cleanedKey = (anonKey || '').trim();

  if (cleanedUrl) localStorage.setItem(STORAGE_KEY_URL, cleanedUrl);
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (cleanedKey) localStorage.setItem(STORAGE_KEY_KEY, cleanedKey);
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
          // Bypass browser Web Locks API to prevent mobile browser / Safari deadlocks
          lock: async (_name, _acquireTimeout, fn) => {
            return await fn();
          }
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
