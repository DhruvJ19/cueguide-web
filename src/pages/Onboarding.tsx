import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import AuthLayout from '../components/AuthLayout';
import { db, isSupabaseConfigured, supabase } from '../services/supabase';
import { useMedicationStore } from '../store/medicationStore';
import { usePatientStore } from '../store/patientStore';
import { useRoutineStore } from '../store/routineStore';
import type { Medication, PatientProfile } from '../types';

type Stage = 'early' | 'moderate' | 'late';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setProfile } = usePatientStore();
  const { setMedications } = useMedicationStore();
  const { setRoutines } = useRoutineStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [caregiverName, setCaregiverName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [stage, setStage] = useState<Stage>('early');
  const [context, setContext] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [pillColor, setPillColor] = useState('blue');
  const [pillShape, setPillShape] = useState('small round');
  const [medicationTime, setMedicationTime] = useState('08:00');
  const [location, setLocation] = useState('the yellow pill box on the kitchen counter');

  const canContinueCaregiver = caregiverName.trim().length > 0;
  const canContinuePatient = patientName.trim().length > 0;
  const canFinishMedication = medicationName.trim().length > 0 && dosage.trim().length > 0 && /^\d{2}:\d{2}$/.test(medicationTime.trim());

  const handleFinish = async () => {
    if (!canFinishMedication) return;
    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const patientId = uuidv4();
      let caregiverId = 'local-caregiver';

      if (isSupabaseConfigured) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Please sign in before creating a cloud patient profile.');
        const caregiver = await db.caregivers.getOrCreate(
          user.id,
          caregiverName.trim(),
          user.email || '',
        );
        caregiverId = caregiver?.id || user.id;
      }

      const nextProfile: PatientProfile = {
        id: patientId,
        caregiverId,
        name: patientName.trim(),
        preferredName: preferredName.trim() || patientName.trim(),
        primaryCaregiverName: caregiverName.trim(),
        stage,
        context: context.trim() || 'Medication support should stay calm, simple, and one step at a time.',
        dateOfBirth: '',
        preferences: { fontSize: 28, theme: 'warm', voice: 'female' },
        createdAt: now,
        updatedAt: now,
      };

      const firstMedication: Medication = {
        id: uuidv4(),
        patientId,
        name: medicationName.trim(),
        purpose: 'supports the daily care plan',
        dosage: dosage.trim(),
        pillColor: pillColor.trim() || 'blue',
        pillShape: pillShape.trim() || 'small round',
        times: [medicationTime.trim()],
        instructions: 'Offer with water. Ask gently and do not pressure.',
        location: location.trim(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      setProfile(nextProfile);
      setMedications([firstMedication]);
      setRoutines([]);

      if (isSupabaseConfigured) {
        await db.patients.save(nextProfile);
        await db.medications.save(firstMedication);
      }

      localStorage.setItem('cueguide-active-tab', 'today');
      navigate('/dashboard', { replace: true });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Onboarding could not be saved.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Care setup"
      title="Build the first medication loop"
      subtitle="Add one patient and one scheduled medication. You can add more later."
    >
      <div className="auth-progress" aria-label={`Setup step ${step + 1} of 3`}>
        {[0, 1, 2].map((index) => (
          <span key={index} className={index <= step ? 'active' : ''} />
        ))}
      </div>

      {error && <div className="auth-alert">{error}</div>}

      {step === 0 && (
        <div className="auth-form">
          <label>
            <span>Caregiver name</span>
            <input
              type="text"
              value={caregiverName}
              onChange={(event) => setCaregiverName(event.target.value)}
              placeholder="Sarah Chen"
            />
          </label>
          <button type="button" disabled={!canContinueCaregiver} className="cg-primary auth-submit" onClick={() => setStep(1)}>
            Continue <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="auth-form">
          <label>
            <span>Patient full name</span>
            <input
              type="text"
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              placeholder="Robert Chen"
            />
          </label>
          <label>
            <span>Patient display name</span>
            <input
              type="text"
              value={preferredName}
              onChange={(event) => setPreferredName(event.target.value)}
              placeholder="Dad"
            />
          </label>
          <div className="auth-segmented" aria-label="Dementia stage">
            {(['early', 'moderate', 'late'] as Stage[]).map((option) => (
              <button key={option} type="button" className={stage === option ? 'active' : ''} onClick={() => setStage(option)}>
                {option}
              </button>
            ))}
          </div>
          <label>
            <span>Helpful context</span>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Medication location, preferred cup, comfort names, useful routines..."
              rows={4}
            />
          </label>
          <div className="auth-actions">
            <button type="button" className="cg-secondary" onClick={() => setStep(0)}>Back</button>
            <button type="button" disabled={!canContinuePatient} className="cg-primary" onClick={() => setStep(2)}>
              Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="auth-form">
          <label>
            <span>First medication</span>
            <input
              type="text"
              value={medicationName}
              onChange={(event) => setMedicationName(event.target.value)}
              placeholder="Lisinopril"
            />
          </label>
          <div className="auth-two-col">
            <label>
              <span>Dosage</span>
              <input type="text" value={dosage} onChange={(event) => setDosage(event.target.value)} placeholder="10 mg" />
            </label>
            <label>
              <span>Time</span>
              <input type="time" value={medicationTime} onChange={(event) => setMedicationTime(event.target.value)} />
            </label>
          </div>
          <div className="auth-two-col">
            <label>
              <span>Pill color</span>
              <input type="text" value={pillColor} onChange={(event) => setPillColor(event.target.value)} placeholder="blue" />
            </label>
            <label>
              <span>Pill shape</span>
              <input type="text" value={pillShape} onChange={(event) => setPillShape(event.target.value)} placeholder="small round" />
            </label>
          </div>
          <label>
            <span>Patient location cue</span>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="the yellow pill box on the kitchen counter"
            />
          </label>
          <div className="auth-actions">
            <button type="button" className="cg-secondary" onClick={() => setStep(1)}>Back</button>
            <button type="button" disabled={!canFinishMedication || loading} className="cg-primary" onClick={handleFinish}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Open dashboard <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
