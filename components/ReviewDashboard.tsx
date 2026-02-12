
import React from 'react';
import { ReviewResult } from '../types';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Visualizer from './Visualizer';

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
        <div className="lg:col-span-3 bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-blue-500/20"></div>
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            LPU Analysis Report
          </h3>
          <p className="text-3xl font-extrabold text-white leading-tight tracking-tight mb-12 relative z-10">
            {result.summary}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 mb-8">
            {Object.entries(result.scores).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key}</div>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-black text-white tracking-tighter">{value as number}%</div>
                  <div className={`w-1.5 h-6 rounded-full ${value as number > 85 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-amber-500'}`}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-12 relative z-10 border-t border-white/5 pt-8">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Time Complexity</div>
              <div className="text-2xl font-black text-white italic">{result.timeComplexity || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Space Complexity</div>
              <div className="text-2xl font-black text-white italic">{result.spaceComplexity || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 flex flex-col items-center justify-center relative group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px]"></div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Metrics Radar</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Impact Assessment Grid */}
      {result.impacts && result.impacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.impacts
            .filter(impact => !impact.metric.toLowerCase().includes('complexity'))
            .map((impact, idx) => (
              <div key={idx} className="bg-[#0f172a]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{impact.metric}</div>
                  <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                    {impact.improvement}
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-2xl font-bold text-white tracking-tighter">
                    {impact.after} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">{impact.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">
                    Was: {impact.before}
                  </div>
                </div>
                <div className="mt-4 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    style={{ width: `${Math.min(100, (impact.after / (impact.before || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Architectural Visualizations */}
      {result.visualizations && (
        <Visualizer visualizations={result.visualizations as any} />
      )}
    </div>
  );
};

export default ReviewDashboard;
