import React, { useMemo } from 'react';
import { Completion } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays } from 'date-fns';
import { Activity, Clock, Flame } from 'lucide-react';
import GlowCard from '../GlowCard';

interface Props {
  completions: Completion[];
}

export default function WeeklyCharts({ completions }: Props) {
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayCompletions = completions.filter(c => c.date === dateStr);
      
      const completed = dayCompletions.filter(c => c.status === 'completed').length;
      const partial = dayCompletions.filter(c => c.status === 'partial').length;
      const missed = dayCompletions.filter(c => c.status === 'missed').length;
      const avgMinutes = dayCompletions.length > 0 ? Math.round(dayCompletions.reduce((acc, curr) => acc + curr.minutes, 0) / dayCompletions.length) : 0;
      
      data.push({ date: format(d, 'EEE'), completed, partial, missed, avgMinutes });
    }
    return data;
  }, [completions]);

  const heatmapData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const comps = completions.filter(c => c.date === dateStr);
      const completeCount = comps.filter(c => c.status === 'completed').length;
      data.push({ date: dateStr, count: completeCount });
    }
    return data;
  }, [completions]);

  const last7DaysTotal = weeklyData.reduce((acc, curr) => acc + curr.completed + curr.partial + curr.missed, 0);
  const completionRate = last7DaysTotal === 0 ? 0 : Math.round((weeklyData.reduce((acc, curr) => acc + curr.completed, 0) / last7DaysTotal) * 100);

  return (
    <div className="space-y-6 w-full mb-12">
      {/* 30 Day Activity Map */}
      <GlowCard className="glass-card border-line relative overflow-hidden group" glowColor="rgba(16, 185, 129, 0.15)">
         <div className="p-6">
           <div className="absolute -right-4 -top-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors duration-700 pointer-events-none">
              <Flame size={120} />
           </div>
           <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-content text-sm tracking-widest uppercase">30-Day Adherence Streak</h3>
              <span className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20 text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)]">Excellent</span>
           </div>
           <div className="flex flex-wrap gap-1 relative z-10">
              {heatmapData.map((d, i) => (
                 <div 
                   key={i} 
                   title={`${d.count} completed on ${d.date}`}
                   className={`w-4 sm:w-6 h-10 sm:h-12 rounded-md transition-all duration-300 hover:scale-110 ${
                      d.count > 3 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                      d.count > 1 ? 'bg-emerald-500/60' :
                      d.count === 1 ? 'bg-emerald-500/30' : 'bg-panel border border-line'
                   }`}
                 />
              ))}
           </div>
         </div>
      </GlowCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="glass-card flex flex-col h-[400px]">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div>
                 <h2 className="font-display text-2xl font-light text-content flex items-center gap-2 tracking-tight">
                   <Activity size={22} className="text-indigo-400" /> Completion Rate
                 </h2>
                 <p className="text-xs font-bold uppercase tracking-widest text-content-muted mt-2">Past 7 Days</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-6">
                <div>
                  <div className="font-display text-5xl font-light text-content">{completionRate}<span className="text-2xl text-content-muted">%</span></div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Full Compl.</div>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 11, fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(5, 7, 10, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="completed" stackId="a" fill="url(#colorComplete)" radius={[0, 0, 4, 4]} name="Completed" />
                  <Bar dataKey="partial" stackId="a" fill="#FBBF24" name="Partial" />
                  <Bar dataKey="missed" stackId="a" fill="#F87171" radius={[4, 4, 0, 0]} name="Missed" />
                  <defs>
                    <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlowCard>

        <GlowCard className="glass-card flex flex-col h-[400px]">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div>
                 <h2 className="font-display text-2xl font-light text-content flex items-center gap-2 tracking-tight">
                   <Clock size={22} className="text-indigo-400" /> Engagement Time
                 </h2>
                 <p className="text-xs font-bold uppercase tracking-widest text-content-muted mt-2">Minutes per routine</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-6">
                <div>
                  <div className="font-display text-5xl font-light text-content">{Math.round(weeklyData.reduce((acc, curr) => acc + curr.avgMinutes, 0) / 7)}<span className="text-2xl text-content-muted">m</span></div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-1">7-Day Avg</div>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 11, fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(5, 7, 10, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#818CF8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="avgMinutes" name="Avg. Minutes" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorMinutes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
