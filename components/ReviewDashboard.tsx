
import React from 'react';
import { ReviewResult } from '../types';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface Props {
  result: ReviewResult;
}

const ReviewDashboard: React.FC<Props> = ({ result }) => {
  const chartData = [
    { subject: 'Security', A: result.scores.security },
    { subject: 'Performance', A: result.scores.performance },
    { subject: 'Maintainability', A: result.scores.maintainability },
    { subject: 'Quality', A: result.scores.quality },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 glass rounded-[40px] p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-emerald-500/20"></div>
          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Executive Analysis
          </h3>
          <p className="text-3xl font-extrabold text-white leading-tight tracking-tight mb-12 relative z-10">
            {result.summary}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {Object.entries(result.scores).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key}</div>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-black text-white tracking-tighter">{value as number}%</div>
                  <div className={`w-1.5 h-6 rounded-full ${value as number > 85 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-[40px] p-10 border border-white/5 flex flex-col items-center justify-center relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px]"></div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">System Radar</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#ffffff0a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Impact Assessment Grid */}
      {result.impacts && result.impacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.impacts.map((impact, idx) => (
            <div key={idx} className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{impact.metric}</div>
                <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                  {impact.improvement}
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-2xl font-bold text-white">
                  {impact.after} <span className="text-xs text-slate-500 font-medium">{impact.unit}</span>
                </div>
                <div className="text-xs text-slate-600 mb-1 line-through">
                  from {impact.before}
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full" 
                  style={{ width: `${Math.min(100, (impact.after / (impact.before || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewDashboard;
