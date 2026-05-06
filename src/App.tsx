/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CaregiverDashboard from './views/CaregiverDashboard';
import PatientFocusMode from './views/PatientFocusMode';
import { HeartPulse, Moon, Sun, AlertTriangle } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { usePatientStore } from './store/patientStore';
import { useRoutineStore } from './store/routineStore';
import { useCompletionStore } from './store/completionStore';
import { useAuthStore } from './store/authStore';

import { useSettingsStore } from './store/settingsStore';

import CommandPalette from './components/CommandPalette';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-8 text-content">
      <div className="glass-panel p-8 max-w-md w-full border border-red-500/30">
        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center mb-6">
           <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-content-muted mb-6 text-sm">{error.message}</p>
        <button id="error-fallback-retry-btn" onClick={resetErrorBoundary} className="w-full py-3 bg-content text-bg font-bold rounded-xl hover:opacity-80 transition-opacity">
          Try again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { role, setRole } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('cueguide-theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  
  // Stores
  const { profile, updatePreferences } = usePatientStore();
  const { routines, adjustments } = useRoutineStore();
  const { completions, addCompletion } = useCompletionStore();
  const { aiConfig } = useSettingsStore();

  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('cueguide-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartRoutine = (id: string) => {
    setActiveRoutineId(id);
    setRole('patient');
  };

  const handleFinishRoutine = (routineId: string, status: 'completed' | 'partial' | 'missed', minutes: number, stepsCompleted: number, mood?: string) => {
    addCompletion({
      id: Math.random().toString(36).substr(2, 9),
      routineId,
      date: new Date().toISOString().split('T')[0],
      status,
      minutes,
      stepsCompleted,
      stepsTotal: routines.find(r => r.id === routineId)?.steps.length || 0,
      mood,
    });
    setActiveRoutineId(null);
    setRole('caregiver'); 
  };

  const handleCommandNavigate = (tab: string) => {
    setRole('caregiver'); // ensure we are in caregiver view
    window.dispatchEvent(new CustomEvent('nav-tab', { detail: tab }));
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setActiveRoutineId(null)}>
      <div className={`min-h-screen h-screen relative flex flex-col selection:bg-indigo-500/30 overflow-hidden ${theme === 'light' ? 'light-mode' : ''}`}>
        <div className="mesh-bg"></div>
        <Toaster theme={theme} position="top-right" />
        
        <CommandPalette 
          isOpen={isCommandOpen} 
          onClose={() => setIsCommandOpen(false)} 
          onNavigate={handleCommandNavigate}
        />

        {/* Removed global header to allow role-specific layouts */}

        {/* Main Content */}
        <main className={role === 'patient' ? 'flex-1 h-full overflow-hidden relative flex flex-col' : 'flex-1 h-full flex flex-col overflow-hidden w-full relative'}>
          <AnimatePresence mode="wait">
            {role === 'caregiver' ? (
              <motion.div 
                key="caregiver" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-full flex flex-col overflow-hidden"
              >
                <CaregiverDashboard 
                   onStartSimulation={handleStartRoutine}
                   globalAlert={globalAlert}
                   clearAlert={() => setGlobalAlert(null)}
                   theme={theme}
                   setTheme={setTheme}
                   role={role}
                   setRole={setRole}
                   setIsCommandOpen={setIsCommandOpen}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="patient" 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="flex-1 h-full flex flex-col overflow-hidden"
              >
                <PatientFocusMode 
                   routine={routines.find(r => r.id === activeRoutineId) || routines[0]} 
                   onComplete={(status, min, steps, mood) => handleFinishRoutine(activeRoutineId || routines[0].id, status, min, steps, mood)}
                   onExit={() => setRole('caregiver')}
                   onAlert={(msg) => setGlobalAlert(msg || null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}
