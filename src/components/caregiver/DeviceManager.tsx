import React from 'react';
import { Activity, Radio, Smartphone, Watch, Wifi } from 'lucide-react';
import { INITIAL_SENSORS } from '../../data';
import { format, parseISO } from 'date-fns';

import { motion } from 'motion/react';

export default function DeviceManager() {
  const latestHeartRate = INITIAL_SENSORS.find(s => s.type === 'heart_rate')?.value || '72';
  const latestMotion = INITIAL_SENSORS.filter(s => s.type === 'motion').slice(0, 3);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Apple Health Integration */}
        <div className="glass-card p-8 border-l-4 border-l-rose-500 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-rose-500/5 group-hover:text-rose-500/10 transition-colors duration-500">
            <Watch size={180} />
          </div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
              <Activity className="text-rose-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-content tracking-tight">Apple Health</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mt-1">Active Sync</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="bg-panel p-4 rounded-xl border border-line flex justify-between items-center">
              <div>
                <p className="text-xs text-content-muted font-bold uppercase tracking-widest mb-1">Resting Heart Rate</p>
                <p className="text-2xl font-display font-light text-content">{latestHeartRate} <span className="text-sm text-content-muted">bpm</span></p>
              </div>
              <div className="h-10 w-24">
                {/* Mock sparkline */}
                <svg viewBox="0 0 100 30" className="w-full h-full stroke-rose-500 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M0,15 Q10,15 15,5 T30,25 T45,10 T60,20 T75,5 T90,15 L100,15" />
                </svg>
              </div>
            </div>
            <div className="bg-panel p-4 rounded-xl border border-line flex justify-between items-center">
              <div>
                <p className="text-xs text-content-muted font-bold uppercase tracking-widest mb-1">Sleep Quality</p>
                <p className="text-2xl font-display font-light text-content">6h 45m</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md">82% Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Home Sensors */}
        <div className="glass-card p-8 border-l-4 border-l-indigo-500 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors duration-500">
            <Wifi size={180} />
          </div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Radio className="text-indigo-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-content tracking-tight">Smart Home Hub</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mt-1">3 Sensors Online</p>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <h4 className="text-xs font-bold text-content-muted uppercase tracking-widest mb-2">Recent Motion Events</h4>
            {latestMotion.map((m, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-panel border border-line rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-line-strong'}`} />
                  <span className="text-sm font-medium text-content">{['Hallway', 'Kitchen', 'Bathroom'][i % 3]} Motion</span>
                </div>
                <span className="text-xs text-content-muted font-mono">{format(parseISO(m.timestamp), 'h:mm a')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-8 text-center flex flex-col items-center justify-center border border-dashed border-line">
        <Smartphone className="text-content-faint mb-4" size={32} />
        <h3 className="text-lg font-bold text-content mb-2">Add New Device</h3>
        <p className="text-sm text-content-muted mb-6 max-w-sm">Connect new passive tracking devices to improve AI contextual awareness and escalation accuracy.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="bg-panel-hover hover:bg-line border border-line text-content font-bold px-6 py-2.5 rounded-xl"
        >
          Pair Device
        </motion.button>
      </div>
    </div>
  );
}
