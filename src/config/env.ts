const viteEnv: Partial<ImportMetaEnv> = import.meta.env || {};

function readEnvValue(value: string | undefined): string {
  const trimmed = value?.trim() || '';
  const unquoted = (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  )
    ? trimmed.slice(1, -1)
    : trimmed;
  return unquoted.replace(/\\n/g, '').replace(/\r?\n/g, '').trim();
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
