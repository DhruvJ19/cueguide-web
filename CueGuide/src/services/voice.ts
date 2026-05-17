import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const CUEGUIDE_API_BASE_URL = process.env.EXPO_PUBLIC_CUEGUIDE_API_BASE_URL?.trim() ?? '';

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

function getApiUrl(path: string): string {
  if (!CUEGUIDE_API_BASE_URL) return '';
  return `${CUEGUIDE_API_BASE_URL.replace(/\/$/, '')}${path}`;
}

export async function speakWithElevenLabs(text: string, gentle: boolean): Promise<void> {
  const apiUrl = getApiUrl('/api/elevenlabs/tts');
  if (!apiUrl) {
    return speakWithNativeTTS(text, gentle);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: gentle ? transformToGentle(text) : text,
        gentle,
      }),
    });

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

export function speakWithNativeTTS(text: string, gentle: boolean): Promise<void> {
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
  if (CUEGUIDE_API_BASE_URL) {
    return speakWithElevenLabs(text, true);
  }
  return speakWithNativeTTS(text, true);
}

export async function testVoice(): Promise<boolean> {
  const apiUrl = getApiUrl('/api/elevenlabs/voices');
  if (!apiUrl) return false;
  try {
    const response = await fetch(apiUrl);
    return response.ok;
  } catch {
    return false;
  }
}

export function isVoiceEnabled(): boolean {
  return Boolean(CUEGUIDE_API_BASE_URL);
}
