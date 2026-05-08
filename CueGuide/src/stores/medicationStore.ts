import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication } from '../types';
import { INITIAL_MEDICATIONS } from '../data';
import { v4 as uuidv4 } from 'uuid';

interface MedicationState {
  medications: Medication[];
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  toggleActive: (id: string) => void;
  getActiveMedications: () => Medication[];
  getMedicationsForTime: (time: string) => Medication[];
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      medications: INITIAL_MEDICATIONS as Medication[],
      addMedication: (med) =>
        set((state) => ({
          medications: [
            ...state.medications,
            { ...med, id: uuidv4() },
          ],
        })),
      updateMedication: (id, updates) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      deleteMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        })),
      toggleActive: (id) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          ),
        })),
      getActiveMedications: () =>
        get().medications.filter((m) => m.isActive),
      getMedicationsForTime: (time) =>
        get().medications.filter(
          (m) => m.isActive && m.times.includes(time)
        ),
    }),
    {
      name: 'cueguide-medications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);