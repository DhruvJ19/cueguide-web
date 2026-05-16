import https from 'node:https';

const DEFAULT_MODEL = 'eleven_flash_v2_5';
const DEFAULT_VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us';
const MAX_TTS_CHARS = 700;

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

function getApiKey(): string {
  return readEnvValue(process.env.ELEVENLABS_API_KEY);
}

function getLocalAddress(): string {
  return readEnvValue(process.env.ELEVENLABS_LOCAL_ADDRESS);
}

function getDefaultVoiceId(): string {
  const configuredVoiceId = readEnvValue(process.env.ELEVENLABS_VOICE_ID);
  return isValidVoiceId(configuredVoiceId) ? configuredVoiceId : DEFAULT_VOICE_ID;
}

function getModelId(): string {
  return readEnvValue(process.env.ELEVENLABS_MODEL_ID) || DEFAULT_MODEL;
}

function shouldForwardVoiceSettings(): boolean {
  return readEnvValue(process.env.ELEVENLABS_ENABLE_VOICE_SETTINGS) === 'true';
}

function isValidVoiceId(voiceId: unknown): voiceId is string {
  return typeof voiceId === 'string' && /^[A-Za-z0-9_-]{10,80}$/.test(voiceId);
}

function isValidText(text: unknown): text is string {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= MAX_TTS_CHARS;
}

function readBody(body: unknown): Record<string, unknown> {
  if (typeof body !== 'string') return body && typeof body === 'object' ? body as Record<string, unknown> : {};
  try {
    return JSON.parse(body || '{}');
  } catch {
    return {};
  }
}

function buildTtsPayload({
  text,
  voiceSettings,
}: {
  text: string;
  voiceSettings: unknown;
}): string {
  const payload: {
    text: string;
    model_id: string;
    voice_settings?: unknown;
  } = {
    text: text.trim(),
    model_id: getModelId(),
  };

  if (shouldForwardVoiceSettings() && voiceSettings && typeof voiceSettings === 'object') {
    payload.voice_settings = voiceSettings;
  }

  return JSON.stringify(payload);
}

interface ElevenLabsTtsResponse {
  status: number;
  ok: boolean;
  body: Buffer;
}

function extractSafeElevenLabsError(body: Buffer): {
  code: string;
  message: string;
  status: string;
} {
  const fallback = {
    code: 'elevenlabs_request_failed',
    message: 'ElevenLabs request failed',
    status: 'failed',
  };

  try {
    const parsed = JSON.parse(body.toString('utf8'));
    const detail = parsed?.detail && typeof parsed.detail === 'object' ? parsed.detail : parsed;
    const code = typeof detail?.code === 'string' ? detail.code : fallback.code;
    const message = typeof detail?.message === 'string' ? detail.message : fallback.message;
    const status = typeof detail?.status === 'string' ? detail.status : fallback.status;
    return { code, message, status };
  } catch {
    return fallback;
  }
}

function postElevenLabsTts({
  apiKey,
  voiceId,
  localAddress,
  payload,
}: {
  apiKey: string;
  voiceId: string;
  localAddress: string;
  payload: string;
}): Promise<ElevenLabsTtsResponse> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/${voiceId}/stream`,
        method: 'POST',
        localAddress: localAddress || undefined,
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'xi-api-key': apiKey,
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => {
          const status = response.statusCode || 500;
          resolve({
            status,
            ok: status >= 200 && status < 300,
            body: Buffer.concat(chunks),
          });
        });
      },
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function postElevenLabsTtsWithNetworkFallback({
  apiKey,
  voiceId,
  localAddress,
  payload,
}: {
  apiKey: string;
  voiceId: string;
  localAddress: string;
  payload: string;
}): Promise<ElevenLabsTtsResponse> {
  try {
    return await postElevenLabsTts({ apiKey, voiceId, localAddress, payload });
  } catch (error) {
    if (!localAddress) throw error;
    console.warn('ElevenLabs TTS failed with configured local address; retrying without local address.');
    return postElevenLabsTts({ apiKey, voiceId, localAddress: '', payload });
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'ElevenLabs is not configured' });
  }

  const body = readBody(req.body);
  const { text, voiceId, voice_settings } = body;

  if (!isValidText(text) || (voiceId !== undefined && !isValidVoiceId(voiceId))) {
    return res.status(400).json({ error: 'Invalid text or voice' });
  }
  const selectedVoiceId = isValidVoiceId(voiceId) ? voiceId : getDefaultVoiceId();

  const payload = buildTtsPayload({ text, voiceSettings: voice_settings });
  const response = await postElevenLabsTtsWithNetworkFallback({
    apiKey,
    voiceId: selectedVoiceId,
    localAddress: getLocalAddress(),
    payload,
  });

  if (!response.ok) {
    const error = extractSafeElevenLabsError(response.body);
    return res.status(response.status).json({
      error: error.message,
      code: error.code,
      status: error.status,
    });
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(response.body);
}
