import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  aiConfig: {
    isEnabled: boolean;
  };
  setAiConfig: (config: { isEnabled: boolean }) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiConfig: {
        isEnabled: false
      },
      setAiConfig: (aiConfig) => set({ aiConfig }),
    }),
    {
      name: 'cueguide-settings',
    }
  )
);
