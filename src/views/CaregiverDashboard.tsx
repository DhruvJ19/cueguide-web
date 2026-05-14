import React, { useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Database,
  Edit3,
  FileText,
  HeartPulse,
  HardDrive,
  LayoutDashboard,
  Moon,
  Pill,
  Plus,
  Radio,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sun,
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
import type { Medication, Routine } from '../types';

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

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="cg-section">
      <div className="cg-section-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="cg-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
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
  const latestCompletion = [...todaysCompletions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const latestRoutine = latestCompletion ? allRoutines.find((routine) => routine.id === latestCompletion.routineId) : undefined;
  const recentCompletions = completions.slice(0, 30);
  const medicationCompletions = recentCompletions.filter((completion) =>
    allRoutines.find((routine) => routine.id === completion.routineId)?.category === 'medication'
  );
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
  const voiceReadinessStatus: 'ready' | 'blocked' = readiness.voice ? 'ready' : 'blocked';
  const voiceReadinessValue = readiness.voice
    ? 'ElevenLabs active'
    : config.elevenlabs.enabled
      ? 'ElevenLabs blocked'
      : 'ElevenLabs required';
  const voiceReadinessDetail = readiness.voice
    ? `${voiceStatus.selectedVoiceName || 'Production voice'} is verified through the server proxy.`
    : voiceStatus.message;

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
        <div className="cg-hero">
          <div>
            <p className="cg-eyebrow">Care plan for {profile?.preferredName || 'patient'}</p>
            <h1>Medication guidance and routine monitoring for today.</h1>
            <p>
              {profile?.name || 'The patient'} has {activeMedications.length} active medications and {allRoutines.length}{' '}
              scheduled care routines.
            </p>
          </div>
          <button className="cg-primary" disabled={!medicationRoutines[0]} onClick={() => medicationRoutines[0] && onStartSimulation(medicationRoutines[0])}>
            <Pill size={18} /> Start medication session
          </button>
        </div>

        <div className="cg-stats-grid">
          <StatCard label="Medication doses" value={`${activeMedications.reduce((sum, med) => sum + med.times.length, 0)}`} note="scheduled today" />
          <StatCard label="Completed routines" value={`${todaysCompletions.filter((item) => item.status === 'completed').length}`} note="logged today" />
          <StatCard label="Care alerts" value={`${unreadAlerts.length}`} note="need review" />
        </div>

        <Section title="Today's Schedule">
          <div className="cg-schedule">
            {allRoutines.length === 0 && (
              <EmptyState
                title="No care sessions scheduled yet"
                body="Add a medication time to create the first patient-ready session automatically."
                action={<button className="cg-secondary" onClick={() => setActiveTab('medications')}>Add medication</button>}
              />
            )}
            {allRoutines.map((routine) => {
              const completion = todaysCompletions.find((item) => item.routineId === routine.id);
              return (
                <div key={routine.id} className="cg-schedule-row">
                  <div className="cg-time">{routine.scheduledTime}</div>
                  <div className="cg-schedule-body">
                    <strong>{routine.name}</strong>
                    <span>{routine.steps.length} guided steps</span>
                  </div>
                  <span className={`cg-status ${completion?.status || 'upcoming'}`}>{completion?.status || 'upcoming'}</span>
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
        <Section title="Alert Feed">
          <div className="cg-alert-list">
            {alerts.length === 0 && (
              <EmptyState title="No alerts yet" body="Help requests, skipped steps, longer-than-usual steps, and completion summaries will appear here." />
            )}
            {alerts.slice(0, 6).map((alert) => (
              <button key={alert.id} className={`cg-alert ${alert.status}`} onClick={() => acknowledgeAlert(alert.id)}>
                <Bell size={16} />
                <span>
                  <strong>{alert.title}</strong>
                  <small>{alert.message}</small>
                </span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Patient Profile">
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
    <div className="cg-content-grid">
      <Section
        title="Medication List"
        action={
          <button className="cg-primary" onClick={startAddMedication}>
            <Plus size={16} /> Add medication
          </button>
        }
      >
        <div className="cg-med-grid">
          {medications.length === 0 && (
            <EmptyState
              title="No medications entered"
              body="Add the first medication with pill appearance, schedule, purpose, and instructions."
              action={<button className="cg-secondary" onClick={startAddMedication}>Add medication</button>}
            />
          )}
          {medications.map((medication) => (
            <article key={medication.id} className={`cg-med-card ${!medication.isActive ? 'inactive' : ''}`}>
              <div className="cg-med-top">
                <div className={`cg-pill ${medication.pillColor}`} />
                <button className="cg-toggle" onClick={() => toggleMedication(medication.id)}>
                  {medication.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <h3>{medication.name}</h3>
              <p>{medication.dosage} · {medication.pillShape} {medication.pillColor}</p>
              <p>{medication.purpose}</p>
              <div className="cg-chip-row">
                {medication.times.map((time) => <span key={time}>{time}</span>)}
              </div>
              {medication.refillDate && <small>Refill by {medication.refillDate}</small>}
              <button className="cg-secondary cg-card-action" onClick={() => startEditMedication(medication)}>
                <Edit3 size={15} /> Edit medication
              </button>
            </article>
          ))}
        </div>
        {lastSaveError && <p className="cg-warning-note">{lastSaveError}</p>}
      </Section>

      {isAddingMedication && (
        <Section title={editingMedicationId ? 'Edit Medication' : 'Add Medication'}>
          <div className="cg-form">
            <input value={draftMedication.name} onChange={(event) => handleMedicationChange('name', event.target.value)} placeholder="Medication name" />
            {formErrors.name && <small className="cg-field-error">{formErrors.name}</small>}
            <input value={draftMedication.dosage} onChange={(event) => handleMedicationChange('dosage', event.target.value)} placeholder="Dosage, e.g. 10 mg" />
            {formErrors.dosage && <small className="cg-field-error">{formErrors.dosage}</small>}
            <input value={draftMedication.purpose} onChange={(event) => handleMedicationChange('purpose', event.target.value)} placeholder="Plain-language purpose" />
            {formErrors.purpose && <small className="cg-field-error">{formErrors.purpose}</small>}
            <div className="cg-form-row">
              <input value={draftMedication.pillColor} onChange={(event) => handleMedicationChange('pillColor', event.target.value)} placeholder="Pill color" />
              <input value={draftMedication.pillShape} onChange={(event) => handleMedicationChange('pillShape', event.target.value)} placeholder="Pill shape" />
            </div>
            <input value={draftMedication.times.join(', ')} onChange={(event) => handleMedicationChange('times', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="Times, comma separated" />
            {formErrors.times && <small className="cg-field-error">{formErrors.times}</small>}
            <input value={draftMedication.location} onChange={(event) => handleMedicationChange('location', event.target.value)} placeholder="Where the patient finds it" />
            <textarea value={draftMedication.instructions} onChange={(event) => handleMedicationChange('instructions', event.target.value)} placeholder="Caregiver notes or instructions" />
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
    <Section title="Live Patient Session">
      {latestCompletion ? (
        <div className="cg-session-summary">
          <div>
            <p className="cg-eyebrow">Most recent patient session</p>
            <h2>{latestRoutine?.name || 'Medication session'}</h2>
            <p>{latestCompletion.stepsCompleted} of {latestCompletion.stepsTotal} steps completed in about {latestCompletion.minutes} minute{latestCompletion.minutes === 1 ? '' : 's'}.</p>
          </div>
          <div className="cg-session-metrics">
            <StatCard label="Session status" value={latestCompletion.status} note="caregiver language only" />
            <StatCard label="Step events" value={`${latestCompletion.stepEvents?.length || 0}`} note="patient actions logged" />
          </div>
          <div className="cg-event-list">
            {(latestCompletion.stepEvents || []).slice(-6).map((event) => (
              <span key={`${event.stepId}-${event.status}-${event.completedAt || event.startedAt}`}>
                {event.status.replace('_', ' ')} · {Math.max(1, event.elapsedSeconds)}s
              </span>
            ))}
          </div>
          <button className="cg-primary" onClick={() => medicationRoutines[0] && onStartSimulation(medicationRoutines[0])}>Start next medication session</button>
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
      <Section title="Weekly Care Summary">
        <div className="cg-report-grid">
          <div className="cg-report-card">
            <CheckCircle2 size={22} />
            <span>Medication adherence</span>
            <strong>{adherenceRate}%</strong>
            <small>completed medication sessions in recent history</small>
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
            <p>{activeMedications.length} active medications across {medTimes.length} scheduled time{medTimes.length === 1 ? '' : 's'}.</p>
          </div>
          <div>
            <strong>Caregiver attention</strong>
            <p>{unreadAlerts.length} unread alert{unreadAlerts.length === 1 ? '' : 's'} and {alerts.length} total alert{alerts.length === 1 ? '' : 's'} available for review.</p>
          </div>
        </div>
      </Section>
      <Section title="Production Readiness">
        <div className="cg-checklist">
          <span><ShieldCheck size={16} /> Supabase RLS target</span>
          <span><Bell size={16} /> Realtime alert model</span>
          <span><CalendarClock size={16} /> Adaptive scheduling ready</span>
          <span><Volume2 size={16} /> ElevenLabs server proxy</span>
        </div>
      </Section>
    </div>
  );

  const renderSettings = () => (
    <div className="cg-content-grid">
      <div className="cg-main-stack">
        <Section title="Production Readiness">
          <div className="cg-readiness-grid">
            <ReadinessItem
              icon={<Volume2 size={18} />}
              label="Patient voice"
              value={voiceReadinessValue}
              detail={voiceReadinessDetail}
              status={voiceReadinessStatus}
            />
            <ReadinessItem
              icon={<BrainCircuit size={18} />}
              label="AI cue generation"
              value={readiness.ai ? 'Reviewable generation on' : 'Reviewed fallback prompts'}
              detail="Patient prompts stay simple, warm, and non-scolding."
              status={readiness.ai ? 'review' : 'fallback'}
            />
            <ReadinessItem
              icon={<Database size={18} />}
              label="Care data"
              value={readiness.data ? 'Supabase configured' : 'Local demo fallback'}
              detail={readiness.data ? 'Data API remains subject to RLS policies.' : 'Demo flow stays usable if cloud config is absent.'}
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
        </Section>
      </div>
      <aside className="cg-side-stack">
        <Section title="Settings">
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
      <aside className="cg-nav">
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
      </aside>

      <main className="cg-main">
        <header className="cg-topbar">
          <div>
            <p>{format(new Date(), 'EEEE, MMMM d')}</p>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
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
