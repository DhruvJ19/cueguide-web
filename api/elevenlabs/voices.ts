const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

function getApiKey(): string {
  return process.env.ELEVENLABS_API_KEY || '';
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

  res.setHeader('Cache-Control', 'private, max-age=300');
  return res.status(200).json(await response.json());
}
