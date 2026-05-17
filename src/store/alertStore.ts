import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CareAlert } from '../types';
import { INITIAL_ALERTS } from '../data';
import { db } from '../services/supabase';

interface AlertState {
  alerts: CareAlert[];
  setAlerts: (alerts: CareAlert[]) => void;
  addAlerts: (alerts: CareAlert[]) => void;
  acknowledgeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: INITIAL_ALERTS,
      setAlerts: (alerts) => set({ alerts }),
      addAlerts: async (alerts) => {
        if (alerts.length === 0) return;
        set((state) => ({ alerts: [...alerts, ...state.alerts] }));
        try {
          await Promise.all(alerts.map((alert) => db.alerts.save(alert)));
        } catch (error) {
          console.error('Failed to save care alerts', error);
        }
      },
      acknowledgeAlert: async (id) => {
        const previous = get().alerts;
        set((state) => ({
          alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, status: 'acknowledged' } : alert)),
        }));
        const alert = get().alerts.find((item) => item.id === id);
        if (alert) {
          try {
            await db.alerts.save(alert);
          } catch (error) {
            console.error('Failed to acknowledge alert', error);
            set({ alerts: previous });
          }
        }
      },
    }),
    { name: 'cueguide-alerts' }
  )
);
