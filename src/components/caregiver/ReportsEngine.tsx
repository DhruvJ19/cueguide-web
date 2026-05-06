import React, { useState } from 'react';
import { FileText, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePatientStore } from '../../store/patientStore';
import { useCompletionStore } from '../../store/completionStore';
import { useRoutineStore } from '../../store/routineStore';
import GlowCard from '../GlowCard';

export default function ReportsEngine() {
  const { profile } = usePatientStore();
  const { completions } = useCompletionStore();
  const { routines } = useRoutineStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportReady, setReportReady] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setReportReady(false);
    setProgress(0);
    
    // Fake progress animation
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            setReportReady(true);
          }, 500);
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);
  };

  const handleDownload = () => {
    import('../../services/pdfExport').then(m => {
      if (profile) {
        m.exportWeeklyReport(profile, completions, routines);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold text-content mb-6 flex items-center gap-2">
            <FileText className="text-indigo-500" /> Report Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-content-muted mb-2">Time Range</label>
              <select className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none">
                <option value="7">Last 7 Days (Standard)</option>
                <option value="30">Last 30 Days (Clinical)</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-content-muted mb-2">Included Modules</label>
              <div className="space-y-2">
                {['Routine Adherence', 'Device & Sensor Logs', 'AI Cognitive Check-in', 'Caregiver Adjustments'].map((mod, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-line bg-panel-hover cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    <span className="text-sm font-medium text-content">{mod}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Compiling Data... {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {!reportReady && !isGenerating && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-content-muted border-2 border-dashed border-line rounded-3xl"
            >
              <FileText size={48} className="text-content-faint mb-4" />
              <p className="font-medium">Configure and generate a report to preview.</p>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="w-64 h-2 bg-line rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-content-muted animate-pulse">Running data aggregation pipeline...</p>
            </motion.div>
          )}

          {reportReady && (
            <motion.div 
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col h-full"
            >
              <GlowCard className="flex-1 glass-panel p-8 flex flex-col h-full relative" glowColor="rgba(16, 185, 129, 0.15)">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                    <FileText size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-semibold text-content">Weekly Care Report</h3>
                    <p className="text-content-muted mt-1">Ready for export and sharing.</p>
                  </div>
                  
                  <div className="w-full bg-panel-hover border border-line rounded-xl p-4 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-content-muted">Patient:</span>
                      <span className="font-bold text-content">{profile?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-content-muted">Data Points:</span>
                      <span className="font-bold text-content">{completions.length} routines</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-content-muted">Privacy:</span>
                      <span className="font-bold text-emerald-500">PHI Stripped</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1"
                  >
                    <Download size={20} />
                    Download PDF
                  </button>
                </div>
              </GlowCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
