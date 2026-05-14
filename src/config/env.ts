const viteEnv: Partial<ImportMetaEnv> = import.meta.env || {};

export const config = {
  supabase: {
    url: viteEnv.VITE_SUPABASE_URL || 'https://mock-supabase-url.supabase.co',
    anonKey: viteEnv.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
  },
  elevenlabs: {
    enabled: viteEnv.VITE_USE_ELEVENLABS === 'true',
  },
  vapid: {
    publicKey: viteEnv.VITE_VAPID_PUBLIC_KEY || '',
    privateKey: viteEnv.VITE_VAPID_PRIVATE_KEY || '',
  }
};
