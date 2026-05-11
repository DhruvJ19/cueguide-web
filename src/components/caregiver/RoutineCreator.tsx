import React, { useState, useRef, useEffect } from 'react';
import { Routine, Step, PatientProfile } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2, GripVertical, ChevronDown, Wand2, Mic, Play, Search, Sparkles, Pencil } from 'lucide-react';
import { AIGenerationStatus, generateRoutineSteps, generateHelpExplanation, suggestRoutineCategory, suggestRoutineName } from '../../services/ai';
import { playAudio } from '../../utils/audio';
import { toast } from 'sonner';

import { useSettingsStore } from '../../store/settingsStore';
import { usePatientStore } from '../../store/patientStore';

interface Props {
  onSave: (routine: Routine) => void;
  onClose: () => void;
}

const ALL_ICONS = [
  '🌅', '🦷', '👕', '🍳', '💊', '🚶', '🧹', '🍽️', '📚', '🛏️', '☕', '🚿', '🪴', '📺',
  '🍎', '🍌', '🍞', '🧀', '🥗', '🍲', '👖', '👗', '🧦', '👟', '🧥', '👓',
  '🪥', '🧼', '🧽', '🧴', '🪒', '🚽', '🛁', '🧻', '🩺', '🩹', '🌡️',
  '🏃', '🧘', '🗑️', '🧺', '🪣', '📓', '🖊️', '🎨', '🧩', '📻', '🎵',
  '☀️', '🌙', '🌧️'
];

export default function RoutineCreator({ onSave, onClose }: Props) {
  const { aiConfig } = useSettingsStore();
  const { profile: patientProfile } = usePatientStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('hygiene');
  const [time, setTime] = useState('08:00');
  const [recurrenceOption, setRecurrenceOption] = useState('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingName, setIsSuggestingName] = useState(false);
  const [generatingStepId, setGeneratingStepId] = useState<string | null>(null);
  const [recordingStepId, setRecordingStepId] = useState<string | null>(null);
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [magicStepCount, setMagicStepCount] = useState<number | string>('3-5');

  const [steps, setSteps] = useState<Step[]>([
    { id: uuidv4(), position: 1, instruction: '', icon: '🌅' }
  ]);

  const handleNameBlur = async () => {
    if (name.trim() && aiConfig?.isEnabled) {
      const cat = await suggestRoutineCategory(name, aiConfig);
      if (cat) {
        setCategory(cat);
      }
    }
  };

  const handleSuggestName = async () => {
    if (aiConfig?.isEnabled && patientProfile) {
      setIsSuggestingName(true);
      const suggested = await suggestRoutineName(patientProfile.context, aiConfig);
      if (suggested) {
        setName(suggested);
      }
      setIsSuggestingName(false);
    }
  };

  // Mark form as dirty when contents change
  useEffect(() => {
    if (name || steps.some(s => s.instruction)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [name, steps]);

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const addStep = () => {
    setSteps([...steps, { id: uuidv4(), position: steps.length + 1, instruction: '', icon: '🌅' }]);
  };

  const updateStepText = (id: string, text: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, instruction: text } : s));
  };
  
  const updateStepIcon = (id: string, icon: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, icon } : s));
    setShowIconPicker(null);
    setIconSearch('');
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      if (window.confirm("Are you sure you want to delete this step?")) {
        setSteps(steps.filter(s => s.id !== id).map((s, i) => ({ ...s, position: i + 1 })));
      }
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleGenerateSteps = async () => {
     if (!name.trim() || !aiConfig) return;
     
     const confirmGenerate = window.confirm(`Generate ${magicStepCount} steps for '${name}'? This will replace your current steps.`);
     if (!confirmGenerate) return;

     setIsGenerating(true);
     const suggested = await generateRoutineSteps(name, category, magicStepCount, aiConfig);
     if (suggested && Array.isArray(suggested) && suggested.length > 0) {
        setSteps(suggested.map((s: any, i: number) => ({
           id: uuidv4(),
           position: i + 1,
           instruction: s.instruction || '',
           icon: s.icon || '🌅'
        })));
     } else {
        toast.error("Oops, we had trouble generating steps. Please try again.");
     }
     setIsGenerating(false);
  };

  const handleExpandStep = async (stepId: string, currentInstruction: string) => {
    if (!aiConfig || !currentInstruction.trim()) return;
    
    setGeneratingStepId(stepId);
    try {
      const explanation = await generateHelpExplanation(currentInstruction, aiConfig);
      if (explanation) {
         updateStepText(stepId, currentInstruction + " (" + explanation + ")"); 
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingStepId(null);
  };

  const handleDictate = (id: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      setRecordingStepId(id);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        updateStepText(id, transcript);
      };
      recognition.onend = () => {
         setRecordingStepId(null);
      };
      recognition.start();
    } else {
      toast.error("Voice recognition is not supported in this browser.");
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedStepId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // Required for Firefox
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedStepId || draggedStepId === targetId) return;

    const sourceIndex = steps.findIndex(s => s.id === draggedStepId);
    const targetIndex = steps.findIndex(s => s.id === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedSteps = [...steps];
    const [movedStep] = updatedSteps.splice(sourceIndex, 1);
    updatedSteps.splice(targetIndex, 0, movedStep);
    
    // Update positions
    setSteps(updatedSteps.map((s, i) => ({ ...s, position: i + 1 })));
    setDraggedStepId(null);
  };

  const handleSave = () => {
    if (!name.trim() || steps.some(s => !s.instruction.trim())) return;
    
    let finalRecurrence = [recurrenceOption];
    if (recurrenceOption === 'custom' || recurrenceOption === 'specific_dates') {
      if (selectedDays.length === 0) return;
      finalRecurrence = selectedDays;
    }

    onSave({
      id: uuidv4(),
      name,
      category,
      scheduledTime: time,
      recurrence: finalRecurrence,
      isActive: true,
      steps,
      patientId: 'patient-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const filteredIcons = ALL_ICONS.filter(icon => 
    !iconSearch || icon.includes(iconSearch)
  );

  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
         {/* Header */}
         <div className="px-8 py-6 border-b border-line flex justify-between items-center bg-panel">
            <h2 className="font-display text-3xl font-light text-content tracking-tight">Create New <span className="font-semibold">Routine</span></h2>
            <button id="close-routine-creator-btn" onClick={handleClose} className="p-2 text-content-faint hover:text-content rounded-full hover:bg-panel-hover transition-colors">
              <X size={20} />
            </button>
         </div>

         {/* Body */}
         <div className="p-8 overflow-y-auto flex-1 space-y-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                 <div className="flex-1 relative">
                   <div className="flex items-center justify-between mb-2">
                     <label className="block text-xs font-bold uppercase tracking-widest text-content-muted">Routine Name</label>
                     {aiConfig?.isEnabled && (
                       <button
                         id="ai-suggest-name-btn"
                         onClick={handleSuggestName}
                         disabled={isSuggestingName}
                         className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                       >
                         <Sparkles size={12} className={isSuggestingName ? "animate-spin" : ""} />
                         {isSuggestingName ? "Suggesting..." : "AI Suggest Name"}
                       </button>
                     )}
                   </div>
                   <input 
                     type="text" 
                     value={name}
                     onChange={e => setName(e.target.value)}
                     onBlur={handleNameBlur}
                     placeholder="e.g. Afternoon Tea"
                     className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content placeholder:text-content-faint focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                   />
                 </div>
                 {aiConfig?.isEnabled && name.trim() && (
                   <div className="flex items-end gap-2">
                     <div className="relative">
                       <select 
                         value={magicStepCount}
                         onChange={e => setMagicStepCount(e.target.value)}
                         className="h-12 px-2 pl-4 pr-8 bg-indigo-600/10 border border-indigo-500/30 rounded-xl text-indigo-300 font-bold focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer text-center"
                         title="Number of steps to generate"
                       >
                         <option value="3-5" className="bg-gray-900">Auto (3-5)</option>
                         {[2,3,4,5,6,7,8].map(n => <option key={n} value={n} className="bg-gray-900">{n}</option>)}
                       </select>
                       <ChevronDown size={14} className="absolute right-3 top-4.5 text-indigo-400 pointer-events-none" />
                     </div>
                     <button
                       id="magic-suggest-steps-btn"
                       onClick={handleGenerateSteps}
                       disabled={isGenerating}
                       className="w-full md:w-auto h-12 px-6 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                     >
                        <Wand2 size={18} className={isGenerating ? "animate-spin" : ""} /> 
                        {isGenerating ? "Generating..." : "Magic Suggest"}
                     </button>
                   </div>
                 )}
               </div>
               
               <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                   <label className="block text-xs font-bold uppercase tracking-widest text-content-muted mb-2">Category</label>
                   <div className="relative">
                     <select 
                       value={category}
                       onChange={e => setCategory(e.target.value)}
                       className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                     >
                        <option value="hygiene" className="bg-gray-900">Hygiene</option>
                        <option value="medication" className="bg-gray-900">Medication</option>
                        <option value="exercise" className="bg-gray-900">Exercise</option>
                        <option value="social" className="bg-gray-900">Social</option>
                        <option value="meals" className="bg-gray-900">Meals</option>
                        <option value="other" className="bg-gray-900">Other</option>
                     </select>
                     <ChevronDown size={18} className="absolute right-4 top-3.5 text-content-faint pointer-events-none" />
                   </div>
                 </div>
                 
                 <div className="flex-1">
                   <label className="block text-xs font-bold uppercase tracking-widest text-content-muted mb-2">Scheduled Time</label>
                   <input 
                     type="time" 
                     value={time}
                     onChange={e => setTime(e.target.value)}
                     className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                   />
                 </div>
               </div>
               
               <div className="md:col-span-2">
                 <label className="block text-xs font-bold uppercase tracking-widest text-content-muted mb-2">Recurrence</label>
                 <div className="relative">
                   <select 
                     value={recurrenceOption}
                     onChange={e => setRecurrenceOption(e.target.value)}
                     className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                   >
                      <option value="daily" className="bg-gray-900">Daily</option>
                      <option value="weekdays" className="bg-gray-900">Weekdays</option>
                      <option value="weekends" className="bg-gray-900">Weekends</option>
                        <option value="custom" className="bg-gray-900">Specific Days of the Week</option>
                      <option value="specific_dates" className="bg-gray-900">Specific Dates of the Month</option>
                   </select>
                   <ChevronDown size={18} className="absolute right-4 top-3.5 text-content-faint pointer-events-none" />
                 </div>
                 
                 {recurrenceOption === 'custom' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {weekDays.map(day => (
                          <button
                            key={day}
                            onClick={() => handleDayToggle(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedDays.includes(day) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-panel border-line text-content-muted hover:text-content'}`}
                          >
                             {day}
                          </button>
                       ))}
                    </div>
                 )}
                 {recurrenceOption === 'specific_dates' && (
                    <div className="mt-4 grid grid-cols-7 sm:grid-cols-10 gap-2">
                       {Array.from({length: 31}, (_, i) => (i + 1).toString()).map(date => (
                          <button
                            key={date}
                            onClick={() => handleDayToggle(date)}
                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all border ${selectedDays.includes(date) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-panel border-line text-content-muted hover:text-content'}`}
                          >
                             {date}
                          </button>
                       ))}
                       <button
                         key="Last Day"
                         onClick={() => handleDayToggle("Last Day")}
                         className={`col-span-3 aspect-[3/1] flex items-center justify-center rounded-lg text-sm font-bold transition-all border ${selectedDays.includes("Last Day") ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-panel border-line text-content-muted hover:text-content'}`}
                       >
                         Last Day
                       </button>
                    </div>
                 )}
               </div>
               
               <div className="md:col-span-2">
                 <label className="block text-xs font-bold uppercase tracking-widest text-content-muted mb-2">Caregiver Escalation Policy</label>
                 <div className="relative">
                   <select 
                     className="w-full px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-content focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                   >
                      <option value="none" className="bg-gray-900">Do not alert caregiver</option>
                      <option value="15" className="bg-gray-900">Alert Caregiver if 15 mins late</option>
                      <option value="30" className="bg-gray-900">Alert Caregiver if 30 mins late</option>
                      <option value="auto" className="bg-gray-900">Smart Alert (AI determines urgency based on missed steps)</option>
                   </select>
                   <ChevronDown size={18} className="absolute right-4 top-3.5 text-content-faint pointer-events-none" />
                 </div>
               </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                 <label className="block text-xs font-bold uppercase tracking-widest text-content-muted">Steps</label>
              </div>
              <div className="space-y-4 relative">
                 {steps.map((step, i) => (
                    <div 
                      key={step.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, step.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, step.id)}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 glass-card p-4 group transition-all border ${draggedStepId === step.id ? 'opacity-50 border-indigo-500' : 'border-line hover:border-line'} focus-within:border-indigo-500/50 focus-within:bg-panel focus-within:shadow-[0_0_20px_rgba(99,102,241,0.15)] relative ${recordingStepId === step.id ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                    >
                       <div className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-panel-hover rounded-lg transition-colors">
                         <GripVertical size={18} className="text-content-faint" />
                       </div>
                       
                       <div className="relative">
                          <button 
                            onClick={() => setShowIconPicker(showIconPicker === step.id ? null : step.id)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-all border ${showIconPicker === step.id ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-110 relative z-30' : 'bg-panel hover:bg-panel-hover border-line hover:border-line'}`}
                            title="Choose Icon"
                          >
                            {step.icon || '🌅'}
                          </button>
                          
                          {showIconPicker === step.id && (
                             <div className="absolute top-14 left-0 z-20 glass-card p-4 w-72 sm:w-80 border border-line shadow-2xl flex flex-col gap-3 rounded-xl">
                                <div className="relative">
                                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
                                  <input 
                                    type="text" 
                                    placeholder="Search icons..." 
                                    value={iconSearch}
                                    onChange={e => setIconSearch(e.target.value)}
                                    className="w-full bg-panel border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-content placeholder:text-content-faint focus:outline-none focus:border-indigo-500"
                                    autoFocus
                                  />
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                  {filteredIcons.map(icon => (
                                     <button
                                       key={icon}
                                       onClick={() => updateStepIcon(step.id, icon)}
                                       className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg transition-all ${step.icon === icon ? 'bg-indigo-600 shadow-md shadow-indigo-500/20 scale-110' : 'hover:bg-panel-hover'}`}
                                     >
                                       {icon}
                                     </button>
                                  ))}
                                  {filteredIcons.length === 0 && (
                                     <div className="col-span-full py-4 text-center text-content-faint text-sm">
                                       No icons found
                                     </div>
                                  )}
                                </div>
                             </div>
                          )}
                       </div>

                       <div className="flex-1 w-full relative group/input">
                         <input 
                           type="text" 
                           value={step.instruction}
                           onChange={e => updateStepText(step.id, e.target.value)}
                           placeholder="Short, clear instruction"
                           className="w-full bg-panel border border-line hover:border-line focus:bg-panel-hover focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-xl pl-4 pr-10 py-3 text-content placeholder:text-content-faint text-lg sm:text-xl font-display font-light outline-none transition-all"
                           autoFocus={i === steps.length - 1 && steps.length > 1}
                         />
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 pointer-events-none text-content-faint transition-opacity flex items-center">
                           <Pencil size={16} />
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-1">
                         {aiConfig?.isEnabled && step.instruction.trim() && (
                           <button 
                             onClick={() => handleExpandStep(step.id, step.instruction)} 
                             disabled={generatingStepId === step.id}
                             className={`p-2.5 rounded-lg transition-all ${generatingStepId === step.id ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30'}`}
                             title="Expand Instruction Details with AI"
                           >
                             <Sparkles size={18} className={generatingStepId === step.id ? "animate-spin" : ""} />
                           </button>
                         )}

                         <button 
                           onClick={() => step.instruction && playAudio(step.instruction)} 
                           className="p-2.5 text-content-faint hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors"
                           title="Listen to Instruction"
                           disabled={!step.instruction}
                         >
                           <Play size={20} className={step.instruction ? "fill-current" : ""} />
                         </button>

                         <button 
                           onClick={() => handleDictate(step.id)} 
                           className={`p-2.5 rounded-lg transition-colors ${recordingStepId === step.id ? 'text-red-400 bg-red-500/10' : 'text-content-faint hover:text-content hover:bg-panel-hover'}`}
                           title="Dictate Instruction"
                         >
                           <Mic size={20} className={recordingStepId === step.id ? "animate-pulse" : ""} />
                         </button>

                         <button 
                           onClick={() => removeStep(step.id)} 
                           className="p-2.5 text-content-faint hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ml-1"
                           title="Remove Step"
                         >
                           <Trash2 size={20} />
                         </button>
                       </div>
                    </div>
                 ))}
                 
                 <button 
                   id="add-step-btn"
                   onClick={addStep}
                   className="w-full py-5 border-2 border-dashed border-line rounded-xl text-content-faint hover:text-content hover:border-line transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs mt-6 hover:bg-panel-hover"
                 >
                   <Plus size={18} /> Add Another Step
                 </button>
              </div>
            </div>
         </div>

         {/* Footer */}
         <div className="px-8 py-6 border-t border-line flex justify-end gap-4 bg-panel backdrop-blur-xl relative z-20">
            <button id="cancel-routine-btn" onClick={handleClose} className="px-6 py-3 text-content-muted font-bold hover:text-content hover:bg-panel-hover rounded-xl transition-colors">
              Cancel
            </button>
            <button 
              id="save-routine-btn"
              onClick={handleSave}
              disabled={!name.trim() || steps.some(s => !s.instruction.trim()) || ((recurrenceOption === 'custom' || recurrenceOption === 'specific_dates') && selectedDays.length === 0)}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              Save Routine
            </button>
         </div>
      </div>
    </div>
  );
}
