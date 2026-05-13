import https from 'node:https';

const DEFAULT_MODEL = process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_flash_v2_5';
const MAX_TTS_CHARS = 700;

function getApiKey(): string {
  return process.env.ELEVENLABS_API_KEY?.trim() || '';
}

function getLocalAddress(): string {
  return process.env.ELEVENLABS_LOCAL_ADDRESS?.trim() || '';
}

function isValidVoiceId(voiceId: unknown): voiceId is string {
  return typeof voiceId === 'string' && /^[A-Za-z0-9_-]{10,80}$/.test(voiceId);
}

function isValidText(text: unknown): text is string {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= MAX_TTS_CHARS;
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
}): Promise<{ status: number; ok: boolean; audio: Buffer }> {
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
            audio: Buffer.concat(chunks),
          });
        });
      },
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
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

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { text, voiceId, voice_settings } = body;

  if (!isValidText(text) || !isValidVoiceId(voiceId)) {
    return res.status(400).json({ error: 'Invalid text or voice' });
  }

  const payload = JSON.stringify({
    text: text.trim(),
    model_id: DEFAULT_MODEL,
    voice_settings,
  });
  const response = await postElevenLabsTts({
    apiKey,
    voiceId,
    localAddress: getLocalAddress(),
    payload,
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'ElevenLabs request failed' });
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(response.audio);
}
