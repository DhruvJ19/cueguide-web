import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Medication } from '../types';
import { INITIAL_MEDICATIONS } from '../data';
import { db } from '../services/supabase';

interface MedicationState {
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  toggleMedication: (id: string) => void;
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      medications: INITIAL_MEDICATIONS,
      setMedications: (medications) => set({ medications }),
      addMedication: async (medication) => {
        const now = new Date().toISOString();
        const next: Medication = { ...medication, id: uuidv4(), createdAt: now, updatedAt: now };
        set((state) => ({ medications: [...state.medications, next] }));
        try {
          await db.medications.save(next);
        } catch (error) {
          console.error('Failed to save medication', error);
        }
      },
      updateMedication: async (id, updates) => {
        const previous = get().medications;
        set((state) => ({
          medications: state.medications.map((medication) =>
            medication.id === id ? { ...medication, ...updates, updatedAt: new Date().toISOString() } : medication
          ),
        }));
        const updated = get().medications.find((medication) => medication.id === id);
        if (updated) {
          try {
            await db.medications.save(updated);
          } catch (error) {
            console.error('Failed to update medication', error);
            set({ medications: previous });
          }
        }
      },
      toggleMedication: (id) => {
        const medication = get().medications.find((item) => item.id === id);
        if (medication) get().updateMedication(id, { isActive: !medication.isActive });
      },
    }),
    { name: 'cueguide-medications' }
  )
);
