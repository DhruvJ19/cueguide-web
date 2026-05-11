import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../services/supabase';
import { HeartPulse, ArrowRight, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [caregiverName, setCaregiverName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [stage, setStage] = useState<'early' | 'moderate' | 'late'>('early');
  const [context, setContext] = useState('');

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const patientId = uuidv4();
      const routineId = uuidv4();

      await db.patients.save({
        id: patientId,
        caregiverId: user.id,
        name: patientName,
        preferredName: preferredName || patientName,
        primaryCaregiverName: caregiverName,
        stage,
        context,
        dateOfBirth: '',
        preferences: { fontSize: 28, theme: 'warm', voice: 'female' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await db.routines.save({
        id: routineId,
        patientId,
        name: 'Morning Routine',
        category: 'hygiene',
        scheduledTime: '08:00',
        recurrence: ['daily'],
        isActive: true,
        steps: [
          { id: uuidv4(), position: 1, instruction: 'Wash your face with warm water', icon: '🚿' },
          { id: uuidv4(), position: 2, instruction: 'Brush your teeth for 2 minutes', icon: '🪥' },
          { id: uuidv4(), position: 3, instruction: 'Comb your hair', icon: '💇' },
          { id: uuidv4(), position: 4, instruction: 'Get dressed for the day', icon: '👔' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="glass-panel p-10 max-w-lg w-full border border-indigo-500/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <HeartPulse size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-content">CueGuide<span className="text-indigo-400 font-black">.</span></h1>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-indigo-500' : 'bg-line'}`} />
            ))}
          </div>
          <p className="text-content-faint text-xs font-bold uppercase tracking-widest">
            {step === 0 ? 'About you' : step === 1 ? 'About your loved one' : 'Almost done'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-content mb-2">What should we call you?</h2>
            <p className="text-content-muted text-sm mb-6">This is how your loved one will refer to you in the app.</p>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-content-faint mb-2 block">Your name</label>
              <input
                type="text"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                placeholder="Sarah"
                className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content placeholder:text-content-faint focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => caregiverName.trim() && setStep(1)}
              disabled={!caregiverName.trim()}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50"
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-content mb-2">Who are you caring for?</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-content-faint mb-2 block">Full name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Robert Chen"
                className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content placeholder:text-content-faint focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-content-faint mb-2 block">What do they like to be called?</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="Dad"
                className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content placeholder:text-content-faint focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-content-faint mb-2 block">Stage of dementia</label>
              <div className="flex gap-2">
                {(['early', 'moderate', 'late'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                      stage === s
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                        : 'bg-panel border-line text-content-muted hover:bg-panel-hover'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-content-faint mb-2 block">Notes about their daily life</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Lives with wife Margaret. Orange tabby cat named Ginger. Takes a blue pill in the morning..."
                rows={4}
                className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content placeholder:text-content-faint focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-3 bg-panel border border-line text-content-muted font-medium rounded-xl hover:bg-panel-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => patientName.trim() && setStep(2)}
                disabled={!patientName.trim()}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-content mb-2">You're all set, {caregiverName}</h2>
            <p className="text-content-muted text-sm">
              We've created a sample morning routine for {preferredName || patientName}. You can customize it from your dashboard.
            </p>

            <div className="bg-panel border border-line rounded-xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-content-faint mb-3">Sample routine</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center text-lg">🚿</div>
                <div>
                  <p className="font-semibold text-content">Morning Routine</p>
                  <p className="text-xs text-content-muted">8:00 AM · 4 steps</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-panel border border-line text-content-muted font-medium rounded-xl hover:bg-panel-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Go to dashboard <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}