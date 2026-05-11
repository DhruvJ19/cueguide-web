import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '';
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const GENTLE_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const GENTLE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.3,
  use_speaker_boost: true,
};

function transformToGentle(text: string): string {
  return text
    .replace(/\bTake\b/gi, 'Would you like to')
    .replace(/\bRemember\b/gi, 'If you feel ready, you might')
    .replace(/\bDon't forget\b/gi, 'Whenever you\'re ready')
    .replace(/\bYou need to\b/gi, 'You can')
    .replace(/\bYou should\b/gi, 'You\'re welcome to')
    .replace(/\bWake up\b/gi, 'Good morning')
    .replace(/\bbrush your teeth\b/gi, 'brush your teeth, when you\'re ready')
    .replace(/\bTake your medicine\b/gi, 'Your medicine is here, whenever you\'re comfortable')
    .replace(/!/g, '.')
    .trim();
}

export async function speakWithElevenLabs(text: string, gentle: boolean = true): Promise<void> {
  if (!ELEVENLABS_API_KEY) {
    return speakWithNativeTTS(text, gentle);
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${gentle ? GENTLE_VOICE_ID : VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: gentle ? transformToGentle(text) : text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: gentle ? GENTLE_SETTINGS : {
            stability: 0.4,
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
    const uri = URL.createObjectURL(blob);

    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });

    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.setRateAsync(gentle ? 0.85 : 0.95, true);
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        URL.revokeObjectURL(uri);
      }
    });
  } catch (error) {
    console.warn('ElevenLabs TTS failed, using native fallback:', error);
    return speakWithNativeTTS(text, gentle);
  }
}

export function speakWithNativeTTS(text: string, gentle: boolean = true): Promise<void> {
  return new Promise((resolve) => {
    Speech.stop();
    Speech.speak(gentle ? transformToGentle(text) : text, {
      rate: gentle ? 0.75 : 0.85,
      pitch: gentle ? 1.1 : 1.0,
      onDone: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function stopSpeaking() {
  Speech.stop();
}

export async function speakGentle(text: string): Promise<void> {
  if (ELEVENLABS_API_KEY) {
    return speakWithElevenLabs(text, true);
  }
  return speakWithNativeTTS(text, true);
}

export async function testVoice(): Promise<boolean> {
  if (!ELEVENLABS_API_KEY) return false;
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function isVoiceEnabled(): boolean {
  return true;
}