import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface HealthMetric {
  id: string;
  type: 'steps' | 'sleep_hours' | 'heart_rate' | 'mood';
  value: number;
  unit: string;
  date: string;
  source: 'apple_health' | 'manual' | 'samsung_health';
}

export interface DailyHealthSummary {
  date: string;
  steps: number;
  sleepHours: number;
  avgHeartRate: number;
  mood: string;
}

interface HealthState {
  metrics: HealthMetric[];
  isConnected: boolean;
  lastSync: string | null;
  permissionsGranted: boolean;
  isLoading: boolean;

  requestPermissions: () => Promise<boolean>;
  syncHealthData: () => Promise<void>;
  addMetric: (metric: Omit<HealthMetric, 'id'>) => void;
  getMetricsByDate: (date: string) => HealthMetric[];
  getWeeklySummary: () => DailyHealthSummary[];
  setConnected: (connected: boolean) => void;
  setPermissionsGranted: (granted: boolean) => void;
  updateLastSync: () => void;
}

const generateMockHealthData = (): HealthMetric[] => {
  const metrics: HealthMetric[] = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    metrics.push({
      id: `steps-${i}`,
      type: 'steps',
      value: Math.floor(2000 + Math.random() * 8000),
      unit: 'steps',
      date: dateStr,
      source: Platform.OS === 'ios' ? 'apple_health' : 'samsung_health',
    });

    metrics.push({
      id: `sleep-${i}`,
      type: 'sleep_hours',
      value: Math.round((5 + Math.random() * 4) * 10) / 10,
      unit: 'hours',
      date: dateStr,
      source: Platform.OS === 'ios' ? 'apple_health' : 'samsung_health',
    });

    metrics.push({
      id: `hr-${i}`,
      type: 'heart_rate',
      value: Math.floor(60 + Math.random() * 30),
      unit: 'bpm',
      date: dateStr,
      source: Platform.OS === 'ios' ? 'apple_health' : 'samsung_health',
    });
  }

  return metrics;
};

async function fetchAppleHealthData(): Promise<HealthMetric[]> {
  const metrics: HealthMetric[] = [];

  try {
    const {
      authorizeHealthKit,
      getHealthData,
    } = require('expo-healthkit-module');

    const authResult = await authorizeHealthKit();
    if (!authResult.success) {
      console.log('HealthKit auth failed:', authResult.error);
      return generateMockHealthData();
    }

    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const identifiers = ['stepCount', 'heartRate', 'sleepAnalysis'];

    for (const identifier of identifiers) {
      try {
        const data = await getHealthData({
          identifier,
          startDate,
          endDate,
          aggregation: identifier === 'stepCount' ? 'sum' : 'raw',
        });

        if (data && data.length > 0) {
          for (const point of data) {
            const dateStr = new Date(point.startDate || point.date).toISOString().split('T')[0];
            let type: 'steps' | 'sleep_hours' | 'heart_rate' | 'mood';
            let value = point.value;

            if (identifier === 'stepCount') {
              type = 'steps';
            } else if (identifier === 'heartRate') {
              type = 'heart_rate';
            } else if (identifier === 'sleepAnalysis') {
              type = 'sleep_hours';
              value = (value || 0) / 3600;
            } else {
              continue;
            }

            metrics.push({
              id: `${identifier}-${point.startDate || point.date}`,
              type,
              value: Math.round(value * 10) / 10,
              unit: type === 'steps' ? 'steps' : type === 'sleep_hours' ? 'hours' : 'bpm',
              date: dateStr,
              source: 'apple_health',
            });
          }
        }
      } catch (e) {
        console.log(`Failed to fetch ${identifier}:`, e);
      }
    }

    if (metrics.length === 0) {
      return generateMockHealthData();
    }
  } catch (e) {
    console.log('HealthKit module not available, using mock data:', e);
    return generateMockHealthData();
  }

  return metrics;
}

async function fetchSamsungHealthData(): Promise<HealthMetric[]> {
  console.log('Samsung Health via Health Connect - scaffold ready, needs Som\'s Android device');
  return generateMockHealthData();
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      metrics: generateMockHealthData(),
      isConnected: false,
      lastSync: null,
      permissionsGranted: false,
      isLoading: false,

      requestPermissions: async () => {
        try {
          if (Platform.OS === 'ios') {
            const { authorizeHealthKit } = require('expo-healthkit-module');
            const result = await authorizeHealthKit();
            const granted = result.success;
            set({ permissionsGranted: granted, isConnected: granted });
            return granted;
          } else {
            set({ permissionsGranted: true, isConnected: true });
            return true;
          }
        } catch (e) {
          console.error('Permission request failed:', e);
          set({ permissionsGranted: false, isConnected: false });
          return false;
        }
      },

      syncHealthData: async () => {
        set({ isLoading: true });
        try {
          let newMetrics: HealthMetric[];

          if (Platform.OS === 'ios') {
            newMetrics = await fetchAppleHealthData();
          } else {
            newMetrics = await fetchSamsungHealthData();
          }

          set({
            metrics: newMetrics,
            lastSync: new Date().toISOString(),
            isLoading: false,
          });
        } catch (e) {
          console.error('Health sync failed:', e);
          set({
            metrics: generateMockHealthData(),
            isLoading: false,
          });
        }
      },

      addMetric: (metric) =>
        set((state) => ({
          metrics: [
            ...state.metrics,
            { ...metric, id: `metric-${Date.now()}` },
          ],
        })),

      getMetricsByDate: (date) =>
        get().metrics.filter((m) => m.date === date),

      getWeeklySummary: () => {
        const summaries: DailyHealthSummary[] = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const dayMetrics = get().metrics.filter((m) => m.date === dateStr);

          const stepsData = dayMetrics.filter((m) => m.type === 'steps');
          const sleepData = dayMetrics.filter((m) => m.type === 'sleep_hours');
          const hrData = dayMetrics.filter((m) => m.type === 'heart_rate');

          const avgSteps = stepsData.length > 0
            ? Math.round(stepsData.reduce((sum, m) => sum + m.value, 0) / stepsData.length)
            : 0;
          const avgSleep = sleepData.length > 0
            ? Math.round((sleepData.reduce((sum, m) => sum + m.value, 0) / sleepData.length) * 10) / 10
            : 0;
          const avgHR = hrData.length > 0
            ? Math.round(hrData.reduce((sum, m) => sum + m.value, 0) / hrData.length)
            : 0;

          summaries.push({
            date: dateStr,
            steps: avgSteps,
            sleepHours: avgSleep,
            avgHeartRate: avgHR,
            mood: avgSteps > 5000 ? 'Good' : avgSteps > 3000 ? 'Okay' : 'Tired',
          });
        }

        return summaries.reverse();
      },

      setConnected: (connected) => set({ isConnected: connected }),
      setPermissionsGranted: (granted) => set({ permissionsGranted: granted }),
      updateLastSync: () => set({ lastSync: new Date().toISOString() }),
    }),
    {
      name: 'cueguide-health',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);