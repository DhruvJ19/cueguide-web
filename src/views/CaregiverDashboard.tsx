import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pill,
  Radio,
  Search,
  Settings,
  Sun,
} from 'lucide-react';
import { format } from 'date-fns';
import { usePatientStore } from '../store/patientStore';
import { useRoutineStore } from '../store/routineStore';
import { useCompletionStore } from '../store/completionStore';
import { useSettingsStore } from '../store/settingsStore';
import { useMedicationStore } from '../store/medicationStore';
import { useAlertStore } from '../store/alertStore';
import { validateMedicationDraft } from '../services/careAlerts';
import { buildMedicationRoutine, getMedicationScheduleTimes } from '../services/medicationRoutine';
import { getElevenLabsStatus, type AudioPlaybackResult, type VoiceStatus } from '../services/elevenlabs';
import { getCaregiverVoiceSampleMessage, playAudio } from '../utils/audio';
import { config } from '../config/env';
import { isSupabaseConfigured } from '../services/supabase';
import { downloadLocalBackup } from '../services/localBackup';
import {
  MedicationsView,
  ReportsView,
  RoutinesView,
  SessionView,
  SettingsView,
  TodayView,
  type MedicationDraft,
  type Tab,
} from '../components/caregiver/DashboardViews';
import type { CaregiverTone } from '../components/caregiver/CaregiverPrimitives';
import type { Medication, Routine, RoutineStatus, StepCompletion } from '../types';
type VoiceReviewState = 'pending' | 'accepted';
type VoiceSampleResult = AudioPlaybackResult | 'not_played';

interface Props {
  onStartSimulation: (routine: Routine) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  setIsCommandOpen: (open: boolean) => void;
  initialTab?: Tab;
}

const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'today', label: 'Today', icon: <LayoutDashboard size={18} /> },
  { id: 'medications', label: 'Medications', icon: <Pill size={18} /> },
  { id: 'routines', label: 'Routines', icon: <ClipboardList size={18} /> },
  { id: 'session', label: 'Live Session', icon: <Radio size={18} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const emptyMedication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
  patientId: 'patient-1',
  name: '',
  purpose: '',
  dosage: '',
  pillColor: 'blue',
  pillShape: 'small round',
  times: ['08:00'],
  instructions: '',
  location: 'the yellow pill box on the kitchen counter',
  refillDate: '',
  isActive: true,
};

const VOICE_REVIEW_STORAGE_KEY = 'cueguide-voice-review-state';
const VOICE_REVIEW_PROMPTS = [
  'Would you like to take the small blue pill with a sip of water?',
  'The pill is in the yellow box on the counter.',
  'Take your time. I can wait with you.',
];

function formatStatus(status: RoutineStatus | string): string {
  const labels: Record<string, string> = {
    upcoming: 'Upcoming',
    in_progress: 'In progress',
    completed: 'Complete',
    partial: 'Needs review',
    missed: 'Missed',
    past_due: 'Needs attention',
  };
  return labels[status] || status.replace('_', ' ');
}

function formatEventStatus(status: StepCompletion['status']): string {
  const labels: Record<StepCompletion['status'], string> = {
    started: 'Started',
    completed: 'Confirmed',
    skipped: 'Skipped',
    help_requested: 'Help requested',
    stuck: 'Stuck too long',
  };
  return labels[status];
}

function formatAlertSeverity(severity: string): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
}

function getNextDoseLabel(medication: Medication, currentTime: string): string {
  const sortedTimes = [...medication.times].sort((a, b) => a.localeCompare(b));
  const nextToday = sortedTimes.find((time) => time >= currentTime);
  if (nextToday) return `Next ${nextToday}`;
  return sortedTimes[0] ? `Tomorrow ${sortedTimes[0]}` : 'No time set';
}

function getRefillInfo(medication: Medication): { label: string; tone: CaregiverTone } {
  if (!medication.refillDate) return { label: 'No refill date', tone: 'muted' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const refill = new Date(`${medication.refillDate}T00:00:00`);
  if (Number.isNaN(refill.getTime())) return { label: 'Check refill date', tone: 'attention' };
  const daysUntilRefill = Math.ceil((refill.getTime() - today.getTime()) / 86_400_000);
  if (daysUntilRefill < 0) return { label: `Overdue ${Math.abs(daysUntilRefill)}d`, tone: 'urgent' };
  if (daysUntilRefill === 0) return { label: 'Due today', tone: 'urgent' };
  if (daysUntilRefill <= 7) return { label: `Refill in ${daysUntilRefill}d`, tone: 'attention' };
  return { label: `Refill ${format(refill, 'MMM d')}`, tone: 'ready' };
}

function getSessionMessage(completionStatus: RoutineStatus | undefined): string {
  if (completionStatus === 'completed') return 'Patient confirmed the session. Review events and mood below.';
  if (completionStatus === 'partial') return 'Some steps need caregiver review. Patient-facing language stays calm.';
  if (completionStatus === 'missed') return 'Session did not complete. Use caregiver review language only.';
  return 'Start a medication session to see patient actions and caregiver alerts here.';
}

export default function CaregiverDashboard({ onStartSimulation, theme, setTheme, setIsCommandOpen, initialTab }: Props) {
  const { profile } = usePatientStore();
  const { routines } = useRoutineStore();
  const { completions } = useCompletionStore();
  const { aiConfig, setAiConfig } = useSettingsStore();
  const { medications, addMedication, updateMedication, toggleMedication, lastSaveError } = useMedicationStore();
  const { alerts, acknowledgeAlert } = useAlertStore();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (initialTab) return initialTab;
    const stored = localStorage.getItem('cueguide-active-tab') as Tab | null;
    return stored && tabs.some((item) => item.id === stored) ? stored : 'today';
  });
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [draftMedication, setDraftMedication] = useState(emptyMedication);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [voiceReviewState, setVoiceReviewState] = useState<VoiceReviewState>(() => {
    return localStorage.getItem(VOICE_REVIEW_STORAGE_KEY) === 'accepted' ? 'accepted' : 'pending';
  });
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    ok: false,
    selectedVoiceId: '',
    selectedVoiceName: '',
    message: config.elevenlabs.enabled ? 'Checking ElevenLabs voice service.' : 'ElevenLabs is required for production voice.',
  });
  const [voiceSampleResult, setVoiceSampleResult] = useState<VoiceSampleResult>('not_played');

  React.useEffect(() => {
    const handleNav = (event: Event) => {
      const tab = (event as CustomEvent).detail as Tab;
      if (tabs.some((item) => item.id === tab)) setActiveTab(tab);
    };
    window.addEventListener('nav-tab', handleNav);
    return () => window.removeEventListener('nav-tab', handleNav);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('cueguide-active-tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    localStorage.setItem(VOICE_REVIEW_STORAGE_KEY, voiceReviewState);
  }, [voiceReviewState]);

  React.useEffect(() => {
    let cancelled = false;
    if (!config.elevenlabs.enabled) {
      setVoiceStatus({
        ok: false,
        selectedVoiceId: '',
        selectedVoiceName: '',
        message: 'Enable VITE_USE_ELEVENLABS=true for production voice.',
      });
      return;
    }

    getElevenLabsStatus().then((status) => {
      if (!cancelled) setVoiceStatus(status);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const currentTime = format(new Date(), 'HH:mm');
  const todaysCompletions = completions.filter((completion) => completion.date === today);
  const activeMedications = medications.filter((medication) => medication.isActive);
  const medTimes = getMedicationScheduleTimes(medications);
  const medicationRoutines = useMemo(
    () =>
      profile
        ? medTimes.map((time) => buildMedicationRoutine({ patient: profile, medications, scheduledTime: time }))
        : [],
    [profile, medications, medTimes]
  );
  const allRoutines = [...medicationRoutines, ...routines.filter((routine) => routine.category !== 'medication')];
  const unreadAlerts = alerts.filter((alert) => alert.status === 'unread');
  const completedToday = todaysCompletions.filter((completion) => completion.status === 'completed');
  const needsReviewToday = todaysCompletions.filter((completion) => completion.status === 'partial' || completion.status === 'missed');
  const latestCompletion = [...todaysCompletions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const latestRoutine = latestCompletion ? allRoutines.find((routine) => routine.id === latestCompletion.routineId) : undefined;
  const recentCompletions = [...completions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
  const medicationCompletions = recentCompletions.filter((completion) =>
    allRoutines.find((routine) => routine.id === completion.routineId)?.category === 'medication'
  );
  const sortedRoutines = [...allRoutines].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const nextRoutine = sortedRoutines.find((routine) => !todaysCompletions.some((item) => item.routineId === routine.id)) || sortedRoutines[0];
  const nextMedicationRoutine = medicationRoutines.find((routine) => !todaysCompletions.some((item) => item.routineId === routine.id)) || medicationRoutines[0];
  const nextRoutineCompletion = nextRoutine ? todaysCompletions.find((item) => item.routineId === nextRoutine.id) : undefined;
  const nextRoutineIsPastDue = Boolean(nextRoutine && !nextRoutineCompletion && nextRoutine.scheduledTime < currentTime);
  const overdueRoutines = sortedRoutines.filter((routine) => {
    const completion = todaysCompletions.find((item) => item.routineId === routine.id);
    return !completion && routine.scheduledTime < currentTime;
  });
  const helpEvents = recentCompletions.flatMap((completion) => completion.stepEvents || []).filter((event) => event.status === 'help_requested');
  const skippedEvents = recentCompletions.flatMap((completion) => completion.stepEvents || []).filter((event) => event.status === 'skipped');
  const adherenceRate = medicationCompletions.length === 0
    ? 0
    : Math.round((medicationCompletions.filter((completion) => completion.status === 'completed').length / medicationCompletions.length) * 100);
  const moodCounts = recentCompletions.reduce<Record<string, number>>((counts, completion) => {
    if (!completion.mood) return counts;
    return { ...counts, [completion.mood]: (counts[completion.mood] || 0) + 1 };
  }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No mood data';
  const readiness = {
    voice: config.elevenlabs.enabled && voiceStatus.ok,
    ai: aiConfig.isEnabled,
    data: isSupabaseConfigured,
    events: todaysCompletions.some((completion) => (completion.stepEvents?.length || 0) > 0),
  };
  const activeDoseCount = activeMedications.reduce((sum, med) => sum + med.times.length, 0);
  const refillAttentionCount = activeMedications.filter((medication) => {
    const refill = getRefillInfo(medication);
    return refill.tone === 'attention' || refill.tone === 'urgent';
  }).length;
  const sessionStatusNote = getSessionMessage(latestCompletion?.status);
  const voiceReviewReady = readiness.voice && voiceReviewState === 'accepted';
  const voiceReviewStatus: 'ready' | 'review' | 'blocked' = voiceReviewReady ? 'ready' : readiness.voice ? 'review' : 'blocked';
  const voiceReadinessValue = voiceReviewReady
    ? 'Voice accepted'
    : readiness.voice
      ? 'Human voice review pending'
      : config.elevenlabs.enabled
        ? 'ElevenLabs blocked'
        : 'ElevenLabs required';
  const voiceReadinessDetail = voiceReviewReady
    ? `${voiceStatus.selectedVoiceName || 'Production voice'} passed the Google Maps standard: human, soft, gentle.`
    : readiness.voice
      ? `Voice library is reachable. Play a sample to confirm paid TTS audio and Google Maps-level tone.`
      : voiceStatus.message;
  const pageTitle = activeTab === 'today' ? 'Care overview' : tabs.find((tab) => tab.id === activeTab)?.label || 'Today';
  const headerContext = profile?.name ? `${profile.name} care plan` : 'Care plan';
  const headerStatus = unreadAlerts.length > 0
    ? `${unreadAlerts.length} alert${unreadAlerts.length === 1 ? ' needs' : 's need'} review`
    : nextRoutine
      ? `${nextRoutine.name} at ${nextRoutine.scheduledTime}`
      : 'Care plan ready';
  const adherenceLabel = medicationCompletions.length < 2 ? 'Pending' : `${adherenceRate}%`;
  const latestSessionEvents = latestCompletion?.stepEvents || [];
  const latestVisibleAlerts = [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const markVoiceAccepted = () => {
    if (!readiness.voice || voiceSampleResult !== 'elevenlabs') return;
    setVoiceReviewState('accepted');
  };

  const resetVoiceReview = () => {
    setVoiceReviewState('pending');
    setVoiceSampleResult('not_played');
  };

  const playVoiceSample = async (prompt: string) => {
    const result = await playAudio(prompt, 'female', true);
    setVoiceSampleResult(result);
    if (result !== 'elevenlabs') setVoiceReviewState('pending');
  };

  const handleMedicationChange = (field: keyof typeof draftMedication, value: string | string[] | boolean) => {
    setDraftMedication((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleExportLocalData = () => {
    downloadLocalBackup(window.localStorage, new Date().toISOString());
  };

  const resetMedicationForm = () => {
    setDraftMedication(emptyMedication);
    setFormErrors({});
    setEditingMedicationId(null);
    setIsAddingMedication(false);
  };

  const startAddMedication = () => {
    setDraftMedication(emptyMedication);
    setFormErrors({});
    setEditingMedicationId(null);
    setIsAddingMedication(true);
  };

  const startEditMedication = (medication: Medication) => {
    const { id, createdAt, updatedAt, ...draft } = medication;
    setDraftMedication(draft);
    setFormErrors({});
    setEditingMedicationId(id);
    setIsAddingMedication(true);
  };

  const handleSaveMedication = () => {
    const now = new Date().toISOString();
    const validation = validateMedicationDraft({
      ...draftMedication,
      id: editingMedicationId || 'draft-medication',
      patientId: profile?.id || 'patient-1',
      createdAt: now,
      updatedAt: now,
    });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    const { id, createdAt, updatedAt, ...medication } = validation.normalized;
    if (editingMedicationId) {
      updateMedication(editingMedicationId, {
        ...medication,
        patientId: profile?.id || 'patient-1',
      });
    } else {
      addMedication({ ...medication, patientId: profile?.id || 'patient-1' });
    }
    resetMedicationForm();
  };

  const dashboardFormatters = {
    formatStatus,
    formatEventStatus,
    formatAlertSeverity,
    getNextDoseLabel,
    getRefillInfo,
  };

  const renderActiveTab = () => {
    if (activeTab === 'today') {
      return (
        <TodayView
          nextRoutineIsPastDue={nextRoutineIsPastDue}
          nextRoutine={nextRoutine}
          nextMedicationRoutine={nextMedicationRoutine}
          activeMedicationCount={activeMedications.length}
          activeDoseCount={activeDoseCount}
          unreadAlertCount={unreadAlerts.length}
          needsReviewCount={needsReviewToday.length}
          completedTodayCount={completedToday.length}
          refillAttentionCount={refillAttentionCount}
          allRoutines={allRoutines}
          sortedRoutines={sortedRoutines}
          todaysCompletions={todaysCompletions}
          currentTime={currentTime}
          alerts={alerts}
          overdueRoutines={overdueRoutines}
          latestVisibleAlerts={latestVisibleAlerts}
          profile={profile}
          onStartSimulation={onStartSimulation}
          onNavigate={setActiveTab}
          onAcknowledgeAlert={acknowledgeAlert}
          formatters={dashboardFormatters}
        />
      );
    }

    if (activeTab === 'medications') {
      return (
        <MedicationsView
          medications={medications}
          currentTime={currentTime}
          isAddingMedication={isAddingMedication}
          editingMedicationId={editingMedicationId}
          draftMedication={draftMedication}
          formErrors={formErrors}
          lastSaveError={lastSaveError}
          onStartAddMedication={startAddMedication}
          onEditMedication={startEditMedication}
          onToggleMedication={toggleMedication}
          onMedicationChange={handleMedicationChange}
          onResetMedicationForm={resetMedicationForm}
          onSaveMedication={handleSaveMedication}
          formatters={dashboardFormatters}
        />
      );
    }

    if (activeTab === 'routines') {
      return <RoutinesView allRoutines={allRoutines} onStartSimulation={onStartSimulation} />;
    }

    if (activeTab === 'session') {
      return (
        <SessionView
          latestCompletion={latestCompletion}
          latestRoutine={latestRoutine}
          latestSessionEvents={latestSessionEvents}
          nextMedicationRoutine={nextMedicationRoutine}
          profile={profile}
          sessionStatusNote={sessionStatusNote}
          onStartSimulation={onStartSimulation}
          formatters={dashboardFormatters}
        />
      );
    }

    if (activeTab === 'reports') {
      return (
        <ReportsView
          medicationCompletions={medicationCompletions}
          adherenceRate={adherenceRate}
          adherenceLabel={adherenceLabel}
          helpEvents={helpEvents}
          skippedEvents={skippedEvents}
          topMood={topMood}
          activeMedicationCount={activeMedications.length}
          medTimeCount={medTimes.length}
          refillAttentionCount={refillAttentionCount}
          unreadAlertCount={unreadAlerts.length}
          alertCount={alerts.length}
          recentCompletions={recentCompletions}
          allRoutines={allRoutines}
          formatters={dashboardFormatters}
        />
      );
    }

    return (
      <SettingsView
        voiceReviewReady={voiceReviewReady}
        readiness={readiness}
        voiceReadinessValue={voiceReadinessValue}
        voiceReadinessDetail={voiceReadinessDetail}
        voiceReviewStatus={voiceReviewStatus}
        canAcceptVoice={readiness.voice && voiceSampleResult === 'elevenlabs'}
        voiceSampleMessage={getCaregiverVoiceSampleMessage(voiceSampleResult === 'not_played' ? 'empty' : voiceSampleResult)}
        voicePrompts={VOICE_REVIEW_PROMPTS}
        alertCount={alerts.length}
        aiEnabled={aiConfig.isEnabled}
        onPlayPrimaryVoice={() => void playVoiceSample(VOICE_REVIEW_PROMPTS[0])}
        onPlayVoicePrompt={(prompt) => void playVoiceSample(prompt)}
        onMarkVoiceAccepted={markVoiceAccepted}
        onResetVoiceReview={resetVoiceReview}
        onToggleAI={(enabled) => setAiConfig({ isEnabled: enabled })}
        onExportLocalData={handleExportLocalData}
      />
    );
  };

  return (
    <div className="cg-app">
      <aside className={`cg-nav ${isNavCollapsed ? 'collapsed' : ''}`}>
        <div className="cg-brand">
          <div><HeartPulse size={20} /></div>
          <span>CueGuide</span>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button key={tab.id} data-tab={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <button className="cg-collapse" onClick={() => setIsNavCollapsed((current) => !current)} aria-label={isNavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isNavCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          <span>{isNavCollapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </aside>

      <main className="cg-main">
        <header className="cg-topbar">
          <div>
            <p>{headerContext}</p>
            <h1>{pageTitle}</h1>
            <span>{headerStatus}</span>
          </div>
          <div className="cg-top-actions">
            <button className="cg-search" onClick={() => setIsCommandOpen(true)}><Search size={16} /> Search</button>
            <button className="cg-icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <div className="cg-page">{renderActiveTab()}</div>
      </main>
    </div>
  );
}
