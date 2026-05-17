import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, HelpCircle, SkipForward, Volume2 } from 'lucide-react';
import { generateCueData } from '../services/ai';
import { getPatientAudioNotice, playAudio } from '../utils/audio';
import { createCareAlertsFromStepEvents } from '../services/careAlerts';
import {
  advanceFocusStep,
  buildFocusStepEvent,
  countCompletedSteps,
  getFocusCompletionStatus,
} from '../services/focusSession';
import { useAlertStore } from '../store/alertStore';
import { usePatientStore } from '../store/patientStore';
import { useSettingsStore } from '../store/settingsStore';
import type { AICueData, Routine, StepCompletion } from '../types';

interface Props {
  routine: Routine;
  onComplete: (
    status: 'completed' | 'partial' | 'missed',
    minutes: number,
    stepsCompleted: number,
    mood?: string,
    stepEvents?: StepCompletion[],
    aiPromptsUsed?: AICueData['steps']
  ) => void;
  onExit: () => void;
}

type FocusState = 'loading' | 'greeting' | 'step' | 'mood' | 'finished';

interface PatientGreetingCopy {
  title: string;
  detail: string;
}

function splitSentences(value: string): string[] {
  const matches = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!matches) return [];
  return matches.map((sentence) => sentence.trim()).filter(Boolean);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lowerFirstCharacter(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function getRoutineLabel(routineName: string): string {
  return routineName.replace(/\s*\(\d+\)\s*$/, '').trim().toLowerCase() || 'medication guide';
}

function buildGreetingCopy(greeting: string | undefined, preferredName: string, routineName: string): PatientGreetingCopy {
  const fallbackTitle = 'Good morning.';
  const fallbackDetail = `${preferredName}, your ${getRoutineLabel(routineName)} is ready. We will go one step at a time.`;
  if (!greeting?.trim()) return { title: fallbackTitle, detail: fallbackDetail };

  const sentences = splitSentences(greeting.trim());
  if (sentences.length === 0) return { title: fallbackTitle, detail: fallbackDetail };

  const rawTitle = sentences[0];
  const title = rawTitle.replace(new RegExp(`,\\s*${escapeRegExp(preferredName)}\\.?$`, 'i'), '.');
  const detailText = sentences.slice(1).join(' ').trim();
  const detail = detailText.includes('one step at a time')
    ? `${preferredName}, ${lowerFirstCharacter(detailText)}`
    : fallbackDetail;
  return { title, detail };
}

export default function PatientFocusMode({ routine, onComplete, onExit }: Props) {
  const { profile } = usePatientStore();
  const { aiConfig } = useSettingsStore();
  const { addAlerts } = useAlertStore();
  const [focusState, setFocusState] = useState<FocusState>('loading');
  const [cueData, setCueData] = useState<AICueData | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStartedAt, setStepStartedAt] = useState(new Date().toISOString());
  const [stepEvents, setStepEvents] = useState<StepCompletion[]>([]);
  const [helpText, setHelpText] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [startedAt] = useState(Date.now());

  const currentStep = routine.steps[currentStepIndex];
  const currentCue = cueData?.steps[currentStepIndex];
  const patientStepGuidance = helpText || (currentStep?.medicationId ? currentCue?.help_text || currentStep.helpText : null);
  const greetingCopy = buildGreetingCopy(cueData?.greeting, profile?.preferredName || 'there', routine.name);
  const patientRoutineLabel = routine.category === 'medication' ? 'Medication guide' : routine.name;

  const promptContext = useMemo(() => {
    const today = new Date();
    return {
      patientName: profile?.name || 'Patient',
      preferredName: profile?.preferredName || 'there',
      routineName: routine.name,
      steps: routine.steps,
      context: {
        day: today.toLocaleDateString('en-US', { weekday: 'long' }),
        date: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        weather: 'calm and clear',
        upcoming: `${profile?.primaryCaregiverName || 'Your caregiver'} will check in later today`,
        notes: profile?.context || '',
      },
    };
  }, [profile, routine]);

  useEffect(() => {
    let isMounted = true;
    async function loadCue() {
      const data = await generateCueData(promptContext, aiConfig);
      if (!isMounted) return;
      setCueData(data);
      setFocusState('greeting');
    }
    loadCue();
    return () => {
      isMounted = false;
      window.speechSynthesis?.cancel();
    };
  }, [aiConfig, profile?.preferences.voice, promptContext]);

  useEffect(() => {
    if (focusState !== 'step' || !currentStep) return;
    const timer = window.setTimeout(() => {
      const event = buildStepEvent('stuck');
      setStepEvents((events) => {
        if (events.some((item) => item.stepId === event.stepId && item.status === 'stuck')) return events;
        const next = [...events, event];
        addAlerts(createCareAlertsFromStepEvents([event], {
          patientName: profile?.preferredName || 'The patient',
          routineName: routine.name,
        }));
        return next;
      });
    }, 300000);
    return () => window.clearTimeout(timer);
  }, [focusState, currentStep?.id, stepStartedAt]);

  if (!profile) return <div className="patient-shell">Loading profile...</div>;

  function buildStepEvent(status: StepCompletion['status']): StepCompletion {
    const completedAt = new Date().toISOString();
    return buildFocusStepEvent({
      status,
      step: currentStep,
      routineId: routine.id,
      patientId: profile.id || routine.patientId,
      startedAt: stepStartedAt,
      completedAt,
    });
  }

  function moveToNextStep(newEvent?: StepCompletion) {
    if (newEvent) {
      addAlerts(createCareAlertsFromStepEvents([newEvent], {
        patientName: profile.preferredName,
        routineName: routine.name,
      }));
    }
    const nextStartedAt = new Date().toISOString();
    const transition = advanceFocusStep({
      events: stepEvents,
      currentStepIndex,
      steps: routine.steps,
      routineId: routine.id,
      patientId: profile.id || routine.patientId,
      newEvent,
      nextStartedAt,
    });
    setHelpText(null);
    setAudioNotice(null);
    setStepEvents(transition.events);
    setCurrentStepIndex(transition.currentStepIndex);
    setStepStartedAt(transition.stepStartedAt);
    setFocusState(transition.focusState);
  }

  function handleDone() {
    moveToNextStep(buildStepEvent('completed'));
  }

  function handleSkip() {
    moveToNextStep(buildStepEvent('skipped'));
  }

  function handleHelp() {
    const event = buildStepEvent('help_requested');
    setStepEvents((events) => [...events, event]);
    addAlerts(createCareAlertsFromStepEvents([event], {
      patientName: profile.preferredName,
      routineName: routine.name,
    }));
    const text = currentCue?.help_text || currentStep.helpText || 'Take your time. Do the next small action when you are ready.';
    setAudioNotice(null);
    setHelpText(text);
  }

  async function handleReadAloud() {
    const text = helpText || currentCue?.audio_text || currentCue?.text || currentStep.instruction;
    setAudioNotice('Reading aloud now.');
    const result = await playAudio(text, profile.preferences.voice, true);
    setAudioNotice(getPatientAudioNotice(result));
  }

  function finishWithMood(mood: string) {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const finalCompleted = countCompletedSteps(stepEvents);
    const status = getFocusCompletionStatus(stepEvents, routine.steps.length);
    setFocusState('finished');
    window.setTimeout(() => onComplete(status, minutes, finalCompleted, mood, stepEvents, cueData?.steps || []), 1200);
  }

  if (focusState === 'loading') {
    return (
      <div className="patient-shell">
        <div className="patient-panel patient-loading-panel">
          <p className="patient-kicker">Preparing guide</p>
          <h1>One moment.</h1>
        </div>
      </div>
    );
  }

  if (focusState === 'greeting') {
    return (
      <div className="patient-shell patient-shell-greeting">
        <button className="patient-exit" onClick={onExit}><ArrowLeft size={22} /> Caregiver view</button>
        <div className="patient-panel patient-greeting-panel">
          <p className="patient-kicker">{patientRoutineLabel}</p>
          <h1>{greetingCopy.title}</h1>
          <p className="patient-subtitle">{greetingCopy.detail}</p>
          <div className="patient-start-meta" aria-label="Session details">
            <span>{routine.steps.length} step{routine.steps.length === 1 ? '' : 's'}</span>
            <span>No rush</span>
          </div>
          <button className="patient-primary" onClick={() => {
            const startedAt = new Date().toISOString();
            setFocusState('step');
            setStepStartedAt(startedAt);
            setStepEvents([buildFocusStepEvent({
              status: 'started',
              step: routine.steps[0],
              routineId: routine.id,
              patientId: profile.id || routine.patientId,
              startedAt,
              completedAt: startedAt,
            })]);
          }}>
            Begin
          </button>
        </div>
      </div>
    );
  }

  if (focusState === 'mood') {
    return (
      <div className="patient-shell">
        <div className="patient-panel patient-centered">
          <p className="patient-kicker">All set</p>
          <h1>{cueData?.encouragement || 'Thank you for taking care of yourself.'}</h1>
          <div className="patient-moods">
            {['Good', 'Okay', 'Tired', 'Unsure'].map((mood) => (
              <button key={mood} onClick={() => finishWithMood(mood)}>{mood}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (focusState === 'finished') {
    return (
      <div className="patient-shell">
        <div className="patient-panel patient-centered">
          <Check size={60} />
          <h1>Thank you.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-shell patient-shell-step">
      <button className="patient-exit" onClick={onExit}><ArrowLeft size={22} /> Caregiver view</button>
      <div className="patient-progress" aria-label={`Step ${currentStepIndex + 1} of ${routine.steps.length}`}>
        <span style={{ width: `${((currentStepIndex + 1) / routine.steps.length) * 100}%` }} />
      </div>
      <div className="patient-panel patient-step-panel">
        <div className="patient-copy">
          <p className="patient-kicker">Step {currentStepIndex + 1} of {routine.steps.length}</p>
          <h1>{currentCue?.text || currentStep.instruction}</h1>
          {patientStepGuidance && <p className={helpText ? 'patient-help' : 'patient-guidance'}>{patientStepGuidance}</p>}
          {audioNotice && <p className="patient-audio-notice" aria-live="polite">{audioNotice}</p>}
        </div>
        <div className="patient-actions">
          <button className="patient-done" onClick={handleDone}><Check size={30} /> Done</button>
          <button onClick={handleReadAloud}><Volume2 size={26} /> Read aloud</button>
          <button onClick={handleHelp}><HelpCircle size={26} /> Help</button>
          <button onClick={handleSkip}><SkipForward size={26} /> Skip</button>
        </div>
        <p className="patient-note">No rush.</p>
      </div>
    </div>
  );
}
