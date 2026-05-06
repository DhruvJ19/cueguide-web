/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CaregiverDashboard from './views/CaregiverDashboard';
import PatientFocusMode from './views/PatientFocusMode';
import { HeartPulse, Moon, Sun, AlertTriangle } from 'lucide-react';

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  
  // Stores
  const { profile, updatePreferences } = usePatientStore();
  const { routines, adjustments } = useRoutineStore();
  const { completions, addCompletion } = useCompletionStore();
  const { aiConfig } = useSettingsStore();

  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);

  useEffect(() => {
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
      <div className="min-h-screen relative flex flex-col selection:bg-indigo-500/30">
        <div className="mesh-bg"></div>
        
        <CommandPalette 
          isOpen={isCommandOpen} 
          onClose={() => setIsCommandOpen(false)} 
          onNavigate={handleCommandNavigate}
        />

        {/* Demo Header */}
        {role === 'caregiver' && (
          <header className="px-8 py-5 flex items-center justify-between border-b border-line bg-panel/50 backdrop-blur-xl w-full sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                <HeartPulse size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-content">CueGuide<span className="text-indigo-400 font-black">.</span></h1>
            </div>
            <div className="flex items-center gap-4">
               <button
                 id="theme-toggle-btn"
                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                 className="p-2.5 rounded-lg transition-colors hover:bg-panel-hover text-content-muted"
                 aria-label="Toggle Theme"
               >
                 {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
               </button>
               <div className="flex items-center space-x-1 p-1 rounded-xl border border-line bg-panel">
                  <button 
                    id="role-switch-caregiver-btn"
                    onClick={() => setRole('caregiver')} 
                    className={`px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-colors ${role === 'caregiver' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-panel-hover text-content-muted hover:text-content'}`}
                  >
                    Dashboard
                  </button>
                  <button 
                    id="role-switch-patient-btn"
                    onClick={() => setRole('patient')} 
                    className={`px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-colors ${role === 'patient' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-panel-hover text-content-muted hover:text-content'}`}
                  >
                    Patient View
                  </button>
               </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={role === 'patient' ? 'flex-1 overflow-hidden relative flex flex-col' : 'flex-1 flex flex-col overflow-hidden w-full relative'}>
          {role === 'caregiver' ? (
            <CaregiverDashboard 
               onStartSimulation={handleStartRoutine}
               globalAlert={globalAlert}
               clearAlert={() => setGlobalAlert(null)}
            />
          ) : (
            <PatientFocusMode 
               routine={routines.find(r => r.id === activeRoutineId) || routines[0]} 
               onComplete={(status, min, steps, mood) => handleFinishRoutine(activeRoutineId || routines[0].id, status, min, steps, mood)}
               onExit={() => setRole('caregiver')}
               onAlert={(msg) => setGlobalAlert(msg || null)}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
