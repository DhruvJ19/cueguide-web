import React, { useState, useEffect } from 'react';
import { Routine, PatientProfile } from '../types';
import { generateCueData, generateHelpExplanation, AIGenerationStatus } from '../services/ai';
import { playAudio } from '../utils/audio';
import { CheckCircle2, Lightbulb, FastForward, Volume2, ArrowRight, Loader2, PartyPopper, Camera, Video, X, PhoneCall } from 'lucide-react';
import CameraCapture from '../components/patient/CameraCapture';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import { useSettingsStore } from '../store/settingsStore';
import { usePatientStore } from '../store/patientStore';

interface Props {
  routine: Routine;
  onComplete: (status: 'completed' | 'partial' | 'missed', minutes: number, stepsCompleted: number, mood?: string) => void;
  onExit: () => void;
  onAlert?: (msg: string) => void;
}

export default function PatientFocusMode({ routine, onComplete, onExit, onAlert }: Props) {
  const { aiConfig } = useSettingsStore();
  const { profile: patientProfile, updatePreferences, setProfile } = usePatientStore();
  const [status, setStatus] = useState<'loading' | 'greeting' | 'step' | 'mood' | 'finished'>('loading');
  const [aiData, setAiData] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [startTime] = useState(Date.now());
  const [helpText, setHelpText] = useState<string | null>(null);
  const [isHelpLoading, setIsHelpLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // If profile is somehow missing, render fallback
  if (!patientProfile) return <div className="p-12">Loading profile...</div>;

  useEffect(() => {
    async function init() {
      const today = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const promptCtx = {
        patientName: patientProfile.name,
        preferredName: patientProfile.preferredName,
        routineName: routine.name,
        steps: routine.steps,
        context: {
          day: days[today.getDay()],
          date: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
          weather: 'Sunny, 72°F', // Mocked for demo
          upcoming: `${patientProfile?.primaryCaregiverName || 'Caregiver'} visits at 3 PM`,
          notes: patientProfile.context
        }
      };

      const data = await generateCueData(promptCtx, aiConfig);
      setAiData(data);
      setStatus('greeting');
      
      // Auto read greeting
      if (data?.greeting) {
         playAudio(data.greeting, patientProfile.preferences.voice);
      }
    }
    init();
    
    return () => {
       if (window.speechSynthesis) {
         window.speechSynthesis.cancel();
       }
    };
  }, [routine.id, aiConfig.isEnabled]);

  const handleNextStep = (skipped: boolean = false) => {
    if (!skipped) {
       setStepsCompleted(prev => prev + 1);
    }
    
    setHelpText(null);

    const totalSteps = aiData?.steps?.length > 0 ? aiData.steps.length : routine.steps.length;
    if (currentStepIndex < totalSteps - 1) {
       setCurrentStepIndex(prev => prev + 1);
       // Auto read next step
       const nextAudio = aiData?.steps[currentStepIndex + 1]?.audio_text;
       if (nextAudio) playAudio(nextAudio, patientProfile.preferences.voice);
    } else {
       finishRoutine(skipped && stepsCompleted === 0 ? 'missed' : skipped ? 'partial' : 'completed');
    }
  };

  const handlePrevStep = () => {
     if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
        setHelpText(null);
        // Decrease completed steps if we go back
        setStepsCompleted(prev => Math.max(0, prev - 1));
        const prevAudio = aiData?.steps[currentStepIndex - 1]?.audio_text;
        if (prevAudio) playAudio(prevAudio, patientProfile.preferences.voice);
     }
  };

  const [completionStatus, setCompletionStatus] = useState<'completed' | 'partial' | 'missed'>('completed');
  const [showVideoCall, setShowVideoCall] = useState(false);

  const finishRoutine = (resultStatus: 'completed' | 'partial' | 'missed') => {
     setCompletionStatus(resultStatus);
     setStatus('mood');
     
     if (resultStatus === 'completed') {
        confetti({
           particleCount: 150,
           spread: 70,
           origin: { y: 0.6 },
           colors: ['#4F46E5', '#10B981', '#3B82F6']
        });
     }
     
     if (aiData?.encouragement) {
        playAudio(aiData.encouragement, patientProfile.preferences.voice);
     }
  };

  const submitMood = (moodValue: string) => {
     setStatus('finished');
     // Auto close after 3 seconds
     setTimeout(() => {
        const minutes = Math.round((Date.now() - startTime) / 60000) || 1; // min 1 min
        onComplete(completionStatus, minutes, stepsCompleted + (completionStatus === 'completed' ? 1 : 0), moodValue);
     }, 3000);
  };

  const handleHelp = async () => {
     if (helpText) return; // already showing
     setIsHelpLoading(true);
     const currentStepInfo = aiData?.steps[currentStepIndex]?.text || routine.steps[currentStepIndex].instruction;
     const explanation = await generateHelpExplanation(currentStepInfo, aiConfig);
     setHelpText(explanation);
     playAudio(explanation, patientProfile.preferences.voice);
     setIsHelpLoading(false);
  };

  const handleReadAloud = () => {
    const text = helpText || aiData?.steps[currentStepIndex]?.audio_text || aiData?.steps[currentStepIndex]?.text;
    if (text) {
      playAudio(text, patientProfile.preferences.voice);
    }
  };

  // Determine ambient background style
  const getAmbientStyle = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'radial-gradient(circle at 50% -20%, rgba(251, 146, 60, 0.15), transparent 70%)'; // Morning (Orange)
    if (hour < 18) return 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15), transparent 70%)'; // Afternoon (Indigo)
    return 'radial-gradient(circle at 50% -20%, rgba(139, 92, 246, 0.15), transparent 70%)'; // Evening (Purple)
  };

  return (
    <div className="relative h-full w-full" style={{ background: getAmbientStyle(), transition: 'background 2s ease' }}>
      <AnimatePresence mode="wait">
      {status === 'loading' && (
        <motion.div 
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full w-full flex flex-col items-center justify-center p-8 absolute inset-0 bg-transparent"
        >
           <div className="glass-panel p-12 flex flex-col items-center">
               <Loader2 size={48} className="text-indigo-400 animate-spin mb-6" />
               <h2 className="font-display text-2xl font-light text-content">Preparing today's guide...</h2>
           </div>
        </motion.div>
      )}

      {status === 'greeting' && (
        <motion.div 
          key="greeting"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full w-full flex flex-col items-center justify-center p-8 sm:p-12 absolute inset-0 bg-transparent"
        >
           <div className="absolute top-8 right-8">
             <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-line glass-card">
                  {patientProfile.avatar ? (
                     <img src={patientProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-panel text-content-faint text-2xl font-light">
                        {patientProfile.preferredName.charAt(0)}
                     </div>
                  )}
                </div>
                <button 
                  id="camera-capture-btn"
                  onClick={() => setShowCamera(true)}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-500 transition-colors"
                  aria-label="Update photo"
                >
                  <Camera size={16} />
                </button>
             </div>
           </div>
           
           <div className="glass-panel max-w-4xl w-full text-center p-12 sm:p-20 space-y-12 shadow-2xl mt-12 sm:mt-0">
              <h1 className="font-display text-4xl sm:text-6xl font-light text-content leading-tight">
                 {aiData?.greeting}
              </h1>
              
              <motion.button 
                 id="begin-routine-btn"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 transition={{ type: "spring", stiffness: 400, damping: 17 }}
                 onClick={() => {
                    setStatus('step');
                    const firstAudio = aiData?.steps[0]?.audio_text;
                    if (firstAudio) playAudio(firstAudio, patientProfile.preferences.voice);
                 }}
                 className="mx-auto mt-12 bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-6 rounded-2xl text-2xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-4"
              >
                 Let's Begin <ArrowRight size={36} />
              </motion.button>
           </div>
           {showCamera && (
             <CameraCapture 
               onClose={() => setShowCamera(false)}
               onCapture={(dataUrl) => {
                 setProfile({ ...patientProfile, avatar: dataUrl });
               }}
             />
           )}
        </motion.div>
      )}

      {status === 'mood' && (
        <motion.div 
          key="mood"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="h-full w-full flex flex-col items-center justify-center p-8 sm:p-12 absolute inset-0 bg-transparent"
        >
           <div className="glass-panel p-12 sm:p-20 rounded-3xl shadow-2xl text-center max-w-4xl w-full">
              <h1 className="font-display text-4xl sm:text-6xl font-light text-content leading-tight mb-8">
                 {aiData?.encouragement || 'All done!'}
              </h1>
              
              <div className="mt-12 border-t border-line pt-12">
                 <h2 className="font-display text-3xl text-content-muted font-light mb-12">How are you feeling right now?</h2>
                 <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                    {[
                      { icon: '😄', label: 'Great', color: 'hover:bg-emerald-500/20 hover:border-emerald-500/40' },
                      { icon: '🙂', label: 'Good', color: 'hover:bg-blue-500/20 hover:border-blue-500/40' },
                      { icon: '😐', label: 'Okay', color: 'hover:bg-panel-hover hover:border-line' },
                      { icon: '😕', label: 'Confused', color: 'hover:bg-amber-500/20 hover:border-amber-500/40' },
                      { icon: '😔', label: 'Tired', color: 'hover:bg-rose-500/20 hover:border-rose-500/40' },
                    ].map(mood => (
                       <motion.button
                         id={`mood-btn-${mood.label.toLowerCase()}`}
                         key={mood.label}
                         whileHover={{ scale: 1.1, y: -5 }}
                         whileTap={{ scale: 0.9 }}
                         transition={{ type: "spring", stiffness: 300, damping: 20 }}
                         onClick={() => submitMood(mood.label)}
                         className={`flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl border border-line bg-panel ${mood.color}`}
                       >
                          <span className="text-6xl sm:text-7xl">{mood.icon}</span>
                          <span className="text-xl font-medium text-content-muted">{mood.label}</span>
                       </motion.button>
                    ))}
                 </div>
              </div>
           </div>
        </motion.div>
      )}

      {status === 'finished' && (
        <motion.div 
          key="finished"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="h-full w-full flex flex-col items-center justify-center p-8 sm:p-12 absolute inset-0 bg-transparent"
        >
           <div className="glass-panel p-16 rounded-3xl shadow-2xl text-center max-w-3xl w-full border border-emerald-500/30">
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="font-display text-5xl font-light text-content leading-tight mb-8">
                 Thank you!
              </h1>
              <p className="text-2xl text-emerald-400/80 font-light">Taking you back to the home screen...</p>
           </div>
        </motion.div>
      )}

      {status === 'step' && (
        <motion.div 
          key="step"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="h-full w-full flex flex-col relative overflow-hidden absolute inset-0 bg-transparent"
        >
          {/* Progress Stepper Top */}
          <div className="w-full bg-panel backdrop-blur-xl border-b border-line relative z-20 px-6 py-6 sm:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between relative">
                 {/* Progress background line */}
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-line rounded-full" />
                 {/* Progress fill line */}
                 <div 
                   className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                   style={{ width: `${(currentStepIndex / (Math.max(((aiData?.steps?.length > 0 ? aiData.steps.length : routine.steps.length) || 1) - 1, 1))) * 100}%` }}
                 />
                 
                 {/* Step Bubbles */}
                 {routine.steps.map((step, idx) => {
                   const isActive = idx === currentStepIndex;
                   const isCompleted = idx < currentStepIndex;
                   return (
                     <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                       <div 
                         className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 border-2 ${
                           isActive 
                             ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-110' 
                             : isCompleted 
                               ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
                               : 'bg-panel border-line text-content-muted'
                         }`}
                       >
                         {isCompleted ? <CheckCircle2 size={24} /> : step.icon}
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6 sm:p-10 pb-40 max-w-6xl mx-auto w-full relative z-10">
             {/* Step Indicator Text */}
             <div className="text-center mb-6">
                <span className="bg-indigo-500/10 text-indigo-300 px-6 py-2 rounded-xl text-sm font-bold tracking-widest uppercase shadow-sm inline-block border border-indigo-500/20 backdrop-blur-md">
                   {currentStepIndex + 1} of {aiData?.steps?.length || routine.steps.length}
                </span>
             </div>
             
              {/* Main Content Card */}
             <AnimatePresence mode="wait">
                 {(() => {
                   const originalStep = routine.steps[currentStepIndex];
                   const currentStep = aiData?.steps?.[currentStepIndex] || { text: originalStep?.instruction || '' };
                   return (
                     <motion.div 
                       key={currentStepIndex}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -20 }}
                       transition={{ duration: 0.3 }}
                       className="flex-1 glass-panel border border-line rounded-3xl p-8 sm:p-16 flex flex-col justify-center items-center text-center relative overflow-y-auto"
                     >
                        <button 
                           id="read-aloud-btn"
                           onClick={handleReadAloud} 
                           className="absolute top-8 right-8 p-4 bg-panel text-content-faint hover:text-content border border-line hover:bg-panel-hover rounded-full transition-all"
                           aria-label="Read Aloud"
                        >
                           <Volume2 size={36} />
                        </button>

                        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                           {originalStep?.icon && (
                              <div className="text-8xl sm:text-[140px] mb-8 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{originalStep.icon}</div>
                           )}
                           
                           <h2 className="font-display text-4xl sm:text-7xl font-light text-content leading-tight mb-8 max-w-4xl tracking-tight">
                              {currentStep?.text}
                           </h2>

                           {/* AI Voice Visualizer */}
                           <div className="h-16 flex items-center justify-center gap-2 mb-8">
                             {Array.from({ length: 5 }).map((_, i) => (
                               <motion.div
                                 key={i}
                                 animate={{ 
                                    height: ['20%', '100%', '20%'],
                                    opacity: [0.5, 1, 0.5]
                                 }}
                                 transition={{ 
                                    repeat: Infinity, 
                                    duration: 0.5 + i * 0.1, 
                                    ease: 'easeInOut' 
                                 }}
                                 className="w-2 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                               />
                             ))}
                           </div>
                        </div>

                        {helpText && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="mt-12 bg-panel border flex items-start text-left border-indigo-500/30 p-8 rounded-2xl max-w-3xl"
                           >
                              <Lightbulb size={32} className="text-indigo-400 mr-6 flex-shrink-0 mt-1" />
                              <p className="text-2xl text-content-muted leading-relaxed font-light">{helpText}</p>
                           </motion.div>
                        )}
                        {isHelpLoading && (
                           <div className="mt-12 flex items-center justify-center text-indigo-400 gap-3">
                             <Loader2 size={24} className="animate-spin" />
                             <span className="text-xl font-light">Getting details...</span>
                           </div>
                        )}
                     </motion.div>
                   );
                 })()}
             </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 bg-gradient-to-t from-bg to-transparent flex flex-wrap items-center justify-between gap-4 z-20">
             <div className="flex gap-4 w-full md:w-auto">
                {currentStepIndex > 0 && (
                  <button 
                    id="prev-step-btn"
                    onClick={handlePrevStep} 
                    className="bg-panel border border-line text-content-muted hover:text-content px-6 py-6 rounded-2xl text-xl font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                    Back
                  </button>
                )}
                <button 
                  id="help-step-btn"
                  onClick={handleHelp} 
                  disabled={!!helpText || isHelpLoading}
                  className="bg-panel border border-line text-content-muted hover:text-content px-8 py-6 rounded-2xl text-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3 flex-1 md:flex-none"
                >
                  <Lightbulb size={28} /> Help
                </button>
                <button 
                  id="distress-call-btn"
                  onClick={() => {
                    setIsConnecting(true);
                    setShowVideoCall(true);
                    if (onAlert) onAlert(`Escalation: ${patientProfile.name} initiated emergency call.`);
                    setTimeout(() => setIsConnecting(false), 3000);
                  }}
                  className="bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-500/40 px-6 py-6 rounded-2xl text-xl font-bold transition-all flex items-center justify-center gap-3 flex-1 md:flex-none"
                >
                  I'm Confused
                </button>
             </div>

             <div className="flex gap-4 w-full md:w-auto flex-1 md:justify-end">
               <button 
                 id="skip-step-btn"
                 onClick={() => handleNextStep(true)} 
                 className="text-content-faint hover:text-content px-8 py-6 rounded-2xl text-xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-3 w-full sm:w-auto"
               >
                 Skip <FastForward size={24} />
               </button>

               <motion.button 
                 id="complete-step-btn"
                 whileHover={{ scale: 1.05, y: -2 }}
                 whileTap={{ scale: 0.95 }}
                 transition={{ type: "spring", stiffness: 400, damping: 25 }}
                 onClick={() => handleNextStep(false)} 
                 className="flex-1 w-full max-w-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-8 py-8 rounded-3xl text-4xl font-bold shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-400/30 flex items-center justify-center gap-4"
               >
                 <CheckCircle2 size={40} /> Done
               </motion.button>
             </div>
          </div>

          {/* Video Call Modal */}
          {showVideoCall && (
            <div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
               <div className="w-[90%] max-w-2xl aspect-[4/3] bg-panel rounded-3xl border border-line shadow-2xl overflow-hidden relative flex items-center justify-center">
                  <div className="text-center animate-pulse">
                    <div className="w-24 h-24 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                      <PhoneCall size={48} />
                    </div>
                    <h3 className="font-display text-3xl text-content font-light tracking-tight">Calling Caregiver ({patientProfile?.primaryCaregiverName || 'Primary Contact'})...</h3>
                    <p className="text-content-muted mt-3 text-lg">Hang tight, connection will drop-in shortly.</p>
                  </div>

                  {/* Fake Drop-in Avatar */}
                  <div className="absolute top-4 right-4 w-32 h-40 bg-panel rounded-xl border border-line flex flex-col items-center justify-center z-10 backdrop-blur-md">
                    <Video size={30} className="text-content-faint mb-2" />
                    <span className="text-xs text-content-muted font-bold uppercase tracking-widest">You</span>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
                     <button 
                       onClick={() => { setShowVideoCall(false); if (onAlert) onAlert(""); }}
                       className="bg-rose-600 hover:bg-rose-500 text-white p-6 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-110"
                     >
                       <PhoneCall size={32} className="rotate-[135deg]" />
                     </button>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
