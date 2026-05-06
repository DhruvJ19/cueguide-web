import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Database, ArrowRight, Brain, User, FileText, CheckCircle2 } from 'lucide-react';

export default function AnonymizationPipeline() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: 'Local Context Generation',
      desc: 'Routine data and context is gathered on the client device.',
      icon: <User className="text-blue-400" size={24} />,
      data: '{ "name": "Robert Chen", "meds": "Lisinopril" }'
    },
    {
      title: 'PHI Stripping',
      desc: 'Identifiers are stripped and replaced with generic tokens.',
      icon: <Shield className="text-emerald-400" size={24} />,
      data: '{ "name": "[PATIENT_1]", "meds": "[MED_A]" }'
    },
    {
      title: 'LLM Processing',
      desc: 'Anonymized payload is sent to Gemini for prompt generation.',
      icon: <Brain className="text-purple-400" size={24} />,
      data: 'Generating prompt for [PATIENT_1] to take [MED_A]'
    },
    {
      title: 'Encrypted Response',
      desc: 'Gemini returns the anonymized generated cues.',
      icon: <Lock className="text-indigo-400" size={24} />,
      data: '"Good morning [PATIENT_1], time for your [MED_A]"'
    },
    {
      title: 'Client-Side Rehydration',
      desc: 'The app re-inserts PHI locally before displaying or speaking.',
      icon: <CheckCircle2 className="text-emerald-500" size={24} />,
      data: '"Good morning Robert, time for your Lisinopril"'
    }
  ];

  return (
    <div className="bg-panel border border-line rounded-2xl p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 p-32 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="mb-10 text-center relative z-10">
        <h2 className="text-3xl font-display font-light text-content tracking-tight">Zero-Trust PHI Architecture</h2>
        <p className="text-content-muted mt-2 max-w-2xl mx-auto">
          Patient Health Information (PHI) never leaves the device. All context is anonymized locally before reaching the LLM and rehydrated upon return.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Connection Line */}
        <div className="absolute left-[39px] top-[40px] bottom-[40px] w-0.5 bg-line-strong rounded-full hidden md:block" />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <div key={index} className="flex flex-col md:flex-row gap-6 items-start relative">
                {/* Node */}
                <div className={`w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all duration-700 z-10 bg-panel
                  ${isActive ? 'border-indigo-500 shadow-indigo-500/20 scale-110' : 
                    isPast ? 'border-emerald-500/50' : 'border-line'}
                `}>
                  {step.icon}
                </div>

                {/* Content Card */}
                <div className={`flex-1 glass-card p-6 border transition-all duration-700
                  ${isActive ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 
                    isPast ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-line opacity-50'}
                `}>
                  <h3 className={`text-xl font-bold mb-2 ${isActive ? 'text-indigo-400' : 'text-content'}`}>
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-content-muted text-sm mb-4">{step.desc}</p>
                  
                  <div className="bg-panel border border-line rounded-xl p-4 font-mono text-xs overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
                      className={`text-content-faint transition-colors ${isActive ? 'text-emerald-400 font-bold' : ''}`}
                    >
                      {step.data}
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
