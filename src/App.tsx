import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { initMonitoring } from './services/monitoring';
import { PageLoading } from './components/LoadingSpinner';

// Initialize crash reporting
initMonitoring();

// Lazy-loaded views for code splitting
const CaregiverDashboard = lazy(() => import('./views/CaregiverDashboard'));
const PatientFocusMode = lazy(() => import('./views/PatientFocusMode'));
const LoginPage = lazy(() => import('./pages/Login'));
const SignupPage = lazy(() => import('./pages/Signup'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallback'));
const OnboardingPage = lazy(() => import('./pages/Onboarding'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const PrivacyPage = lazy(() => import('./pages/Privacy'));
const TermsPage = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
import { HeartPulse, AlertTriangle } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { usePatientStore } from './store/patientStore';
import { useRoutineStore } from './store/routineStore';
import { useCompletionStore } from './store/completionStore';
import { useAuthStore } from './store/authStore';
import { useMedicationStore } from './store/medicationStore';
import { useAlertStore } from './store/alertStore';

import { useSettingsStore } from './store/settingsStore';
import type { AICueStep, Routine, StepCompletion } from './types';
import { createRoutineCompletionAlert } from './services/careAlerts';
import { v4 as uuidv4 } from 'uuid';

import CommandPalette from './components/CommandPalette';
import { supabase, db, isSupabaseConfigured } from './services/supabase';

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

function AppShell() {
  const { role, setRole, isAuthenticated } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('cueguide-theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const { profile, updatePreferences } = usePatientStore();
  const { routines, adjustments } = useRoutineStore();
  const { completions, addCompletion, setCompletions } = useCompletionStore();
  const { setMedications } = useMedicationStore();
  const { addAlerts, setAlerts } = useAlertStore();
  const { aiConfig } = useSettingsStore();

  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    localStorage.setItem('cueguide-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    if (!isSupabaseConfigured || !profile?.id) return;
    let isMounted = true;
    async function loadProductionData() {
      const [savedMedications, savedCompletions, savedAlerts] = await Promise.all([
        db.medications.getForPatient(profile.id),
        db.completions.getForPatient(profile.id),
        db.alerts.getForPatient(profile.id),
      ]);
      if (!isMounted) return;
      if (savedMedications.length > 0) setMedications(savedMedications);
      if (savedCompletions.length > 0) setCompletions(savedCompletions);
      if (savedAlerts.length > 0) setAlerts(savedAlerts);
    }
    loadProductionData();
    return () => {
      isMounted = false;
    };
  }, [profile?.id, setAlerts, setCompletions, setMedications]);

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

  const handleStartRoutine = (routine: Routine) => {
    setActiveRoutine(routine);
    setRole('patient');
  };

  const handleFinishRoutine = (
    routine: Routine,
    status: 'completed' | 'partial' | 'missed',
    minutes: number,
    stepsCompleted: number,
    mood?: string,
    stepEvents?: StepCompletion[],
    aiPromptsUsed?: AICueStep[]
  ) => {
    const completion = {
      id: uuidv4(),
      patientId: profile?.id || '',
      routineId: routine.id,
      date: new Date().toISOString().split('T')[0],
      status,
      minutes,
      stepsCompleted,
      stepsTotal: routine.steps.length,
      stepEvents,
      aiPromptsUsed,
      mood,
      createdAt: new Date().toISOString(),
    };
    addCompletion(completion);
    addAlerts([
      createRoutineCompletionAlert({
        patientId: completion.patientId,
        routineId: completion.routineId,
        patientName: profile?.preferredName || profile?.name || 'The patient',
        routineName: routine.name,
        status,
        stepsCompleted,
        stepsTotal: routine.steps.length,
        minutes,
      }),
    ]);
    localStorage.setItem('cueguide-active-tab', 'session');
    setActiveRoutine(null);
    setRole('caregiver');
  };

  const handleCommandNavigate = (tab: string) => {
    setRole('caregiver');
    window.dispatchEvent(new CustomEvent('nav-tab', { detail: tab }));
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setActiveRoutine(null)}>
      <div className={`min-h-screen h-screen relative flex flex-col selection:bg-indigo-500/30 overflow-hidden ${theme === 'light' ? 'light-mode' : ''}`}>
        <div className="mesh-bg"></div>
        <Toaster theme={theme} position="top-right" />

        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onNavigate={handleCommandNavigate}
        />

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
                   theme={theme}
                   setTheme={setTheme}
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
                   routine={activeRoutine || routines[0]}
                   onComplete={(status, min, steps, mood, stepEvents, aiPromptsUsed) =>
                    handleFinishRoutine(activeRoutine || routines[0], status, min, steps, mood, stepEvents, aiPromptsUsed)
                   }
                   onExit={() => setRole('caregiver')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  const { isAuthenticated, setRole } = useAuthStore();
  const { profile } = usePatientStore();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const existing = await db.caregivers.getByUserId(session.user.id);
        if (existing) {
          setRole('caregiver');
        }
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
      }
    });
  }, [setRole]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setRole('caregiver');
      }
    };
    checkSession();
  }, [setRole]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/dashboard" element={<AppShell />} />
        <Route path="/" element={<AppShell />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
