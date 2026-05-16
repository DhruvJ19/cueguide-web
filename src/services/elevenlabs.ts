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

export interface VoiceStatus {
  ok: boolean;
  selectedVoiceId: string;
  selectedVoiceName: string;
  message: string;
}

export type AudioPlaybackResult = 'elevenlabs' | 'browser' | 'blocked' | 'empty';

const GENTLE_SETTINGS: VoiceSettings = {
  stability: 0.68,
  similarity_boost: 0.78,
  style: 0.18,
  use_speaker_boost: false,
};

const DEFAULT_SETTINGS: VoiceSettings = {
  stability: 0.4,
  similarity_boost: 0.8,
};

let cachedVoices: Voice[] | null = null;
let cachedVoiceStatus: VoiceStatus | null = null;

async function fetchVoicePayload(): Promise<{ voices: Voice[]; selectedVoiceId: string; selectedVoice: Voice | null }> {
  const res = await fetch('/api/elevenlabs/voices');
  if (!res.ok) throw new Error(`ElevenLabs voices unavailable: ${res.status}`);
  const data = await res.json();
  return {
    voices: data.voices || [],
    selectedVoiceId: data.selectedVoiceId || '',
    selectedVoice: data.selectedVoice || null,
  };
}

async function assertTtsReady(): Promise<void> {
  const res = await fetch('/api/elevenlabs/tts', {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: 'Voice check.' }),
  });
  const contentType = (res.headers.get('content-type') || '').split(';')[0];
  if (!res.ok || contentType !== 'audio/mpeg') {
    throw new Error(`ElevenLabs TTS unavailable: ${res.status} ${contentType || 'unknown content type'}`);
  }
  await res.arrayBuffer();
}

export async function fetchVoices(): Promise<Voice[]> {
  if (cachedVoices) return cachedVoices;
  try {
    const data = await fetchVoicePayload();
    cachedVoices = data.voices;
    return cachedVoices;
  } catch {
    return [];
  }
}

export async function getElevenLabsStatus(): Promise<VoiceStatus> {
  if (cachedVoiceStatus) return cachedVoiceStatus;
  try {
    const data = await fetchVoicePayload();
    await assertTtsReady();
    cachedVoices = data.voices;
    const selectedVoiceName = data.selectedVoice?.name || 'production voice';
    cachedVoiceStatus = {
      ok: Boolean(data.selectedVoiceId),
      selectedVoiceId: data.selectedVoiceId,
      selectedVoiceName,
      message: `Server voice ready: ${selectedVoiceName}`,
    };
    return cachedVoiceStatus;
  } catch (error) {
    cachedVoiceStatus = {
      ok: false,
      selectedVoiceId: '',
      selectedVoiceName: '',
      message: error instanceof Error ? error.message : 'ElevenLabs status check failed',
    };
    return cachedVoiceStatus;
  }
}

export async function speakWithElevenLabs(
  text: string,
  gentle: boolean,
  onEnd?: () => void,
  voiceId?: string,
): Promise<boolean> {
  try {
    const response = await fetch('/api/elevenlabs/tts', {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId,
        gentle,
        voice_settings: gentle ? GENTLE_SETTINGS : DEFAULT_SETTINGS,
      }),
    });

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
      onEnd?.();
    };
    await audio.play();
    return true;
  } catch (error) {
    console.warn('ElevenLabs TTS failed:', error);
    onEnd?.();
    return false;
  }
}

export function speakWithBrowserTTS(text: string, gentle: boolean): void {
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
  try {
    const res = await fetch('/api/elevenlabs/voices');
    return res.ok;
  } catch {
    return false;
  }
}

export const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
export const GENTLE_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
