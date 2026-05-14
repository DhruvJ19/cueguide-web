const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us';

function getApiKey(): string {
  return process.env.ELEVENLABS_API_KEY?.trim() || '';
}

function getDefaultVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'ElevenLabs is not configured' });
  }

  const response = await fetch(`${ELEVENLABS_BASE}/voices`, {
    headers: { 'xi-api-key': apiKey },
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'ElevenLabs request failed' });
  }

  const data = await response.json();
  const selectedVoiceId = getDefaultVoiceId();
  const voices = Array.isArray(data.voices) ? data.voices : [];

  res.setHeader('Cache-Control', 'private, max-age=300');
  return res.status(200).json({
    ...data,
    selectedVoiceId,
    selectedVoice: voices.find((voice: { voice_id?: string }) => voice.voice_id === selectedVoiceId) || null,
  });
}
