import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIConfig } from '../types';

interface SettingsState {
  theme: 'dark' | 'light';
  fontSize: number;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  aiConfig: AIConfig;
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: number) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAIConfig: (config: Partial<AIConfig>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      fontSize: 28,
      voiceEnabled: true,
      notificationsEnabled: true,
      aiConfig: {
        isEnabled: false,
        apiKey: '',
        provider: 'gemini',
      },
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setAIConfig: (config) =>
        set((state) => ({ aiConfig: { ...state.aiConfig, ...config } })),
    }),
    {
      name: 'cueguide-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);