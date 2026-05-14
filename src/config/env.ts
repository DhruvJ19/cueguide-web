const viteEnv: Partial<ImportMetaEnv> = import.meta.env || {};

function readEnvValue(value: string | undefined): string {
  return value?.trim() || '';
}

export const config = {
  supabase: {
    url: readEnvValue(viteEnv.VITE_SUPABASE_URL) || 'https://mock-supabase-url.supabase.co',
    anonKey: readEnvValue(viteEnv.VITE_SUPABASE_ANON_KEY) || 'mock-anon-key',
  },
  elevenlabs: {
    enabled: readEnvValue(viteEnv.VITE_USE_ELEVENLABS) === 'true',
  },
  vapid: {
    publicKey: readEnvValue(viteEnv.VITE_VAPID_PUBLIC_KEY),
  }
};
