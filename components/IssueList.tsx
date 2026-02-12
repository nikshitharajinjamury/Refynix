
import React from 'react';
import { CodeIssue, Severity, Category } from '../types';

interface Props {
  issues: CodeIssue[];
  onIssueClick?: (issue: CodeIssue) => void;
}

const IssueList: React.FC<Props> = ({ issues, onIssueClick }) => {
  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case Severity.Critical: return 'bg-red-500/10 text-red-400 border-red-500/20';
      case Severity.High: return 'bg-red-500/10 text-red-400 border-red-500/20'; // Changed from orange to red
      case Severity.Medium: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'; // Changed from amber to yellow
      case Severity.Low: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case Category.Security: return '🛡️';
      case Category.Performance: return '⚡';
      case Category.Maintainability: return '🛠️';
      case Category.Bug: return '🐛';
      case Category.BestPractice: return '✨';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all cursor-pointer group shadow-lg"
          onClick={() => onIssueClick?.(issue)}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getCategoryIcon(issue.category)}</span>
              <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                {issue.title}
              </h4>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${getSeverityColor(issue.severity)}`}>
              {issue.severity}
            </span>
          </div>

          <p className="text-slate-400 text-sm mb-4 leading-relaxed font-medium">
            {issue.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-black/30 px-2 py-1 rounded text-slate-500 border border-white/5 font-mono">
              Line {issue.line}
            </div>
            <div className="text-blue-400/80 italic font-medium">
              Fix: {issue.suggestion}
            </div>
          </div>
        </div>
      ))}

      {issues.length === 0 && (
        <div className="text-center py-12 bg-[#1e293b]/40 backdrop-blur-sm rounded-2xl border border-dashed border-white/10">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-slate-300 font-medium">No issues detected!</h3>
          <p className="text-slate-500 text-sm mt-1">Your code looks solid.</p>
        </div>
      )}
    </div>
  );
};

export default IssueList;
