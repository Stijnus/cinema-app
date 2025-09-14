import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export let supabase: SupabaseClient;

export function initSupabaseClient() {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'cinematicdb-session',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    },
    db: {
      schema: 'public',
    },
  });
}

export const clearAuthState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cinematicdb-session');
    localStorage.removeItem('sb-mxftvocmlcneaecgvknh-auth-token');
    localStorage.removeItem('sb-mxftvocmlcneaecgvknh-auth-token.expires_at');
  }
};

// Initialize the Supabase client
initSupabaseClient();
