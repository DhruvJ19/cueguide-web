const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us';

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

function isValidVoiceId(voiceId: unknown): voiceId is string {
  return typeof voiceId === 'string' && /^[A-Za-z0-9_-]{10,80}$/.test(voiceId);
}

function getApiKey(): string {
  return readEnvValue(process.env.ELEVENLABS_API_KEY);
}

function getDefaultVoiceId(): string {
  const configuredVoiceId = readEnvValue(process.env.ELEVENLABS_VOICE_ID);
  return isValidVoiceId(configuredVoiceId) ? configuredVoiceId : DEFAULT_VOICE_ID;
}

async function readSafeElevenLabsError(response: Response): Promise<{
  code: string;
  message: string;
  status: string;
}> {
  const fallback = {
    code: 'elevenlabs_request_failed',
    message: 'ElevenLabs request failed',
    status: 'failed',
  };

  try {
    const parsed = await response.json();
    const detail = parsed?.detail && typeof parsed.detail === 'object' ? parsed.detail : parsed;
    const code = typeof detail?.code === 'string' ? detail.code : fallback.code;
    const message = typeof detail?.message === 'string' ? detail.message : fallback.message;
    const status = typeof detail?.status === 'string' ? detail.status : fallback.status;
    return { code, message, status };
  } catch {
    return fallback;
  }
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
    const error = await readSafeElevenLabsError(response);
    return res.status(response.status).json({
      error: error.message,
      code: error.code,
      status: error.status,
    });
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
