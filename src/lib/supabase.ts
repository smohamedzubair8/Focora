import { createClient } from '@supabase/supabase-js';

// Default to live project credentials, with environment variable override if provided
const DEFAULT_SUPABASE_URL = 'https://lxdnejwluksrodnmavag.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_SaIvlN4C_fftAhRmczVNmA_kEcr_l5d';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
