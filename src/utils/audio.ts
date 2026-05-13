import { speakWithElevenLabs, speakWithBrowserTTS, cancelSpeech, isSpeaking, DEFAULT_VOICE_ID } from '../services/elevenlabs';
import { config } from '../config/env';

export interface AudioConfig {
  voicePreference: 'female' | 'male';
  gentle: boolean;
  useElevenLabs: boolean;
}

function getGentleVoiceId(): string {
  return DEFAULT_VOICE_ID;
}

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

export async function playAudio(
  text: string,
  voicePreference: string = 'female',
  gentle: boolean = true,
): Promise<void> {
  if (!text) return;
  cancelSpeech();

  const transformed = gentle ? transformToGentle(text) : text;
  const voiceId = getGentleVoiceId();

  if (config.elevenlabs.enabled) {
    await speakWithElevenLabs(transformed, voiceId, gentle);
  } else {
    speakWithBrowserTTS(transformed, gentle);
  }
}

export { cancelSpeech, isSpeaking };
