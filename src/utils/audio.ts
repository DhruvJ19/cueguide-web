import { speakWithElevenLabs, speakWithBrowserTTS, cancelSpeech, isSpeaking } from '../services/elevenlabs';
import { config } from '../config/env';

export interface AudioConfig {
  voicePreference: 'female' | 'male';
  gentle: boolean;
  useElevenLabs: boolean;
}

export function transformToGentle(text: string): string {
  const cleaned = text
    .replace(/!/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned
    .replace(/\bYou need to\b/gi, 'You can')
    .replace(/\bYou should\b/gi, 'You are welcome to')
    .replace(/\bRemember to\b/gi, 'When you feel ready, you can')
    .replace(/\bDon't forget to\b/gi, 'When you feel ready, you can')
    .replace(/\bTake your medicine\b/gi, 'Would you like to take your medicine')
    .replace(/\bTake the\b/gi, 'Would you like to take the')
    .replace(/\bTake this\b/gi, 'Would you like to take this')
    .replace(/^Take\b/i, 'Would you like to take')
    .replace(/\bPick up\b/gi, 'When you are ready, please pick up')
    .replace(/\bSwallow\b/gi, 'When you are comfortable, please swallow')
    .replace(/\bwith water\b/gi, 'with a sip of water')
    .replace(/\bThere is no rush\b/gi, 'There is no rush')
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

  if (config.elevenlabs.enabled) {
    await speakWithElevenLabs(transformed, gentle);
  } else {
    speakWithBrowserTTS(transformed, gentle);
  }
}

export { cancelSpeech, isSpeaking };
