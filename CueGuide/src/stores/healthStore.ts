import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  addMetric: (metric: Omit<HealthMetric, 'id'>) => void;
  getMetricsByDate: (date: string) => HealthMetric[];
  getWeeklySummary: () => DailyHealthSummary[];
  setConnected: (connected: boolean) => void;
  setPermissionsGranted: (granted: boolean) => void;
  updateLastSync: () => void;
}

// Mock health data for demo
const generateMockHealthData = (): HealthMetric[] => {
  const metrics: HealthMetric[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Steps (vary between 2000-10000)
    metrics.push({
      id: `steps-${i}`,
      type: 'steps',
      value: Math.floor(2000 + Math.random() * 8000),
      unit: 'steps',
      date: dateStr,
      source: 'apple_health',
    });
    
    // Sleep (5-9 hours)
    metrics.push({
      id: `sleep-${i}`,
      type: 'sleep_hours',
      value: Math.round((5 + Math.random() * 4) * 10) / 10,
      unit: 'hours',
      date: dateStr,
      source: 'apple_health',
    });
    
    // Heart rate (60-90 bpm)
    metrics.push({
      id: `hr-${i}`,
      type: 'heart_rate',
      value: Math.floor(60 + Math.random() * 30),
      unit: 'bpm',
      date: dateStr,
      source: 'apple_health',
    });
  }
  
  return metrics;
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      metrics: generateMockHealthData(),
      isConnected: false, // Will be true when HealthKit is connected
      lastSync: null,
      permissionsGranted: false,
      
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
          
          summaries.push({
            date: dateStr,
            steps: dayMetrics.find((m) => m.type === 'steps')?.value || 0,
            sleepHours: dayMetrics.find((m) => m.type === 'sleep_hours')?.value || 0,
            avgHeartRate: dayMetrics.find((m) => m.type === 'heart_rate')?.value || 0,
            mood: dayMetrics.find((m) => m.type === 'mood')?.value 
              ? ['Great', 'Good', 'Okay', 'Tired'][Math.floor(Math.random() * 4)]
              : 'Good',
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