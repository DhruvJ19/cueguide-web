import {
  speakWithElevenLabs,
  speakWithBrowserTTS,
  cancelSpeech,
  isSpeaking,
  type AudioPlaybackResult,
} from '../services/elevenlabs';
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

export function getPatientAudioNotice(result: AudioPlaybackResult): string | null {
  if (result === 'empty') return null;
  if (result === 'blocked') return 'Let us use the words on screen for now.';
  return 'Reading aloud now.';
}

export function getCaregiverVoiceSampleMessage(result: AudioPlaybackResult): string {
  if (result === 'elevenlabs') return 'Last sample used ElevenLabs audio. Accept only after it sounds human, soft, and gentle.';
  if (result === 'browser') return 'Last sample used browser speech. This is not acceptable for production voice review.';
  if (result === 'blocked') return 'Voice sample is blocked because ElevenLabs did not return audio. Rotate or re-set the server key.';
  return 'No voice sample has played yet.';
}

export async function playAudio(
  text: string,
  voicePreference: string,
  gentle: boolean,
): Promise<AudioPlaybackResult> {
  if (!text) return 'empty';
  cancelSpeech();

  const transformed = gentle ? transformToGentle(text) : text;

  if (config.elevenlabs.enabled) {
    const playedWithElevenLabs = await speakWithElevenLabs(transformed, gentle);
    if (playedWithElevenLabs) return 'elevenlabs';
    if (!config.elevenlabs.allowBrowserFallback) return 'blocked';
  }

  speakWithBrowserTTS(transformed, gentle);
  return 'browser';
}

export { cancelSpeech, isSpeaking };
