// Public client configuration. These values are safe for a mobile client only when
// every exposed table has correctly tested Row Level Security policies.
// Environment variables override the initial project defaults for builds/CI.
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://wpbatgaaldbnlblroszk.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_0zhdPhPtuCeMObmBW0LcCw_CKJmOSTg';

export const isCloudConfigured = Boolean(
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20
);
