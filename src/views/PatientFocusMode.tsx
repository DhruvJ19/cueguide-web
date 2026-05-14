import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, HelpCircle, SkipForward, Volume2 } from 'lucide-react';
import { generateCueData } from '../services/ai';
import { playAudio } from '../utils/audio';
import { createCareAlertsFromStepEvents } from '../services/careAlerts';
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
  const [startedAt] = useState(Date.now());

  const currentStep = routine.steps[currentStepIndex];
  const currentCue = cueData?.steps[currentStepIndex];
  const completedCount = stepEvents.filter((event) => event.status === 'completed').length;

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

  function buildStepEvent(
    status: StepCompletion['status'],
    step = currentStep,
    startedAt = stepStartedAt,
  ): StepCompletion {
    const completedAt = new Date().toISOString();
    return {
      stepId: step.id,
      routineId: routine.id,
      patientId: profile?.id || routine.patientId,
      medicationId: step.medicationId,
      startedAt,
      completedAt: status === 'started' ? undefined : completedAt,
      status,
      elapsedSeconds: status === 'started' ? 0 : Math.max(1, Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1000)),
      skipped: status === 'skipped',
      helpRequested: status === 'help_requested',
    };
  }

  function moveToNextStep(newEvent?: StepCompletion) {
    let nextEvents = newEvent ? [...stepEvents, newEvent] : stepEvents;
    if (newEvent) {
      addAlerts(createCareAlertsFromStepEvents([newEvent], {
        patientName: profile.preferredName,
        routineName: routine.name,
      }));
    }
    setHelpText(null);
    if (currentStepIndex < routine.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStartedAt = new Date().toISOString();
      nextEvents = [...nextEvents, buildStepEvent('started', routine.steps[nextIndex], nextStartedAt)];
      setStepEvents(nextEvents);
      setCurrentStepIndex(nextIndex);
      setStepStartedAt(nextStartedAt);
    } else {
      setStepEvents(nextEvents);
      setFocusState('mood');
    }
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
    setHelpText(text);
  }

  function handleReadAloud() {
    const text = helpText || currentCue?.audio_text || currentCue?.text || currentStep.instruction;
    playAudio(text, profile.preferences.voice);
  }

  function finishWithMood(mood: string) {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const finalCompleted = stepEvents.filter((event) => event.status === 'completed').length;
    const status = finalCompleted === routine.steps.length ? 'completed' : finalCompleted === 0 ? 'missed' : 'partial';
    setFocusState('finished');
    window.setTimeout(() => onComplete(status, minutes, finalCompleted, mood, stepEvents, cueData?.steps || []), 1200);
  }

  if (focusState === 'loading') {
    return (
      <div className="patient-shell">
        <div className="patient-panel">
          <p className="patient-kicker">Preparing guide</p>
          <h1>One moment.</h1>
        </div>
      </div>
    );
  }

  if (focusState === 'greeting') {
    return (
      <div className="patient-shell">
        <button className="patient-exit" onClick={onExit}><ArrowLeft size={22} /> Caregiver view</button>
        <div className="patient-panel patient-centered">
          <p className="patient-kicker">{routine.name}</p>
          <h1>{cueData?.greeting}</h1>
          <button className="patient-primary" onClick={() => {
            const startedAt = new Date().toISOString();
            setFocusState('step');
            setStepStartedAt(startedAt);
            setStepEvents([buildStepEvent('started', routine.steps[0], startedAt)]);
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
    <div className="patient-shell">
      <button className="patient-exit" onClick={onExit}><ArrowLeft size={22} /> Caregiver view</button>
      <div className="patient-progress" aria-label={`Step ${currentStepIndex + 1} of ${routine.steps.length}`}>
        <span style={{ width: `${((currentStepIndex + 1) / routine.steps.length) * 100}%` }} />
      </div>
      <div className="patient-panel">
        <p className="patient-kicker">Step {currentStepIndex + 1} of {routine.steps.length}</p>
        <h1>{currentCue?.text || currentStep.instruction}</h1>
        {helpText && <p className="patient-help">{helpText}</p>}
        <div className="patient-actions">
          <button onClick={handleReadAloud}><Volume2 size={26} /> Read aloud</button>
          <button onClick={handleHelp}><HelpCircle size={26} /> Help</button>
          <button onClick={handleSkip}><SkipForward size={26} /> Skip</button>
          <button className="patient-done" onClick={handleDone}><Check size={30} /> Done</button>
        </div>
        <p className="patient-note">{completedCount} completed so far. There is no rush.</p>
      </div>
    </div>
  );
}
