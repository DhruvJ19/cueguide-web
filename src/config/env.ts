export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase-url.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
  },
  elevenlabs: {
    enabled: import.meta.env.VITE_USE_ELEVENLABS === 'true',
  },
  vapid: {
    publicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
    privateKey: import.meta.env.VITE_VAPID_PRIVATE_KEY || '',
  }
};
