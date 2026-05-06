import React, { useState } from 'react';
import { Routine, Completion, ScheduleAdjustment } from '../types';
import WeeklyCharts from '../components/caregiver/WeeklyCharts';
import RoutineCreator from '../components/caregiver/RoutineCreator';
import DeviceManager from '../components/caregiver/DeviceManager';
import AnonymizationPipeline from '../components/caregiver/AnonymizationPipeline';
import ReportsEngine from '../components/caregiver/ReportsEngine';
import GlowCard from '../components/GlowCard';
import { Plus, CheckCircle2, Circle, Clock, MoreVertical, Play, Zap, ZapOff, Sparkles, AlertCircle, LayoutDashboard, ListTodo, Activity, Settings, User, Shield, Radio, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AIGenerationStatus } from '../services/ai';
import { motion, AnimatePresence } from 'motion/react';
import { usePatientStore } from '../store/patientStore';
import { useRoutineStore } from '../store/routineStore';
import { useCompletionStore } from '../store/completionStore';
import { useSettingsStore } from '../store/settingsStore';

const RoutineCard = ({ routine, completion, onStart, getMoodIcon, compact = false }: any) => {
  const statusColor = 
    completion?.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/5' :
    completion?.status === 'in_progress' ? 'border-indigo-500/30 bg-indigo-500/5' :
    completion?.status === 'missed' ? 'border-red-500/30 bg-red-500/5' :
    completion?.status === 'partial' ? 'border-amber-500/30 bg-amber-500/5' : 'border-line glass-card';
  
  const textColor = 
    completion?.status === 'completed' ? 'text-emerald-500' :
    completion?.status === 'in_progress' ? 'text-indigo-500' :
    completion?.status === 'missed' ? 'text-red-500' :
    completion?.status === 'partial' ? 'text-amber-500' : 'text-content-muted';

  return (
    <div className={`p-6 ${!compact && 'md:p-8'} flex flex-col justify-between h-full rounded-2xl ${statusColor} border hover:-translate-y-1 transition-all duration-300 group`}>
      <div className="flex justify-between items-start mb-6">
        <div>
            <div className={`inline-block px-3 py-1 rounded-lg bg-panel border border-line text-xs font-bold text-content-muted mb-4 capitalize`}>
              {routine.category || 'General'}
            </div>
            <h3 className={`font-semibold ${compact ? 'text-xl' : 'text-2xl'} text-content tracking-tight leading-tight mb-2 group-hover:text-indigo-500 transition-colors`}>{routine.name}</h3>
            <div className={`flex items-center ${compact ? 'text-xs' : 'text-sm'} font-medium text-content-muted bg-panel border-line border inline-flex px-2.5 py-1 rounded-lg`}>
              <Clock size={14} className="mr-2 opacity-70" />
              {routine.scheduledTime}
            </div>
        </div>
        <button id={`routine-more-btn-${routine.id}`} aria-label="Routine Options" className="text-content-muted hover:text-content transition-colors bg-panel hover:bg-panel-hover rounded-xl p-2 border border-line">
          <MoreVertical size={18} />
        </button>
      </div>
      
      <div className="flex-grow mt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase font-black text-content-faint tracking-widest">{routine.steps.length} Steps</p>
          {completion && <span className="text-[10px] uppercase font-bold text-content-muted">{completion.stepsCompleted} / {routine.steps.length} completed</span>}
        </div>
        <div className="flex gap-2 w-full h-2 bg-panel-hover border border-line rounded-sm overflow-hidden p-0.5">
          {routine.steps.map((s: any, i: number) => (
              <div key={s.id} className={`h-full flex-1 rounded-sm transition-all duration-500 ${completion && (completion.stepsCompleted > i || completion.status === 'completed') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-line-strong'}`}></div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between pt-6 border-t border-line">
        <div className={`flex items-center text-xs font-bold tracking-widest uppercase ${textColor}`}>
            {completion ? (
              <div className="flex items-center gap-1.5 bg-panel px-2.5 py-1 border border-line rounded-md">
                {completion.status === 'completed' && <CheckCircle2 size={14} />}
                {completion.status.replace('_', ' ')}
              </div>
            ) : (
              <span className="flex items-center gap-2"><Circle size={10} className="fill-content-faint" /> Ready</span>
            )}
        </div>
        
        {!completion && (
          <button 
            id={`routine-play-btn-${routine.id}`}
            onClick={() => onStart(routine.id)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-indigo-500 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/25"
          >
              <Play size={14} className="fill-current" /> Play
          </button>
        )}
        {completion?.mood && (
            <div className="flex items-center gap-2 bg-panel border border-line px-3 py-1.5 rounded-lg">
              <span className="text-content-faint text-xs font-medium">Mood:</span>
              <span className="text-sm font-bold text-content flex items-center gap-1.5">{getMoodIcon(completion.mood)} {completion.mood}</span>
            </div>
        )}
      </div>
    </div>
  );
};

interface Props {
  onStartSimulation: (id: string) => void;
  globalAlert?: string | null;
  clearAlert?: () => void;
}

export default function CaregiverDashboard({ 
  onStartSimulation, globalAlert, clearAlert
}: Props) {
  const { routines, addRoutine, adjustments, approveAdjustment, rejectAdjustment } = useRoutineStore();
  const { completions } = useCompletionStore();
  const { profile: patientProfile } = usePatientStore();
  const { aiConfig, setAiConfig } = useSettingsStore();

  const [isCreating, setIsCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'routines' | 'analytics' | 'devices' | 'compliance' | 'reports' | 'settings'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as any);
      }
    };
    window.addEventListener('nav-tab', handleNav);
    return () => window.removeEventListener('nav-tab', handleNav);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCompletions = completions.filter(c => c.date === todayStr);

  const handleApproveAdjustment = (routineId: string, newTime: string) => {
    approveAdjustment(routineId, newTime);
    showToast('Schedule adjustment approved');
  };

  const handleRejectAdjustment = (routineId: string) => {
    rejectAdjustment(routineId);
    showToast('Schedule adjustment dismissed');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getMoodIcon = (mood?: string) => {
    switch(mood) {
      case 'Great': return '😄';
      case 'Good': return '🙂';
      case 'Okay': return '😐';
      case 'Confused': return '😕';
      case 'Tired': return '😔';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden animate-in fade-in duration-700 relative">
      
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
           <div className="bg-emerald-500/90 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/20 backdrop-blur-md">
              <CheckCircle2 size={18} className="text-white" />
              <span className="font-medium text-sm tracking-wide">{toastMessage}</span>
           </div>
        </div>
      )}

      {globalAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="bg-rose-500 text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_0_40px_rgba(244,63,94,0.4)] backdrop-blur-xl">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-lg tracking-tight">Active Escalation</h4>
                <p className="text-sm text-rose-100 font-medium">{globalAlert}</p>
              </div>
              <button id="dismiss-global-alert-btn" aria-label="Dismiss Alert" onClick={() => clearAlert?.()} className="ml-4 p-2 bg-black/20 hover:bg-black/40 rounded-xl transition-colors">
                Dismiss
              </button>
           </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`shrink-0 border-r border-line bg-panel flex flex-col pt-8 z-10 hidden md:flex h-full overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20 overflow-hidden'}`}>
        <div className={`px-6 pb-8 mb-4 flex items-center justify-between ${isSidebarOpen ? '' : 'px-0 justify-center'}`}>
          <div className={isSidebarOpen ? '' : 'hidden'}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-faint mb-2">Workspace</p>
            <h2 className="text-base font-semibold text-content">Main Dashboard</h2>
          </div>
          <button 
             id="sidebar-toggle-btn"
             aria-label="Toggle Sidebar"
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className={`p-1.5 rounded-md hover:bg-panel-hover text-content-muted hover:text-content border border-transparent hover:border-line transition-colors ${isSidebarOpen ? '' : ''}`}
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSidebarOpen ? 'rotate-180' : ''}><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-3 hide-scrollbar relative">
          {[
             { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
             { id: 'routines', label: (
               <>
                  Routines
                  {isSidebarOpen && <span className="bg-panel-hover border border-line text-content-muted font-semibold py-0.5 px-2 rounded text-[10px] ml-auto">{routines.length}</span>}
               </>
             ), icon: <ListTodo size={18} /> },
             { id: 'analytics', label: 'Analytics', icon: <Activity size={18} /> },
             { id: 'devices', label: 'Sensors', icon: <Radio size={18} /> },
             { id: 'compliance', label: 'PHI Privacy', icon: <Shield size={18} /> },
             { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
             { id: 'settings', label: (
               <>
                  Settings
                  {aiConfig.isEnabled && isSidebarOpen && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto"></div>}
               </>
             ), icon: <Settings size={18} /> },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                id={`sidebar-nav-${tab.id}-btn`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap overflow-hidden group border ${
                  isActive ? 'bg-panel-hover text-content border-line' : 'border-transparent text-content-muted hover:text-content hover:bg-panel hover:border-line'
                } ${isSidebarOpen ? '' : 'justify-center px-0'}`}
                title={tab.id}
              >
                <span className={`relative z-10 flex items-center gap-3 ${isSidebarOpen ? 'w-full' : 'justify-center'}`}>
                  <div className={`${isActive ? 'text-indigo-500' : 'text-content-faint group-hover:text-content-muted'} transition-colors`}>{tab.icon}</div>
                  {isSidebarOpen && tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <nav className="md:hidden flex overflow-x-auto p-4 gap-2 bg-panel border-b border-line shrink-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'routines', label: 'Routines' },
            { id: 'analytics', label: 'Trends' },
            { id: 'devices', label: 'Sensors' },
            { id: 'compliance', label: 'PHI' },
            { id: 'settings', label: 'System' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap border ${activeTab === tab.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-panel-hover border-line text-content-muted'}`}
            >
              {tab.label}
            </button>
          ))}
      </nav>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-transparent relative">
        
        {/* Universal Top Bar */}
        <div className="h-20 px-8 flex items-center justify-between border-b border-line bg-panel/70 backdrop-blur-xl sticky top-0 z-20">
           <div className="flex items-center gap-4 text-content">
              {activeTab === 'overview' && <LayoutDashboard size={20} className="text-indigo-500" />}
              {activeTab === 'routines' && <ListTodo size={20} className="text-indigo-500" />}
              {activeTab === 'analytics' && <Activity size={20} className="text-indigo-500" />}
              {activeTab === 'devices' && <Radio size={20} className="text-indigo-500" />}
              {activeTab === 'compliance' && <Shield size={20} className="text-indigo-500" />}
              {activeTab === 'reports' && <FileText size={20} className="text-indigo-500" />}
              {activeTab === 'settings' && <Settings size={20} className="text-indigo-500" />}
              <h2 className="text-2xl font-semibold tracking-tight capitalize">
                 {activeTab}
              </h2>
           </div>
           <div className="flex items-center gap-3">
              <button 
                 onClick={() => setActiveTab('settings')} 
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 border ${aiConfig.isEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400' : 'bg-panel border-line text-content-muted hover:text-content'}`}
              >
                 {aiConfig.isEnabled ? <Zap size={14} className="text-amber-500 fill-amber-500" /> : <ZapOff size={14} />}
                 {aiConfig.isEnabled ? 'Gemini Active' : 'AI Offline'}
              </button>
           </div>
        </div>

        <div className="p-8 md:p-12 max-w-7xl mx-auto">
        
        {activeTab === 'overview' && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
               <GlowCard className="md:col-span-2 glass-card flex flex-col justify-center border-l-4" glowColor="rgba(99, 102, 241, 0.15)">
                 <div className="p-10" style={{borderLeftColor: 'var(--primary)', height: '100%'}}>
                   <h2 className="text-4xl md:text-5xl font-display font-light text-content tracking-tight leading-tight">
                      Good morning, <span className="font-semibold text-content">{patientProfile?.primaryCaregiverName || 'Caregiver'}</span>
                   </h2>
                   <p className="text-content-muted mt-4 text-lg max-w-lg">
                      {patientProfile?.name || 'The patient'} is currently tracking on schedule. All morning sensor readings look stable.
                   </p>
                   <div className="mt-8 flex gap-4">
                      <button id="overview-manage-routine-btn" onClick={() => setActiveTab('routines')} className="bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">Manage Routine</button>
                   </div>
                 </div>
               </GlowCard>
               
               {/* Patient Mini-Profile */}
               <GlowCard className="glass-card" glowColor="rgba(16, 185, 129, 0.1)">
                 <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                   <div className="w-20 h-20 bg-panel-hover rounded-full border border-line flex items-center justify-center mb-4">
                      <User size={32} className="text-content-faint" />
                   </div>
                   <h3 className="font-display font-semibold text-xl text-content">{patientProfile?.preferredName || 'Patient'}</h3>
                   <p className="text-sm text-content-muted mt-1 uppercase tracking-widest font-bold">{patientProfile?.stage || 'Monitoring'}</p>
                 </div>
               </GlowCard>
            </div>

            {adjustments.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <h2 className="font-display text-2xl font-semibold text-content tracking-tight">Adaptive Suggestions</h2>
                   <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
                     <Zap size={10} className="fill-amber-500" /> Insight
                   </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {adjustments.map(adj => (
                    <div key={adj.routineId} className="bg-panel border border-line p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-content">{adj.routineName}</h3>
                          <div className="flex items-center text-sm mt-3 mb-4 font-mono bg-panel-hover inline-flex px-3 py-1.5 rounded-lg border border-line">
                            <Clock size={14} className="mr-2 text-content-muted" />
                            <span className="text-content-muted line-through opacity-70">{adj.currentTime}</span> 
                            <span className="mx-2 text-content-faint">→</span> 
                            <span className="text-amber-600 dark:text-amber-500 font-bold">{adj.suggestedTime}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button id={`approve-adj-${adj.routineId}-btn`} onClick={() => handleApproveAdjustment(adj.routineId, adj.suggestedTime)} className="px-4 bg-amber-500 text-white font-bold py-2 rounded-xl transition-colors text-sm shadow-md shadow-amber-500/20 hover:bg-amber-600">
                            Approve
                          </button>
                          <button id={`dismiss-adj-${adj.routineId}-btn`} onClick={() => handleRejectAdjustment(adj.routineId)} className="px-4 bg-panel border border-line hover:bg-panel-hover text-content-muted font-bold py-2 rounded-xl transition-colors text-sm">
                            Dismiss
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-content-muted leading-relaxed relative z-10 border-t border-line pt-4 mt-2">{adj.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h2 className="font-display text-2xl font-semibold text-content tracking-tight">Today's Queue</h2>
                <button onClick={() => setActiveTab('routines')} className="text-sm font-semibold text-content-muted hover:text-content transition-colors">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {routines.slice(0, 3).map(routine => {
                   const completion = todaysCompletions.find(c => c.routineId === routine.id);
                   return <RoutineCard key={routine.id} routine={routine} completion={completion} onStart={() => onStartSimulation(routine.id)} getMoodIcon={getMoodIcon} compact />;
                 })}
              </div>
            </div>
          </div>
        )}

        {/* Routines Listing */}
        {activeTab === 'routines' && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-line pb-6 gap-4">
              <div>
                 <h2 className="font-display text-3xl font-light text-content tracking-tight">All Routines</h2>
                 <p className="text-content-muted text-sm mt-1">{routines.length} established routines</p>
              </div>
              <button 
                id="new-routine-btn"
                onClick={() => setIsCreating(true)}
                className="flex items-center justify-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                <Plus size={16} /> New Routine
              </button>
            </div>

            {aiConfig.isEnabled && (
               <div className="bg-amber-50/50 dark:bg-black/20 mb-2 border border-amber-500/30 p-5 rounded-2xl flex items-start sm:items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                     <AlertCircle size={20} className="text-amber-600 dark:text-amber-500" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-content font-bold text-sm tracking-wide">Dehydration Risk</h4>
                     <p className="text-content-muted text-sm mt-0.5">Based on heat index (84°F) and incomplete water intake in Morning Routine.</p>
                  </div>
               </div>
            )}

            <div className="flex flex-col gap-4">
               {routines.map(routine => {
                 const completion = todaysCompletions.find(c => c.routineId === routine.id);
                 return (
                   <GlowCard key={routine.id} className="bg-panel border border-line rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-line-strong transition-colors" glowColor="rgba(255,255,255,0.05)">
                     <div className="p-4 md:p-6 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-panel-hover border border-line px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-content-muted">{routine.category}</span>
                            {completion && <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500"><CheckCircle2 size={12}/> Completed</span>}
                          </div>
                          <h3 className="text-xl font-bold text-content">{routine.name}</h3>
                          <div className="flex gap-4 mt-2 text-sm text-content-muted">
                            <span className="flex items-center gap-1"><Clock size={14}/> {routine.scheduledTime}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><ListTodo size={14}/> {routine.steps.length} Steps</span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3 md:justify-end">
                          <button id={`simulate-routine-${routine.id}-btn`} aria-label="Simulate Routine" onClick={() => onStartSimulation(routine.id)} className="bg-panel-hover border border-line hover:bg-line text-content px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                            Simulate
                          </button>
                          <button id={`routine-options-${routine.id}-btn`} aria-label="Routine Options" className="p-2 text-content-muted hover:text-content hover:bg-panel-hover rounded-lg transition-colors border border-transparent hover:border-line">
                            <MoreVertical size={20} />
                          </button>
                       </div>
                     </div>
                   </GlowCard>
                 );
               })}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-line pb-6 gap-4">
              <div>
                <h2 className="font-display text-3xl font-light text-content tracking-tight">Analytics & Trends</h2>
                <p className="text-content-muted mt-1">Deep insights over the past week</p>
              </div>
              <button 
                onClick={() => {
                   import('../services/pdfExport').then(m => {
                      if (patientProfile) {
                        m.exportWeeklyReport(patientProfile, completions, routines);
                        showToast('PDF Export started');
                      }
                   });
                }}
                className="flex items-center justify-center gap-2 bg-panel-hover border border-line text-content-muted hover:text-content px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Export PDF
              </button>
            </div>
            
            <WeeklyCharts completions={completions} />
            
            {aiConfig.isEnabled && (
              <div className="bg-panel border border-line rounded-2xl p-6 md:p-8 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                 <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Sparkles size={18} className="fill-indigo-500" />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-content tracking-tight">AI Cognitive Check-in</h3>
                     <p className="text-xs text-content-faint mt-0.5 font-medium uppercase tracking-widest">Generative Insight</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-3">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-content-muted">Mood Correlation</h4>
                     <p className="text-content-muted leading-relaxed text-sm">
                        {patientProfile?.name || 'The patient'} exhibits a <strong className="text-content font-bold">30% stronger completion rate</strong> when expressing "Great" or "Good" in the morning.
                     </p>
                   </div>
                   <div className="space-y-3">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-content-muted">Task Complexity</h4>
                     <p className="text-content-muted leading-relaxed text-sm">
                        He is pausing for an average of <strong className="text-amber-500 font-bold">4.2 mins</strong> on "Prepare Coffee" steps. Consider breaking this down into smaller sub-steps.
                     </p>
                   </div>
                   <div className="space-y-3">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-content-muted">Schedule Drift</h4>
                     <p className="text-content-muted leading-relaxed text-sm">
                        Evening routines are starting later than scheduled (avg 42 mins drift). Recommend shifting medication times to align with eating habits.
                     </p>
                   </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Devices */}
        {activeTab === 'devices' && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8 max-w-6xl">
            <div className="border-b border-line pb-6">
              <h2 className="font-display font-light text-3xl text-content">Connected Devices & Sensors</h2>
              <p className="text-content-muted mt-1 text-sm">Passive context gathering from Apple Health and Smart Home.</p>
            </div>
            <DeviceManager />
          </div>
        )}

        {/* Compliance */}
        {activeTab === 'compliance' && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8 max-w-6xl">
             <div className="border-b border-line pb-6">
                <h2 className="font-display font-light text-3xl text-content">HIPAA & PHI Compliance</h2>
                <p className="text-content-muted mt-1 text-sm">Live view of the zero-trust anonymization pipeline.</p>
             </div>
             <AnonymizationPipeline />
          </div>
        )}

        {/* Reports Engine */}
        {activeTab === 'reports' && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8 max-w-6xl">
             <div className="border-b border-line pb-6">
                <h2 className="font-display font-light text-3xl text-content">Reports Engine</h2>
                <p className="text-content-muted mt-1 text-sm">Generate and export clinical PDFs.</p>
             </div>
             <ReportsEngine />
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-12 max-w-4xl">
             <div className="border-b border-line pb-6">
                <h2 className="font-display font-light text-3xl text-content">System Settings</h2>
             </div>
             
             <div className="bg-panel border border-line rounded-2xl p-8 space-y-8">
                <div>
                  <h3 className="font-semibold text-lg text-content mb-2">AI Capabilities</h3>
                  <p className="text-sm text-content-muted mb-6">Connect CueGuide to Gemini for dynamic memory assistance, mood analysis, and adaptive scheduling.</p>
                  
                  <div className="flex items-center gap-4 bg-panel-hover p-4 rounded-xl border border-line">
                     <label className="flex items-center gap-4 text-sm font-bold tracking-wide text-content cursor-pointer select-none w-full">
                        <div className="relative">
                          <input id="ai-toggle-switch" type="checkbox" checked={aiConfig.isEnabled} onChange={e => setAiConfig({ ...aiConfig, isEnabled: e.target.checked })} className="sr-only peer"/>
                          <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                        </div>
                        <span className="flex flex-col">
                          Enable Live AI Prompts 
                          <span className="text-xs font-normal text-content-muted mt-1">Generates dynamic sub-steps and verbal cues (Powered by Gemini API)</span>
                        </span>
                     </label>
                  </div>
                  
                  {aiConfig.isEnabled && (
                    <div className="mt-6">
                       <label className="block text-xs font-bold uppercase tracking-widest text-content-muted mb-2">Gemini API Key</label>
                       <input 
                         type="password" 
                         value={aiConfig.apiKey} 
                         onChange={e => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                         placeholder="AI Studio API key injected by default" 
                         className="w-full md:w-2/3 px-4 py-3 bg-panel border border-line rounded-xl text-content placeholder:text-content-faint focus:border-indigo-500 focus:outline-none transition-all" 
                       />
                    </div>
                  )}
                </div>
             </div>

             <div className="bg-panel border border-line rounded-2xl p-8">
                 <h3 className="font-semibold text-lg text-content mb-2">Connected Devices</h3>
                 <p className="text-content-muted text-sm mb-6">Passive tracking devices connect patient context automatically.</p>
                 
                 <div className="space-y-4">
                    <div className="bg-panel-hover p-5 rounded-xl border border-line flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-panel rounded-lg border border-line flex items-center justify-center text-content-muted">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                          </div>
                          <div>
                             <h4 className="font-bold text-content text-sm">Apple Health</h4>
                             <p className="text-xs text-content-muted mt-0.5">Sleep staging connected</p>
                          </div>
                       </div>
                       <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-transparent px-2.5 py-1 rounded-md">Connected</span>
                    </div>

                    <div className="bg-panel-hover p-5 rounded-xl border border-line flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-panel rounded-lg border border-line flex items-center justify-center text-content-muted">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                          </div>
                          <div>
                             <h4 className="font-bold text-content text-sm">Smart Sensors</h4>
                             <p className="text-xs text-content-muted mt-0.5">Not configured</p>
                          </div>
                       </div>
                       <button className="text-xs font-bold text-content border border-line bg-panel hover:bg-panel-hover px-3 py-1.5 rounded-md transition-colors">Setup</button>
                    </div>
                 </div>
             </div>
          </div>
        )}
        
        </div>
      </div> 

      <AnimatePresence>
      {isCreating && (
        <RoutineCreator 
           onSave={(r) => { 
             addRoutine(r);
             setIsCreating(false); 
             showToast('Routine created successfully'); 
           }}
           onClose={() => setIsCreating(false)}
        />
      )}
      </AnimatePresence>
    </div>
  );
}
