import * as Speech from 'expo-speech';

const ELEVENLABS_API_KEY = 'sk_b0527dbb785d7dc6800b9cb22f8439a19b2c9384d6e11f67';

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export interface VoiceConfig {
  apiKey: string;
  voiceId: string;
  stability: number;
  similarity: number;
}

export function isVoiceEnabled(): boolean {
  return true;
}

export async function speakWithElevenLabs(text: string): Promise<void> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    // For now, fall back to native TTS since we're in React Native
    // In production, use expo-av to play the audio
    return speakWithNativeTTS(text);
  } catch (error) {
    console.error('ElevenLabs TTS failed, using native fallback:', error);
    return speakWithNativeTTS(text);
  }
}

export function speakWithNativeTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    Speech.stop();

    Speech.speak(text, {
      rate: 0.8,
      pitch: 1.05,
      onDone: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function stopSpeaking() {
  Speech.stop();
}

export async function speakGentle(text: string): Promise<void> {
  // For dementia patients - use ElevenLabs with gentle settings
  // Fall back to native TTS if ElevenLabs fails
  return speakWithNativeTTS(text);
}

export async function testVoice(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/voices`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}