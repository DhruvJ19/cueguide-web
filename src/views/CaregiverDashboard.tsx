import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  Edit3,
  FileText,
  HeartPulse,
  HardDrive,
  LayoutDashboard,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pill,
  Plus,
  Radio,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  TimerReset,
  UserRound,
  Volume2,
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
import { getElevenLabsStatus, type VoiceStatus } from '../services/elevenlabs';
import { playAudio } from '../utils/audio';
import { config } from '../config/env';
import { isSupabaseConfigured } from '../services/supabase';
import type { Medication, Routine, RoutineStatus, StepCompletion } from '../types';

type Tab = 'today' | 'medications' | 'routines' | 'session' | 'reports' | 'settings';

interface Props {
  onStartSimulation: (routine: Routine) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  setIsCommandOpen: (open: boolean) => void;
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

type Tone = 'ready' | 'attention' | 'urgent' | 'muted';

function Section({ title, children, action, eyebrow }: { title: string; children: React.ReactNode; action?: React.ReactNode; eyebrow?: string }) {
  return (
    <section className="cg-section">
      <div className="cg-section-header">
        <div>
          {eyebrow && <p>{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: Tone }) {
  return (
    <div className={`cg-stat ${tone ? `cg-stat-${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function formatStatus(status: RoutineStatus | string): string {
  const labels: Record<string, string> = {
    upcoming: 'Upcoming',
    in_progress: 'In progress',
    completed: 'Complete',
    partial: 'Needs review',
    missed: 'Missed',
    past_due: 'Past due',
  };
  return labels[status] || status.replace('_', ' ');
}

function formatEventStatus(status: StepCompletion['status']): string {
  const labels: Record<StepCompletion['status'], string> = {
    started: 'Started',
    completed: 'Done',
    skipped: 'Skipped',
    help_requested: 'Help requested',
    stuck: 'Stuck too long',
  };
  return labels[status];
}

function getNextDoseLabel(medication: Medication, currentTime: string): string {
  const sortedTimes = [...medication.times].sort((a, b) => a.localeCompare(b));
  const nextToday = sortedTimes.find((time) => time >= currentTime);
  if (nextToday) return `Next ${nextToday}`;
  return sortedTimes[0] ? `Tomorrow ${sortedTimes[0]}` : 'No time set';
}

function getRefillInfo(medication: Medication): { label: string; tone: Tone } {
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

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="cg-empty">
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

function ReadinessItem({
  icon,
  label,
  value,
  detail,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  status: 'ready' | 'fallback' | 'review' | 'blocked';
}) {
  return (
    <div className={`cg-readiness-item ${status}`}>
      <div className="cg-readiness-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export default function CaregiverDashboard({ onStartSimulation, theme, setTheme, setIsCommandOpen }: Props) {
  const { profile } = usePatientStore();
  const { routines } = useRoutineStore();
  const { completions } = useCompletionStore();
  const { aiConfig, setAiConfig } = useSettingsStore();
  const { medications, addMedication, updateMedication, toggleMedication, lastSaveError } = useMedicationStore();
  const { alerts, acknowledgeAlert } = useAlertStore();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const stored = localStorage.getItem('cueguide-active-tab') as Tab | null;
    return stored && tabs.some((item) => item.id === stored) ? stored : 'today';
  });
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [draftMedication, setDraftMedication] = useState(emptyMedication);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    ok: false,
    selectedVoiceId: '',
    selectedVoiceName: '',
    message: config.elevenlabs.enabled ? 'Checking ElevenLabs voice service.' : 'ElevenLabs is required for production voice.',
  });

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
  const voiceReadinessStatus: 'ready' | 'blocked' = readiness.voice ? 'ready' : 'blocked';
  const voiceReadinessValue = readiness.voice
    ? 'ElevenLabs active'
    : config.elevenlabs.enabled
      ? 'ElevenLabs blocked'
      : 'ElevenLabs required';
  const voiceReadinessDetail = readiness.voice
    ? `${voiceStatus.selectedVoiceName || 'Production voice'} is verified through the server proxy.`
    : voiceStatus.message;
  const pageTitle = tabs.find((tab) => tab.id === activeTab)?.label || 'Today';
  const headerStatus = unreadAlerts.length > 0
    ? `${unreadAlerts.length} alert${unreadAlerts.length === 1 ? '' : 's'} need review`
    : nextRoutine
      ? `Next: ${nextRoutine.name} at ${nextRoutine.scheduledTime}`
      : 'Care plan ready';
  const adherenceLabel = medicationCompletions.length < 2 ? 'Pending' : `${adherenceRate}%`;
  const latestSessionEvents = latestCompletion?.stepEvents || [];
  const latestVisibleAlerts = [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const handleMedicationChange = (field: keyof typeof draftMedication, value: string | string[] | boolean) => {
    setDraftMedication((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: '' }));
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

  const renderToday = () => (
    <div className="cg-content-grid">
      <div className="cg-main-stack">
        <section className="cg-command-panel" aria-label="Medication guidance overview">
          <div className="cg-command-copy">
            <p className="cg-eyebrow">Care operations for {profile?.preferredName || 'patient'}</p>
            <h2>Medication guidance for {profile?.preferredName || 'today'}</h2>
            <p>
              Start the next dose, watch for help or skipped steps, and keep the caregiver record clear without exposing failure language to the patient.
            </p>
            <div className="cg-hero-status">
              <span><Volume2 size={15} /> {readiness.voice ? 'ElevenLabs voice verified' : 'Voice needs setup'}</span>
              <span><Database size={15} /> {readiness.data ? 'Cloud data configured' : 'Local fallback active'}</span>
              <span><Bell size={15} /> {unreadAlerts.length} alert{unreadAlerts.length === 1 ? '' : 's'} open</span>
            </div>
          </div>
          <div className="cg-next-session">
            <span>{nextRoutineIsPastDue ? 'Past due session' : 'Next session'}</span>
            <strong>{nextRoutine?.name || 'No medication scheduled'}</strong>
            <small>{nextRoutine ? `${nextRoutine.scheduledTime} · ${nextRoutine.steps.length} guided steps` : 'Add medication times to build the schedule.'}</small>
            <div className="cg-next-actions">
              <button className="cg-primary" disabled={!medicationRoutines[0]} onClick={() => medicationRoutines[0] && onStartSimulation(medicationRoutines[0])}>
                <Pill size={18} /> Start medication session
              </button>
              <button className="cg-secondary" onClick={() => setActiveTab('medications')}>
                Review medications <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <div className="cg-status-strip">
          <StatCard label="Doses today" value={`${activeDoseCount}`} note={`${activeMedications.length} active medication${activeMedications.length === 1 ? '' : 's'}`} tone="ready" />
          <StatCard label="Completed" value={`${completedToday.length}`} note="confirmed care sessions" tone="ready" />
          <StatCard label="Needs review" value={`${unreadAlerts.length + needsReviewToday.length}`} note="alerts or partial sessions" tone={unreadAlerts.length + needsReviewToday.length > 0 ? 'attention' : 'ready'} />
          <StatCard label="Refills" value={`${refillAttentionCount}`} note="due soon or overdue" tone={refillAttentionCount > 0 ? 'attention' : 'muted'} />
        </div>

        <Section title="Today's Medication And Care Schedule" eyebrow="Operational timeline">
          <div className="cg-schedule">
            {allRoutines.length === 0 && (
              <EmptyState
                title="No care sessions scheduled yet"
                body="Add a medication time to create the first patient-ready session automatically."
                action={<button className="cg-secondary" onClick={() => setActiveTab('medications')}>Add medication</button>}
              />
            )}
            {sortedRoutines.map((routine) => {
              const completion = todaysCompletions.find((item) => item.routineId === routine.id);
              const routineStatus = completion?.status || (routine.scheduledTime < currentTime ? 'past_due' : 'upcoming');
              return (
                <div key={routine.id} className="cg-schedule-row">
                  <div className="cg-time">{routine.scheduledTime}</div>
                  <div className="cg-schedule-body">
                    <strong>{routine.name}</strong>
                    <span>{routine.category === 'medication' ? 'Medication session' : 'Care routine'} · {routine.steps.length} guided steps</span>
                  </div>
                  <span className={`cg-status ${routineStatus}`}>
                    {formatStatus(routineStatus)}
                  </span>
                  <button className="cg-secondary" onClick={() => onStartSimulation(routine)}>
                    Start
                  </button>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <aside className="cg-side-stack">
        <Section title="Attention Queue" eyebrow="Caregiver-only">
          <div className="cg-alert-list">
            {alerts.length === 0 && (
              <EmptyState title="No alerts yet" body="Help requests, skipped steps, longer-than-usual steps, and completion summaries will appear here." />
            )}
            {overdueRoutines.length > 0 && (
              <div className="cg-system-alert">
                <AlertTriangle size={16} />
                <span>
                  <strong>{overdueRoutines.length} session{overdueRoutines.length === 1 ? '' : 's'} past scheduled time</strong>
                  <small>Use caregiver review language only. Patient prompts remain calm.</small>
                </span>
              </div>
            )}
            {latestVisibleAlerts.map((alert) => (
              <button key={alert.id} className={`cg-alert ${alert.status}`} onClick={() => acknowledgeAlert(alert.id)}>
                <Bell size={16} />
                <span>
                  <strong>{alert.title}</strong>
                  <small>{alert.message}</small>
                  <em>{alert.severity} · {alert.status === 'unread' ? 'tap to acknowledge' : 'acknowledged'}</em>
                </span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Patient Context" eyebrow="For tone and cueing">
          <div className="cg-profile">
            <div className="cg-avatar"><UserRound size={30} /></div>
            <strong>{profile?.name}</strong>
            <span>Stage: {profile?.stage}</span>
            <p>{profile?.context}</p>
          </div>
        </Section>
      </aside>
    </div>
  );

  const renderMedications = () => (
    <div className="cg-main-stack">
      <Section
        title="Medication Manager"
        eyebrow="Dose, pill, schedule, refill"
        action={
          <button className="cg-primary" onClick={startAddMedication}>
            <Plus size={16} /> Add medication
          </button>
        }
      >
        <div className="cg-med-list">
          {medications.length > 0 && (
            <div className="cg-med-table-head" aria-hidden="true">
              <span>Medication</span>
              <span>Purpose</span>
              <span>Schedule</span>
              <span>Refill</span>
              <span>Actions</span>
            </div>
          )}
          {medications.length === 0 && (
            <EmptyState
              title="No medications entered"
              body="Add the first medication with pill appearance, schedule, purpose, and instructions."
              action={<button className="cg-secondary" onClick={startAddMedication}>Add medication</button>}
            />
          )}
          {medications.map((medication) => {
            const refill = getRefillInfo(medication);
            return (
              <article key={medication.id} className={`cg-med-row ${!medication.isActive ? 'inactive' : ''}`}>
                <div className="cg-med-name">
                  <div className={`cg-pill ${medication.pillColor}`} />
                  <div>
                    <h3>{medication.name}</h3>
                    <p>{medication.dosage} · {medication.pillShape} {medication.pillColor}</p>
                    {medication.location && <small>Location cue: {medication.location}</small>}
                  </div>
                </div>
                <div className="cg-med-purpose">
                  <span>Purpose</span>
                  <strong>{medication.purpose}</strong>
                  {medication.instructions && <small>{medication.instructions}</small>}
                </div>
                <div className="cg-med-schedule">
                  <strong>{getNextDoseLabel(medication, currentTime)}</strong>
                  <div className="cg-chip-row" aria-label={`${medication.name} times`}>
                    {medication.times.map((time) => <span key={time}>{time}</span>)}
                  </div>
                </div>
                <div className="cg-refill-cell">
                  <span className={`cg-refill ${refill.tone}`}>{refill.label}</span>
                </div>
                <div className="cg-row-actions">
                  <button className="cg-toggle" onClick={() => toggleMedication(medication.id)}>
                    {medication.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button className="cg-secondary" onClick={() => startEditMedication(medication)}>
                    <Edit3 size={15} /> Edit medication
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {lastSaveError && <p className="cg-warning-note">{lastSaveError}</p>}
      </Section>

      {isAddingMedication && (
        <Section title={editingMedicationId ? 'Edit Medication' : 'Add Medication'} eyebrow="Patient-safe cue inputs">
          <div className="cg-form">
            <div className="cg-form-block">
              <strong>Medication profile</strong>
              <div className="cg-form-row">
                <label>
                  <span>Medication name</span>
                  <input value={draftMedication.name} onChange={(event) => handleMedicationChange('name', event.target.value)} placeholder="Medication name" />
                  {formErrors.name && <small className="cg-field-error">{formErrors.name}</small>}
                </label>
                <label>
                  <span>Dosage</span>
                  <input value={draftMedication.dosage} onChange={(event) => handleMedicationChange('dosage', event.target.value)} placeholder="Dosage, e.g. 10 mg" />
                  {formErrors.dosage && <small className="cg-field-error">{formErrors.dosage}</small>}
                </label>
              </div>
              <label>
                <span>Purpose for caregiver review</span>
                <input value={draftMedication.purpose} onChange={(event) => handleMedicationChange('purpose', event.target.value)} placeholder="Plain-language purpose" />
                {formErrors.purpose && <small className="cg-field-error">{formErrors.purpose}</small>}
              </label>
            </div>

            <div className="cg-form-block">
              <strong>Patient recognition cues</strong>
              <div className="cg-form-row">
                <label>
                  <span>Pill color</span>
                  <input value={draftMedication.pillColor} onChange={(event) => handleMedicationChange('pillColor', event.target.value)} placeholder="Pill color" />
                </label>
                <label>
                  <span>Pill shape</span>
                  <input value={draftMedication.pillShape} onChange={(event) => handleMedicationChange('pillShape', event.target.value)} placeholder="Pill shape" />
                </label>
              </div>
              <label>
                <span>Patient location cue</span>
                <input value={draftMedication.location} onChange={(event) => handleMedicationChange('location', event.target.value)} placeholder="Where the patient finds it" />
              </label>
            </div>

            <div className="cg-form-block">
              <strong>Schedule and caregiver notes</strong>
              <label>
                <span>Schedule times</span>
                <input value={draftMedication.times.join(', ')} onChange={(event) => handleMedicationChange('times', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="Times, comma separated" />
                {formErrors.times && <small className="cg-field-error">{formErrors.times}</small>}
              </label>
              <label>
                <span>Caregiver instructions</span>
                <textarea value={draftMedication.instructions} onChange={(event) => handleMedicationChange('instructions', event.target.value)} placeholder="Caregiver notes or instructions" />
              </label>
            </div>
            <div className="cg-form-actions">
              <button className="cg-secondary" onClick={resetMedicationForm}>Cancel</button>
              <button className="cg-primary" onClick={handleSaveMedication}>
                <Save size={16} /> {editingMedicationId ? 'Update medication' : 'Save medication'}
              </button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );

  const renderRoutines = () => (
    <Section title="Routine Library">
      <div className="cg-routine-grid">
        {allRoutines.map((routine) => (
          <article key={routine.id} className="cg-routine-card">
            <span>{routine.category}</span>
            <h3>{routine.name}</h3>
            <p>{routine.scheduledTime} · {routine.steps.length} steps · {routine.recurrence.join(', ')}</p>
            <button className="cg-secondary" onClick={() => onStartSimulation(routine)}>Launch patient mode</button>
          </article>
        ))}
      </div>
    </Section>
  );

  const renderSession = () => (
    <Section title="Live Patient Session" eyebrow="Event timeline">
      {latestCompletion ? (
        <div className="cg-session-layout">
          <div className="cg-session-summary">
            <div>
              <p className="cg-eyebrow">Most recent patient session</p>
              <h2>{latestRoutine?.name || 'Medication session'}</h2>
              <p>{sessionStatusNote}</p>
            </div>
            <div className="cg-session-metrics">
              <StatCard label="Session status" value={formatStatus(latestCompletion.status)} note="caregiver language only" tone={latestCompletion.status === 'completed' ? 'ready' : 'attention'} />
              <StatCard label="Step progress" value={`${latestCompletion.stepsCompleted}/${latestCompletion.stepsTotal}`} note={`${latestCompletion.minutes} minute${latestCompletion.minutes === 1 ? '' : 's'} elapsed`} tone="muted" />
              <StatCard label="Help" value={`${latestSessionEvents.filter((event) => event.status === 'help_requested').length}`} note="patient-tapped help events" tone={latestSessionEvents.some((event) => event.status === 'help_requested') ? 'attention' : 'ready'} />
              <StatCard label="Skipped" value={`${latestSessionEvents.filter((event) => event.status === 'skipped').length}`} note="steps for caregiver review" tone={latestSessionEvents.some((event) => event.status === 'skipped') ? 'attention' : 'ready'} />
            </div>
            <button className="cg-primary" onClick={() => medicationRoutines[0] && onStartSimulation(medicationRoutines[0])}>Start next medication session</button>
          </div>
          <div className="cg-timeline" aria-label="Latest patient action timeline">
            {latestSessionEvents.length === 0 && <p>No detailed step events were logged for this session.</p>}
            {latestSessionEvents.slice(-8).map((event) => (
              <div key={`${event.stepId}-${event.status}-${event.completedAt || event.startedAt}`} className={`cg-timeline-item ${event.status}`}>
                <span>{formatEventStatus(event.status)}</span>
                <strong>{Math.max(1, event.elapsedSeconds)}s</strong>
                <small>{event.completedAt || event.startedAt}</small>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="cg-live-panel">
          <Activity size={28} />
          <h2>No session logged today</h2>
          <p>Start a scheduled routine to see completion, help requests, skipped steps, and timing details here.</p>
          <button className="cg-primary" disabled={!medicationRoutines[0]} onClick={() => medicationRoutines[0] && onStartSimulation(medicationRoutines[0])}>Start next medication session</button>
        </div>
      )}
    </Section>
  );

  const renderReports = () => (
    <div className="cg-content-grid">
      <div className="cg-main-stack">
        <Section title="Care Review" eyebrow="Medication adherence and behavior signals">
          <div className="cg-report-lead">
            <div>
              <p className="cg-eyebrow">Current interpretation</p>
              <h3>{medicationCompletions.length < 2 ? 'Trend evidence is still building' : `${adherenceRate}% medication-session adherence`}</h3>
              <p>
                {medicationCompletions.length < 2
                  ? 'Run more medication sessions before treating adherence as a reliable trend.'
                  : `${medicationCompletions.filter((completion) => completion.status === 'completed').length} of ${medicationCompletions.length} recent medication sessions were completed.`}
              </p>
            </div>
            <div className="cg-report-meter" aria-label="Medication adherence meter">
              <span style={{ width: `${medicationCompletions.length < 2 ? 18 : adherenceRate}%` }} />
            </div>
          </div>
          <div className="cg-report-grid">
            <div className="cg-report-card">
              <CheckCircle2 size={22} />
              <span>Medication adherence</span>
              <strong>{adherenceLabel}</strong>
              <small>{medicationCompletions.length < 2 ? 'Needs more medication sessions before using this trend.' : 'completed medication sessions in recent history'}</small>
            </div>
            <div className="cg-report-card">
              <Bell size={22} />
              <span>Help requests</span>
              <strong>{helpEvents.length}</strong>
              <small>patient-tapped help events</small>
            </div>
            <div className="cg-report-card">
              <ClipboardList size={22} />
              <span>Skipped steps</span>
              <strong>{skippedEvents.length}</strong>
              <small>logged for caregiver review</small>
            </div>
            <div className="cg-report-card">
              <HeartPulse size={22} />
              <span>Common mood</span>
              <strong>{topMood}</strong>
              <small>from completed sessions</small>
            </div>
          </div>
          <div className="cg-insight-list">
            <div>
              <strong>Medication review</strong>
              <p>{activeMedications.length} active medications across {medTimes.length} scheduled time{medTimes.length === 1 ? '' : 's'}; {refillAttentionCount} refill item{refillAttentionCount === 1 ? '' : 's'} need attention.</p>
            </div>
            <div>
              <strong>Caregiver attention</strong>
              <p>{unreadAlerts.length} unread alert{unreadAlerts.length === 1 ? '' : 's'} and {alerts.length} total alert{alerts.length === 1 ? '' : 's'} available for review.</p>
            </div>
            <div>
              <strong>Patient comfort signal</strong>
              <p>{helpEvents.length + skippedEvents.length === 0 ? 'No help or skip patterns are visible in recent sessions.' : `${helpEvents.length} help request${helpEvents.length === 1 ? '' : 's'} and ${skippedEvents.length} skipped step${skippedEvents.length === 1 ? '' : 's'} should be reviewed.`}</p>
            </div>
          </div>
        </Section>
        <Section title="Recent Session Log">
          <div className="cg-session-log">
            {recentCompletions.length === 0 && <EmptyState title="No sessions yet" body="Run a medication session to begin building trend evidence." />}
            {recentCompletions.slice(0, 6).map((completion) => {
              const routine = allRoutines.find((item) => item.id === completion.routineId);
              return (
                <div key={completion.id} className="cg-log-row">
                  <div>
                    <strong>{routine?.name || 'Care session'}</strong>
                    <span>{completion.date} · {completion.stepsCompleted} of {completion.stepsTotal} steps</span>
                  </div>
                  <span className={`cg-status ${completion.status}`}>{completion.status}</span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
      <aside className="cg-side-stack">
        <Section title="Production Readiness">
          <div className="cg-checklist">
            <span><ShieldCheck size={16} /> Supabase RLS target</span>
            <span><Bell size={16} /> Realtime alert model</span>
            <span><CalendarClock size={16} /> Adaptive scheduling ready</span>
            <span><Volume2 size={16} /> ElevenLabs server proxy</span>
          </div>
        </Section>
      </aside>
    </div>
  );

  const renderSettings = () => (
    <div className="cg-content-grid">
      <div className="cg-main-stack">
        <Section title="Production Readiness Console" eyebrow="Caregiver and operator settings">
          <div className="cg-settings-group">
            <h3>Voice and cue quality</h3>
            <div className="cg-settings-list">
              <ReadinessItem icon={<Volume2 size={18} />} label="Patient voice" value={voiceReadinessValue} detail={voiceReadinessDetail} status={voiceReadinessStatus} />
              <ReadinessItem
                icon={<BrainCircuit size={18} />}
                label="AI cue generation"
                value={readiness.ai ? 'Reviewable generation on' : 'Reviewed fallback prompts'}
                detail="Patient prompts stay simple, warm, and non-scolding."
                status={readiness.ai ? 'review' : 'fallback'}
              />
            </div>
          </div>
          <div className="cg-settings-group">
            <h3>Data and monitoring</h3>
            <div className="cg-settings-list">
              <ReadinessItem
                icon={<Database size={18} />}
                label="Care data"
                value={readiness.data ? 'Supabase configured' : 'Local fallback active'}
                detail={readiness.data ? 'Data API remains subject to RLS policies.' : 'Cloud persistence is not configured in this build; browser persistence keeps the care flow usable.'}
                status={readiness.data ? 'ready' : 'fallback'}
              />
              <ReadinessItem
                icon={<Bell size={18} />}
                label="Care monitoring"
                value={alerts.length > 0 ? `${alerts.length} alerts available` : 'Alert model ready'}
                detail="Help, skip, stuck, medication, and completion summaries feed caregiver review."
                status={alerts.length > 0 ? 'ready' : 'review'}
              />
              <ReadinessItem
                icon={<HardDrive size={18} />}
                label="Session events"
                value={readiness.events ? 'Patient actions logged' : 'Run session to verify'}
                detail="Step start, help, skip, done, timing, mood, and summaries are captured."
                status={readiness.events ? 'ready' : 'review'}
              />
            </div>
          </div>
          <div className="cg-settings-group">
            <h3>Privacy and account posture</h3>
            <div className="cg-settings-list">
              <ReadinessItem
                icon={<ShieldCheck size={18} />}
                label="Provider secrets"
                value="Server-only boundary"
                detail="ElevenLabs and AI provider keys are called through /api routes, not browser variables."
                status="ready"
              />
              <ReadinessItem
                icon={<CalendarClock size={18} />}
                label="Notification posture"
                value="In-app alerts first"
                detail="Push/SMS should wait for caregiver preferences, quiet hours, and compliance review."
                status="review"
              />
            </div>
          </div>
        </Section>
      </div>
      <aside className="cg-side-stack">
        <Section title="Voice Check">
          <div className="cg-settings">
            <div className={`cg-voice-status ${voiceReadinessStatus}`}>
              <Volume2 size={18} />
              <div>
                <strong>{voiceReadinessValue}</strong>
                <p>{voiceReadinessDetail}</p>
              </div>
              <button
                type="button"
                disabled={!readiness.voice}
                onClick={() => playAudio('When you are ready, would you like to take your medicine with a sip of water?', 'female', true)}
              >
                Test voice
              </button>
            </div>
            <label>
              <span>Live AI cue generation</span>
              <input type="checkbox" checked={aiConfig.isEnabled} onChange={(event) => setAiConfig({ isEnabled: event.target.checked })} />
            </label>
            <p>AI uses the server-side OpenRouter key only. When AI is disabled or unavailable, CueGuide uses reviewed fallback prompts so patient workflows keep working.</p>
          </div>
        </Section>
      </aside>
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === 'today') return renderToday();
    if (activeTab === 'medications') return renderMedications();
    if (activeTab === 'routines') return renderRoutines();
    if (activeTab === 'session') return renderSession();
    if (activeTab === 'reports') return renderReports();
    return renderSettings();
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
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
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
            <p>{profile?.name || 'Patient'} · {format(new Date(), 'MMM d')}</p>
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
