import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'household_supabase_url';
const STORAGE_KEY_KEY = 'household_supabase_anon_key';

// Pre-configured default Supabase cloud database for Tejas & Hetvi household
const DEFAULT_SUPABASE_URL = 'https://wtxicjsmzzhputdxsere.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0eGljanNtenpocHV0ZHhzZXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NjE0NTcsImV4cCI6MjEwOTIzNzQ1N30.vXF66IodkXm47czzas_pJdwBf9W-6iigztrJlIQimCc';

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
  // Proactively clear any stale/corrupted credentials and sessions from old Supabase project
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.includes('zuctnfowdpndgumumrnx') || k === STORAGE_KEY_URL || k === STORAGE_KEY_KEY)) {
        localStorage.removeItem(k);
      }
    }
  } catch {}

  // Always enforce verified production Supabase database credentials
  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    isConfigured: true
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
