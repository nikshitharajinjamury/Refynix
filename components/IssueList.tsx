
import React from 'react';
import { CodeIssue, Severity, Category } from '../types';

interface Props {
  issues: CodeIssue[];
  onIssueClick?: (issue: CodeIssue) => void;
}

const IssueList: React.FC<Props> = ({ issues, onIssueClick }) => {
  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case Severity.Critical: return 'bg-red-500/20 text-red-400 border-red-500/50';
      case Severity.High: return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case Severity.Medium: return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case Severity.Low: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
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
          className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all cursor-pointer group"
          onClick={() => onIssueClick?.(issue)}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getCategoryIcon(issue.category)}</span>
              <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                {issue.title}
              </h4>
            </div>
            <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getSeverityColor(issue.severity)}`}>
              {issue.severity}
            </span>
          </div>
          
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            {issue.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-900/80 px-2 py-1 rounded text-slate-500 border border-slate-800">
              Line {issue.line}
            </div>
            <div className="text-blue-400/80 italic">
              Fix: {issue.suggestion}
            </div>
          </div>
        </div>
      ))}

      {issues.length === 0 && (
        <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-slate-300 font-medium">No issues detected!</h3>
          <p className="text-slate-500 text-sm mt-1">Your code looks solid.</p>
        </div>
      )}
    </div>
  );
};

export default IssueList;
