
import React from 'react';

interface Props {
  original: string;
  optimized: string;
  language: string;
}

const CodeComparison: React.FC<Props> = ({ original, optimized, language }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-white/5 h-full">
      <div className="flex flex-col h-full bg-[#0b0f1a]/80 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Original Source</span>
          <span className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse"></span>
        </div>
        <pre className="p-6 overflow-auto flex-1 code-font text-xs text-slate-400 whitespace-pre leading-relaxed">
          {original}
        </pre>
      </div>

      <div className="flex flex-col h-full bg-[#0b0f1a]/80 backdrop-blur-md overflow-hidden border-l border-white/5">
        <div className="px-5 py-3 border-b border-white/5 bg-emerald-900/10 flex justify-between items-center">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Optimized Rewrite</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <pre className="p-6 overflow-auto flex-1 code-font text-xs text-emerald-100 whitespace-pre leading-relaxed bg-emerald-950/10">
          {optimized}
        </pre>
      </div>
    </div>
  );
};

export default CodeComparison;
