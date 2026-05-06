import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { config } from '../config/env';

interface SettingsState {
  aiConfig: {
    isEnabled: boolean;
    apiKey: string;
  };
  setAiConfig: (config: { isEnabled: boolean; apiKey: string }) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiConfig: {
        isEnabled: false,
        apiKey: config.gemini.apiKey
      },
      setAiConfig: (aiConfig) => set({ aiConfig }),
    }),
    {
      name: 'cueguide-settings',
    }
  )
);
