import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type {IncomingMessage, ServerResponse} from 'node:http';
import https from 'node:https';

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MAX_TTS_CHARS = 700;
const MAX_AI_PROMPT_CHARS = 8_000;

function readRequestBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 10_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function isValidVoiceId(voiceId: unknown): voiceId is string {
  return typeof voiceId === 'string' && /^[A-Za-z0-9_-]{10,80}$/.test(voiceId);
}

function isValidText(text: unknown): text is string {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= MAX_TTS_CHARS;
}

function readEnvValue(value: string | undefined): string {
  return value?.trim() || '';
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
}): Promise<{ status: number; ok: boolean; contentType: string; body: Buffer }> {
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
            contentType: String(response.headers['content-type'] || 'application/json'),
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

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cueguide-elevenlabs-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/elevenlabs/voices', async (req, res) => {
            if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
            const apiKey = readEnvValue(env.ELEVENLABS_API_KEY);
            if (!apiKey) return sendJson(res, 503, { error: 'ElevenLabs is not configured' });

            try {
              const response = await fetch(`${ELEVENLABS_BASE}/voices`, {
                headers: { 'xi-api-key': apiKey },
              });
              res.statusCode = response.status;
              res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json');
              res.end(response.ok ? JSON.stringify(await response.json()) : JSON.stringify({ error: 'ElevenLabs request failed' }));
            } catch {
              sendJson(res, 502, { error: 'ElevenLabs request failed' });
            }
          });

          server.middlewares.use('/api/elevenlabs/tts', async (req, res) => {
            if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
            const apiKey = readEnvValue(env.ELEVENLABS_API_KEY);
            if (!apiKey) return sendJson(res, 503, { error: 'ElevenLabs is not configured' });

            try {
              const body = await readRequestBody(req);
              const text = body.text;
              const voiceId = body.voiceId;
              if (!isValidText(text) || !isValidVoiceId(voiceId)) {
                return sendJson(res, 400, { error: 'Invalid text or voice' });
              }

              const payload = JSON.stringify({
                text: text.trim(),
                model_id: readEnvValue(env.ELEVENLABS_MODEL_ID) || 'eleven_flash_v2_5',
                voice_settings: body.voice_settings,
              });
              const response = await postElevenLabsTts({
                apiKey,
                voiceId,
                localAddress: readEnvValue(env.ELEVENLABS_LOCAL_ADDRESS),
                payload,
              });

              res.statusCode = response.status;
              res.setHeader('Content-Type', response.contentType);
              res.setHeader('Cache-Control', 'no-store');
              res.end(response.ok ? response.body : JSON.stringify({ error: 'ElevenLabs request failed' }));
            } catch {
              sendJson(res, 502, { error: 'ElevenLabs request failed' });
            }
          });

          server.middlewares.use('/api/ai/cue', async (req, res) => {
            if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
            if (!env.OPENROUTER_API_KEY) return sendJson(res, 503, { error: 'AI generation is not configured' });

            try {
              const body = await readRequestBody(req);
              const prompt = typeof body.prompt === 'string' ? body.prompt : '';
              const model = typeof body.model === 'string' ? body.model : 'openai/gpt-4o';
              if (!prompt.trim() || prompt.length > MAX_AI_PROMPT_CHARS) {
                return sendJson(res, 400, { error: 'Invalid prompt' });
              }

              const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': 'https://cueguide.app',
                  'X-Title': 'CueGuide',
                },
                body: JSON.stringify({
                  model,
                  messages: [{ role: 'user', content: prompt.trim() }],
                  temperature: 0.45,
                }),
              });

              if (!response.ok) return sendJson(res, response.status, { error: 'AI request failed' });
              const data = await response.json();
              sendJson(res, 200, { text: data.choices?.[0]?.message?.content || '' });
            } catch {
              sendJson(res, 502, { error: 'AI request failed' });
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
