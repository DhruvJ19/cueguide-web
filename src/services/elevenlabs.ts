import { config } from '../config/env';

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  preview_url: string;
  labels?: Record<string, string>;
}

const GENTLE_SETTINGS: VoiceSettings = {
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.3,
  use_speaker_boost: true,
};

const DEFAULT_SETTINGS: VoiceSettings = {
  stability: 0.4,
  similarity_boost: 0.8,
};

let cachedVoices: Voice[] | null = null;

export async function fetchVoices(): Promise<Voice[]> {
  if (cachedVoices) return cachedVoices;
  if (!config.elevenlabs.apiKey) return [];

  try {
    const res = await fetch(`${ELEVENLABS_BASE}/voices`, {
      headers: { 'xi-api-key': config.elevenlabs.apiKey },
    });
    if (!res.ok) return [];
    const data = await res.json();
    cachedVoices = data.voices || [];
    return cachedVoices;
  } catch {
    return [];
  }
}

export async function speakWithElevenLabs(
  text: string,
  voiceId: string,
  gentle: boolean = false,
  onEnd?: () => void,
): Promise<void> {
  if (!config.elevenlabs.apiKey) {
    console.warn('ElevenLabs API key not configured, falling back to browser TTS');
    speakWithBrowserTTS(text, gentle);
    return;
  }

  try {
    const response = await fetch(
      `${ELEVENLABS_BASE}/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabs.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: gentle ? GENTLE_SETTINGS : DEFAULT_SETTINGS,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.playbackRate = gentle ? 0.85 : 0.95;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      onEnd?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      speakWithBrowserTTS(text, gentle);
      onEnd?.();
    };
    await audio.play();
  } catch (error) {
    console.warn('ElevenLabs TTS failed, using browser fallback:', error);
    speakWithBrowserTTS(text, gentle);
    onEnd?.();
  }
}

export function speakWithBrowserTTS(text: string, gentle: boolean = false): void {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  const preferred = voices.find(v =>
    v.name.toLowerCase().includes('samantha') ||
    v.name.toLowerCase().includes('karen') ||
    v.name.toLowerCase().includes('victoria') ||
    v.name.toLowerCase().includes('danielle')
  );
  if (preferred) utterance.voice = preferred;

  utterance.rate = gentle ? 0.75 : 0.85;
  utterance.pitch = gentle ? 1.1 : 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}

export async function testElevenLabs(): Promise<boolean> {
  if (!config.elevenlabs.apiKey) return false;
  try {
    const res = await fetch(`${ELEVENLABS_BASE}/voices`, {
      headers: { 'xi-api-key': config.elevenlabs.apiKey },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
export const GENTLE_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';