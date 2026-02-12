
import React, { useEffect, useState } from 'react';
import { HistoryItem, ReviewResult } from '../types';
import { Clock, Code, ChevronRight, Loader2 } from 'lucide-react';

interface Props {
    history: HistoryItem[];
    onSelectReview: (item: HistoryItem) => void;
}

const ReviewHistory: React.FC<Props> = ({ history, onSelectReview }) => {
    if (history.length === 0) {
        return null; // Don't show anything if no history
    }

    return (
        <div className="glass rounded-3xl p-6 border border-white/5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Analyses
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelectReview(item)}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all group flex items-center justify-between border border-transparent hover:border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                <span className="font-mono text-xs font-bold">{item.language === 'python' ? 'Py' : item.language === 'javascript' ? 'JS' : 'TS'}</span>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Analysis #{item.id}</div>
                                <div className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs font-black text-slate-700">SCORE</div>
                                <div className="text-sm font-bold text-white">{item.result.scores.quality}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReviewHistory;
