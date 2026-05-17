const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4o';
const MAX_PROMPT_CHARS = 8_000;
const ALLOWED_MODELS = new Set(['openai/gpt-4o', 'openai/gpt-4o-mini']);

function getApiKey(): string {
  return process.env.OPENROUTER_API_KEY?.trim() || '';
}

function readBody(body: unknown): Record<string, unknown> {
  if (typeof body !== 'string') return body && typeof body === 'object' ? body as Record<string, unknown> : {};
  try {
    return JSON.parse(body || '{}');
  } catch {
    return {};
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'AI generation is not configured' });
  }

  const body = readBody(req.body);
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const requestedModel = typeof body.model === 'string' ? body.model : DEFAULT_MODEL;
  const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
  if (!prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

  if (!response.ok) {
    return res.status(response.status).json({ error: 'AI request failed' });
  }

  const data = await response.json();
  return res.status(200).json({ text: data.choices?.[0]?.message?.content || '' });
}
