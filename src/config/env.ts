export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase-url.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  },
  elevenlabs: {
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  }
};
