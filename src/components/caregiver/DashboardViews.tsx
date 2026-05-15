import React from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  Download,
  Edit3,
  HeartPulse,
  HardDrive,
  Pill,
  Plus,
  Save,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { EmptyState, ReadinessItem, Section, StatCard, type CaregiverTone } from './CaregiverPrimitives';
import type { CareAlert, Completion, Medication, PatientProfile, Routine, RoutineStatus, StepCompletion } from '../../types';

export type Tab = 'today' | 'medications' | 'routines' | 'session' | 'reports' | 'settings';
export type MedicationDraft = Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>;
export type VoiceReadinessStatus = 'ready' | 'review' | 'blocked';

interface RefillInfo {
  label: string;
  tone: CaregiverTone;
}

interface ReadinessState {
  voice: boolean;
  ai: boolean;
  data: boolean;
  events: boolean;
}

export interface DashboardFormatters {
  formatStatus: (status: RoutineStatus | string) => string;
  formatEventStatus: (status: StepCompletion['status']) => string;
  formatAlertSeverity: (severity: string) => string;
  getNextDoseLabel: (medication: Medication, currentTime: string) => string;
  getRefillInfo: (medication: Medication) => RefillInfo;
}

export function TodayView({
  nextRoutineIsPastDue,
  nextRoutine,
  nextMedicationRoutine,
  activeMedicationCount,
  activeDoseCount,
  unreadAlertCount,
  needsReviewCount,
  completedTodayCount,
  refillAttentionCount,
  allRoutines,
  sortedRoutines,
  todaysCompletions,
  currentTime,
  alerts,
  overdueRoutines,
  latestVisibleAlerts,
  profile,
  onStartSimulation,
  onNavigate,
  onAcknowledgeAlert,
  formatters,
}: {
  nextRoutineIsPastDue: boolean;
  nextRoutine?: Routine;
  nextMedicationRoutine?: Routine;
  activeMedicationCount: number;
  activeDoseCount: number;
  unreadAlertCount: number;
  needsReviewCount: number;
  completedTodayCount: number;
  refillAttentionCount: number;
  allRoutines: Routine[];
  sortedRoutines: Routine[];
  todaysCompletions: Completion[];
  currentTime: string;
  alerts: CareAlert[];
  overdueRoutines: Routine[];
  latestVisibleAlerts: CareAlert[];
  profile: PatientProfile | null;
  onStartSimulation: (routine: Routine) => void;
  onNavigate: (tab: Tab) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  formatters: Pick<DashboardFormatters, 'formatStatus' | 'formatAlertSeverity'>;
}) {
  return (
    <div className="cg-content-grid">
      <div className="cg-main-stack">
        <section className="cg-command-panel" aria-label="Medication guidance overview">
          <div className="cg-next-primary">
            <p className="cg-eyebrow">{nextRoutineIsPastDue ? 'Past due' : 'Next medication'}</p>
            <h2>{nextRoutine?.name || 'No medication scheduled'}</h2>
            <div className="cg-meta-grid">
              <span><strong>{nextRoutine?.scheduledTime || '--:--'}</strong> Time</span>
              <span><strong>{nextRoutine?.steps.length || 0}</strong> Steps</span>
              <span><strong>{activeMedicationCount}</strong> Active meds</span>
            </div>
            <button className="cg-primary cg-start-button" disabled={!nextMedicationRoutine} onClick={() => nextMedicationRoutine && onStartSimulation(nextMedicationRoutine)}>
              <Pill size={18} /> Start patient session
            </button>
          </div>
          <div className="cg-summary-list" aria-label="Care status summary">
            <button type="button" className="cg-brief-row" onClick={() => onNavigate('medications')}>
              <Pill size={18} />
              <span>
                <strong>Medication list</strong>
                <small>{activeDoseCount} scheduled dose{activeDoseCount === 1 ? '' : 's'} today</small>
              </span>
              <ChevronRight size={16} />
            </button>
            <button type="button" className="cg-brief-row" onClick={() => onNavigate('session')}>
              <Bell size={18} />
              <span>
                <strong>{unreadAlertCount > 0 ? `${unreadAlertCount} alert${unreadAlertCount === 1 ? '' : 's'}` : 'No open alerts'}</strong>
                <small>{needsReviewCount > 0 ? `${needsReviewCount} session${needsReviewCount === 1 ? '' : 's'} need review` : 'Patient events are quiet'}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        <div className="cg-status-strip">
          <StatCard label="Doses" value={`${activeDoseCount}`} note="today" tone="ready" />
          <StatCard label="Confirmed" value={`${completedTodayCount}`} note="patient taps" tone="ready" />
          <StatCard label="Review" value={`${unreadAlertCount + needsReviewCount}`} note="alerts" tone={unreadAlertCount + needsReviewCount > 0 ? 'attention' : 'ready'} />
          <StatCard label="Refills" value={`${refillAttentionCount}`} note="soon" tone={refillAttentionCount > 0 ? 'attention' : 'muted'} />
        </div>

        <Section title="Today’s Schedule">
          <div className="cg-schedule">
            {allRoutines.length === 0 && (
              <EmptyState
                title="No care sessions scheduled yet"
                body="Add a medication time to create the first patient-ready session."
                action={<button className="cg-secondary" onClick={() => onNavigate('medications')}>Add medication</button>}
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
                    <span>{routine.category === 'medication' ? 'Medication' : 'Routine'} · {routine.steps.length} steps</span>
                  </div>
                  <span className={`cg-status ${routineStatus}`}>{formatters.formatStatus(routineStatus)}</span>
                  <button className="cg-secondary" onClick={() => onStartSimulation(routine)}>Start</button>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <aside className="cg-side-stack">
        <Section title="Attention">
          <div className="cg-alert-list">
            {alerts.length === 0 && (
              <EmptyState title="No alerts" body="Help, skipped steps, and long pauses will appear here." />
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
              <button key={alert.id} className={`cg-alert ${alert.status}`} onClick={() => onAcknowledgeAlert(alert.id)}>
                <Bell size={16} />
                <span>
                  <strong>{alert.title}</strong>
                  <small>{alert.message}</small>
                  <em>{formatters.formatAlertSeverity(alert.severity)} · {alert.status === 'unread' ? 'Tap to acknowledge' : 'Acknowledged'}</em>
                </span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Patient">
          <div className="cg-profile">
            <div className="cg-avatar"><HeartPulse size={30} /></div>
            <strong>{profile?.name}</strong>
            <span>Stage: {profile?.stage}</span>
            <p>{profile?.context}</p>
          </div>
        </Section>
      </aside>
    </div>
  );
}

export function MedicationsView({
  medications,
  currentTime,
  isAddingMedication,
  editingMedicationId,
  draftMedication,
  formErrors,
  lastSaveError,
  onStartAddMedication,
  onEditMedication,
  onToggleMedication,
  onMedicationChange,
  onResetMedicationForm,
  onSaveMedication,
  formatters,
}: {
  medications: Medication[];
  currentTime: string;
  isAddingMedication: boolean;
  editingMedicationId: string | null;
  draftMedication: MedicationDraft;
  formErrors: Record<string, string>;
  lastSaveError: string | null;
  onStartAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  onToggleMedication: (medicationId: string) => void;
  onMedicationChange: (field: keyof MedicationDraft, value: string | string[] | boolean) => void;
  onResetMedicationForm: () => void;
  onSaveMedication: () => void;
  formatters: Pick<DashboardFormatters, 'getNextDoseLabel' | 'getRefillInfo'>;
}) {
  return (
    <div className="cg-main-stack">
      <Section
        title="Medications"
        action={
          <button className="cg-primary" onClick={onStartAddMedication}>
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
              body="Add a medication with pill appearance, schedule, and instructions."
              action={<button className="cg-secondary" onClick={onStartAddMedication}>Add medication</button>}
            />
          )}
          {medications.map((medication) => {
            const refill = formatters.getRefillInfo(medication);
            return (
              <article key={medication.id} className={`cg-med-row ${!medication.isActive ? 'inactive' : ''}`}>
                <div className="cg-med-name">
                  <div className={`cg-pill ${medication.pillColor}`} />
                  <div>
                    <h3>{medication.name}</h3>
                    <p>{medication.dosage} · {medication.pillShape} {medication.pillColor}</p>
                    {medication.location && <small>{medication.location}</small>}
                  </div>
                </div>
                <div className="cg-med-purpose">
                  <strong>{medication.purpose}</strong>
                  {medication.instructions && <small>{medication.instructions}</small>}
                </div>
                <div className="cg-med-schedule">
                  <strong>{formatters.getNextDoseLabel(medication, currentTime)}</strong>
                  <div className="cg-chip-row" aria-label={`${medication.name} times`}>
                    {medication.times.map((time) => <span key={time}>{time}</span>)}
                  </div>
                </div>
                <div className="cg-refill-cell">
                  <span className={`cg-refill ${refill.tone}`}>{refill.label}</span>
                </div>
                <div className="cg-row-actions">
                  <button className="cg-toggle" onClick={() => onToggleMedication(medication.id)}>
                    {medication.isActive ? 'On' : 'Off'}
                  </button>
                  <button className="cg-secondary" onClick={() => onEditMedication(medication)}>
                    <Edit3 size={15} /> Edit
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
                  <input value={draftMedication.name} onChange={(event) => onMedicationChange('name', event.target.value)} placeholder="Medication name" />
                  {formErrors.name && <small className="cg-field-error">{formErrors.name}</small>}
                </label>
                <label>
                  <span>Dosage</span>
                  <input value={draftMedication.dosage} onChange={(event) => onMedicationChange('dosage', event.target.value)} placeholder="Dosage, e.g. 10 mg" />
                  {formErrors.dosage && <small className="cg-field-error">{formErrors.dosage}</small>}
                </label>
              </div>
              <label>
                <span>Purpose for caregiver review</span>
                <input value={draftMedication.purpose} onChange={(event) => onMedicationChange('purpose', event.target.value)} placeholder="Plain-language purpose" />
                {formErrors.purpose && <small className="cg-field-error">{formErrors.purpose}</small>}
              </label>
            </div>

            <div className="cg-form-block">
              <strong>Patient recognition cues</strong>
              <div className="cg-form-row">
                <label>
                  <span>Pill color</span>
                  <input value={draftMedication.pillColor} onChange={(event) => onMedicationChange('pillColor', event.target.value)} placeholder="Pill color" />
                </label>
                <label>
                  <span>Pill shape</span>
                  <input value={draftMedication.pillShape} onChange={(event) => onMedicationChange('pillShape', event.target.value)} placeholder="Pill shape" />
                </label>
              </div>
              <label>
                <span>Patient location cue</span>
                <input value={draftMedication.location} onChange={(event) => onMedicationChange('location', event.target.value)} placeholder="Where the patient finds it" />
              </label>
            </div>

            <div className="cg-form-block">
              <strong>Schedule and caregiver notes</strong>
              <label>
                <span>Schedule times</span>
                <input value={draftMedication.times.join(', ')} onChange={(event) => onMedicationChange('times', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="Times, comma separated" />
                {formErrors.times && <small className="cg-field-error">{formErrors.times}</small>}
              </label>
              <label>
                <span>Refill date</span>
                <input type="date" value={draftMedication.refillDate || ''} onChange={(event) => onMedicationChange('refillDate', event.target.value)} />
              </label>
              <label>
                <span>Caregiver instructions</span>
                <textarea value={draftMedication.instructions} onChange={(event) => onMedicationChange('instructions', event.target.value)} placeholder="Caregiver notes or instructions" />
              </label>
            </div>
            <div className="cg-form-actions">
              <button className="cg-secondary" onClick={onResetMedicationForm}>Cancel</button>
              <button className="cg-primary" onClick={onSaveMedication}>
                <Save size={16} /> {editingMedicationId ? 'Update medication' : 'Save medication'}
              </button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

export function RoutinesView({
  allRoutines,
  onStartSimulation,
}: {
  allRoutines: Routine[];
  onStartSimulation: (routine: Routine) => void;
}) {
  return (
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
}

export function SessionView({
  latestCompletion,
  latestRoutine,
  latestSessionEvents,
  nextMedicationRoutine,
  profile,
  sessionStatusNote,
  onStartSimulation,
  formatters,
}: {
  latestCompletion?: Completion;
  latestRoutine?: Routine;
  latestSessionEvents: StepCompletion[];
  nextMedicationRoutine?: Routine;
  profile: PatientProfile | null;
  sessionStatusNote: string;
  onStartSimulation: (routine: Routine) => void;
  formatters: Pick<DashboardFormatters, 'formatStatus' | 'formatEventStatus'>;
}) {
  return (
    <Section title="Patient Session">
      {latestCompletion ? (
        <div className="cg-session-layout">
          <div className="cg-session-summary">
            <div>
              <p className="cg-eyebrow">Latest session</p>
              <h2>{latestRoutine?.name || 'Medication session'}</h2>
              <p>{sessionStatusNote}</p>
              <div className="cg-safety-note">
                <ShieldCheck size={18} />
                <span>
                  <strong>Confirmation limit</strong>
                  <small>{profile?.preferredName || 'The patient'} pressing Done means the prompt was confirmed in CueGuide. It is not proof the pill was swallowed.</small>
                </span>
              </div>
            </div>
            <div className="cg-session-metrics">
              <StatCard label="Status" value={formatters.formatStatus(latestCompletion.status)} note="caregiver only" tone={latestCompletion.status === 'completed' ? 'ready' : 'attention'} />
              <StatCard label="Steps" value={`${latestCompletion.stepsCompleted}/${latestCompletion.stepsTotal}`} note={`${latestCompletion.minutes} min`} tone="muted" />
              <StatCard label="Help" value={`${latestSessionEvents.filter((event) => event.status === 'help_requested').length}`} note="patient-tapped help events" tone={latestSessionEvents.some((event) => event.status === 'help_requested') ? 'attention' : 'ready'} />
              <StatCard label="Skipped" value={`${latestSessionEvents.filter((event) => event.status === 'skipped').length}`} note="steps for caregiver review" tone={latestSessionEvents.some((event) => event.status === 'skipped') ? 'attention' : 'ready'} />
            </div>
            <button className="cg-primary" disabled={!nextMedicationRoutine} onClick={() => nextMedicationRoutine && onStartSimulation(nextMedicationRoutine)}>Start next session</button>
          </div>
          <div className="cg-timeline" aria-label="Latest patient action timeline">
            {latestSessionEvents.length === 0 && <p>No detailed step events were logged for this session.</p>}
            {latestSessionEvents.slice(-8).map((event) => (
              <div key={`${event.stepId}-${event.status}-${event.completedAt || event.startedAt}`} className={`cg-timeline-item ${event.status}`}>
                <span>{formatters.formatEventStatus(event.status)}</span>
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
          <p>Start a scheduled routine to see help, skip, done, and timing events.</p>
          <button className="cg-primary" disabled={!nextMedicationRoutine} onClick={() => nextMedicationRoutine && onStartSimulation(nextMedicationRoutine)}>Start next session</button>
        </div>
      )}
    </Section>
  );
}

export function ReportsView({
  medicationCompletions,
  adherenceRate,
  adherenceLabel,
  helpEvents,
  skippedEvents,
  topMood,
  activeMedicationCount,
  medTimeCount,
  refillAttentionCount,
  unreadAlertCount,
  alertCount,
  recentCompletions,
  allRoutines,
  formatters,
}: {
  medicationCompletions: Completion[];
  adherenceRate: number;
  adherenceLabel: string;
  helpEvents: StepCompletion[];
  skippedEvents: StepCompletion[];
  topMood: string;
  activeMedicationCount: number;
  medTimeCount: number;
  refillAttentionCount: number;
  unreadAlertCount: number;
  alertCount: number;
  recentCompletions: Completion[];
  allRoutines: Routine[];
  formatters: Pick<DashboardFormatters, 'formatStatus'>;
}) {
  const completedMedicationCount = medicationCompletions.filter((completion) => completion.status === 'completed').length;

  return (
    <div className="cg-content-grid cg-reports-layout">
      <div className="cg-main-stack">
        <Section title="Care Review">
          <div className="cg-report-lead">
            <div>
              <p className="cg-eyebrow">Current signal</p>
              <h3>{medicationCompletions.length < 2 ? 'Trend evidence is still building' : `${adherenceRate}% medication-session adherence`}</h3>
              <p>
                {medicationCompletions.length < 2
                  ? 'Run more medication sessions before treating this as a trend.'
                  : `${completedMedicationCount} of ${medicationCompletions.length} recent medication sessions were completed.`}
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
              <small>{medicationCompletions.length < 2 ? 'Needs more sessions' : 'recent sessions'}</small>
            </div>
            <div className="cg-report-card">
              <Bell size={22} />
              <span>Help requests</span>
              <strong>{helpEvents.length}</strong>
              <small>patient tapped Help</small>
            </div>
            <div className="cg-report-card">
              <ClipboardList size={22} />
              <span>Skipped steps</span>
              <strong>{skippedEvents.length}</strong>
              <small>caregiver review</small>
            </div>
            <div className="cg-report-card">
              <HeartPulse size={22} />
              <span>Common mood</span>
              <strong>{topMood}</strong>
              <small>session mood</small>
            </div>
          </div>
          <div className="cg-safety-note cg-report-safety-note">
            <ShieldCheck size={18} />
            <span>
              <strong>Confirmation limit</strong>
              <small>Done is patient confirmation only. Treat missed, Help, and Skip events as caregiver review signals, not medical proof.</small>
            </span>
          </div>
          <div className="cg-insight-list">
            <div>
              <strong>Medication review</strong>
              <p>{activeMedicationCount} active medications across {medTimeCount} scheduled time{medTimeCount === 1 ? '' : 's'}; {refillAttentionCount} refill item{refillAttentionCount === 1 ? '' : 's'} need attention.</p>
            </div>
            <div>
              <strong>Caregiver attention</strong>
              <p>{unreadAlertCount} unread alert{unreadAlertCount === 1 ? '' : 's'} and {alertCount} total alert{alertCount === 1 ? '' : 's'} available for review.</p>
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
                  <span className={`cg-status ${completion.status}`}>{formatters.formatStatus(completion.status)}</span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
      <aside className="cg-side-stack">
        <Section title="Review Next">
          <div className="cg-checklist">
            <span><Pill size={16} /> Confirm the next scheduled dose</span>
            <span><Bell size={16} /> Review any Help or Skip events</span>
            <span><HeartPulse size={16} /> Watch mood after medication prompts</span>
            <span><Volume2 size={16} /> Accept voice tone after hearing test</span>
          </div>
        </Section>
      </aside>
    </div>
  );
}

export function SettingsView({
  voiceReviewReady,
  readiness,
  voiceReadinessValue,
  voiceReadinessDetail,
  voiceReviewStatus,
  voicePrompts,
  alertCount,
  aiEnabled,
  onPlayPrimaryVoice,
  onPlayVoicePrompt,
  onMarkVoiceAccepted,
  onResetVoiceReview,
  onToggleAI,
  onExportLocalData,
}: {
  voiceReviewReady: boolean;
  readiness: ReadinessState;
  voiceReadinessValue: string;
  voiceReadinessDetail: string;
  voiceReviewStatus: VoiceReadinessStatus;
  voicePrompts: string[];
  alertCount: number;
  aiEnabled: boolean;
  onPlayPrimaryVoice: () => void;
  onPlayVoicePrompt: (prompt: string) => void;
  onMarkVoiceAccepted: () => void;
  onResetVoiceReview: () => void;
  onToggleAI: (enabled: boolean) => void;
  onExportLocalData: () => void;
}) {
  return (
    <div className="cg-main-stack">
      <Section title="Settings" eyebrow="Voice, data, alerts, privacy">
        <div className="cg-settings-summary">
          <div>
            <p className="cg-eyebrow">Care loop</p>
            <h3>{voiceReviewReady && readiness.events ? 'Ready for review' : 'Needs final checks'}</h3>
            <p>Voice, data, AI, alerts, and privacy are tracked here.</p>
          </div>
          <button className="cg-primary" disabled={!readiness.voice} onClick={onPlayPrimaryVoice}>
            <Volume2 size={17} /> Play primary voice
          </button>
        </div>

        <div className="cg-settings-board">
          <div className="cg-settings-group">
            <h3>Voice</h3>
            <div className="cg-settings-list">
              <ReadinessItem icon={<Volume2 size={18} />} label="Patient voice" value={voiceReadinessValue} detail={voiceReadinessDetail} status={voiceReviewStatus} />
              <div className={`cg-voice-status ${voiceReviewStatus}`}>
                <Volume2 size={18} />
                <div>
                  <strong>Google Maps voice standard</strong>
                  <p>Human, soft, gentle, and non-commanding.</p>
                </div>
                <div className="cg-voice-prompts">
                  {voicePrompts.map((prompt, index) => (
                    <button key={prompt} type="button" disabled={!readiness.voice} onClick={() => onPlayVoicePrompt(prompt)}>
                      Sample {index + 1}
                    </button>
                  ))}
                </div>
                <div className="cg-voice-review-actions">
                  <button type="button" disabled={!readiness.voice} onClick={onMarkVoiceAccepted}>Mark accepted</button>
                  <button type="button" onClick={onResetVoiceReview}>Reset</button>
                </div>
              </div>
            </div>
          </div>

          <div className="cg-settings-group">
            <h3>Data</h3>
            <div className="cg-settings-list">
              <ReadinessItem
                icon={<Database size={18} />}
                label="Care data"
                value={readiness.data ? 'Supabase configured' : 'Local fallback active'}
                detail={readiness.data ? 'Cloud env is present. Authenticated save/load proof still needs evidence.' : 'Local browser persistence is active. Cloud production proof is still pending.'}
                status={readiness.data ? 'review' : 'fallback'}
              />
              <ReadinessItem
                icon={<HardDrive size={18} />}
                label="Local backup"
                value="Export available"
                detail="Download patient, medication, completion, alert, and voice-review data stored in this browser."
                status={readiness.events ? 'ready' : 'review'}
              />
              <div className="cg-data-actions">
                <button type="button" onClick={onExportLocalData}>
                  <Download size={16} /> Export local backup
                </button>
                <small>Use before device changes or stakeholder testing in local fallback mode.</small>
              </div>
            </div>
          </div>

          <div className="cg-settings-group">
            <h3>AI and alerts</h3>
            <div className="cg-settings-list">
              <ReadinessItem
                icon={<BrainCircuit size={18} />}
                label="AI cue generation"
                value={readiness.ai ? 'Reviewable generation on' : 'Reviewed fallback prompts'}
                detail="Cue text stays short and warm. AI does not change schedules or create urgency autonomously."
                status={readiness.ai ? 'review' : 'fallback'}
              />
              <ReadinessItem
                icon={<Bell size={18} />}
                label="Care monitoring"
                value={alertCount > 0 ? `${alertCount} alerts available` : 'Alert model ready'}
                detail="Help, skip, stuck, and completion summaries."
                status={alertCount > 0 ? 'ready' : 'review'}
              />
            </div>
            <label className="cg-ai-toggle">
              <span>Live AI cue generation</span>
              <input type="checkbox" checked={aiEnabled} onChange={(event) => onToggleAI(event.target.checked)} />
            </label>
          </div>

          <div className="cg-settings-group">
            <h3>Privacy</h3>
            <div className="cg-settings-list">
              <ReadinessItem
                icon={<ShieldCheck size={18} />}
                label="Provider secrets"
                value="Server-only boundary"
                detail="ElevenLabs and AI keys stay behind /api routes."
                status="ready"
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
