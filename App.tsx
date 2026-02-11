
import React, { useState, useEffect, useMemo } from 'react';
import { analyzeCode } from './services/geminiService';
import { ReviewState, Language, HistoryItem, View, Severity } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import Button from './components/Button';
import ReviewDashboard from './components/ReviewDashboard';
import IssueList from './components/IssueList';
import CodeComparison from './components/CodeComparison';
import VoiceAssistant from './components/VoiceAssistant';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [state, setState] = useState<ReviewState>(() => {
    const savedHistory = localStorage.getItem('codepulse_history');
    const userName = localStorage.getItem('userName') || '';
    
    return {
      code: '',
      language: Language.Python,
      isAnalyzing: false,
      result: null,
      error: null,
      history: savedHistory ? JSON.parse(savedHistory) : [],
      currentView: 'dashboard' as View,
      settings: {
        displayName: userName,
        preferredLanguages: [Language.JavaScript, Language.TypeScript, Language.Python],
        codingStyle: 'Standard',
        aiProvider: 'Lovable AI (Gemini)',
        darkMode: true
      }
    };
  });

  const handleLogin = (name: string) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    setIsLoggedIn(true);
    setState(prev => ({ ...prev, settings: { ...prev.settings, displayName: name } }));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const handleAnalyze = async () => {
    if (!state.code.trim()) return;
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const result = await analyzeCode(state.code, state.language);
      setState(prev => ({ 
        ...prev, 
        result, 
        isAnalyzing: false, 
        history: [{ id: Date.now().toString(), timestamp: Date.now(), code: state.code, language: state.language, result }, ...prev.history].slice(0, 50)
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: "Analysis failed." }));
    }
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-500/30">
      {/* High-End Loading Overlay */}
      {state.isAnalyzing && (
        <div className="fixed inset-0 z-[100] glass flex items-center justify-center animate-in fade-in duration-500">
          <div className="text-center space-y-8 relative">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 scan-line"></div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-widest uppercase">Analyzing Logic</h3>
              <p className="text-emerald-500 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Gemini 3 Flash Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Navigation */}
      <nav className="h-20 glass sticky top-0 z-50 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setState(prev => ({ ...prev, currentView: 'dashboard' }))}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xs">AI</span>
            </div>
            <span className="font-black text-xl tracking-tighter text-white">CodePulse</span>
          </div>
          <div className="hidden md:flex gap-1">
            {['dashboard', 'analytics', 'settings'].map(v => (
              <button 
                key={v}
                onClick={() => setState(prev => ({ ...prev, currentView: v as View }))}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.currentView === v ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-2xl border border-white/5">
             <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white uppercase">{state.settings.displayName.charAt(0)}</div>
             <span className="text-xs font-bold text-slate-300">{state.settings.displayName}</span>
             <button onClick={handleLogout} className="text-[10px] font-black text-slate-600 hover:text-red-400 transition-colors uppercase ml-2">Exit</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-8 py-12 space-y-12 flex-1">
        {state.currentView === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Real-time Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Analyses', value: state.history.length, color: 'emerald', icon: '🔍' },
                { label: 'Issues', value: state.history.reduce((a, b) => a + b.result.issues.length, 0), color: 'amber', icon: '🐛' },
                { label: 'Critical', value: state.history.reduce((a, b) => a + b.result.issues.filter(i => i.severity === Severity.Critical).length, 0), color: 'red', icon: '🛡️' },
                { label: 'Engine', value: '3.0 Flash', color: 'blue', icon: '⚡' },
              ].map((s, i) => (
                <div key={i} className="glass p-8 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-500/10 blur-3xl rounded-full -mr-8 -mt-8`}></div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.label}</div>
                  <div className="text-4xl font-black text-white tracking-tighter">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Input Arena */}
            <div className="glass rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative group">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <select 
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-400 uppercase tracking-widest cursor-pointer"
                  value={state.language}
                  onChange={(e) => setState(prev => ({ ...prev, language: e.target.value as Language }))}
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500/30"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  className="w-full h-[450px] bg-transparent p-10 text-lg code-font text-slate-300 outline-none resize-none leading-relaxed placeholder:text-slate-800"
                  placeholder="// Paste your complex code here for lightning fast review..."
                  value={state.code}
                  onChange={(e) => setState(prev => ({ ...prev, code: e.target.value }))}
                />
                <div className="absolute bottom-8 right-8">
                  <Button 
                    onClick={handleAnalyze} 
                    isLoading={state.isAnalyzing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/30"
                  >
                    Run Deep Scan
                  </Button>
                </div>
              </div>
            </div>

            {state.result && (
              <div className="mt-20 space-y-16 animate-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
                <ReviewDashboard result={state.result} />
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                   <div className="xl:col-span-3 glass rounded-[40px] border border-white/5 overflow-hidden h-[700px] shadow-2xl">
                      <CodeComparison original={state.code} optimized={state.result.optimizedCode} language={state.language} />
                   </div>
                   <div className="xl:col-span-2 max-h-[700px] overflow-auto pr-2 custom-scroll">
                      <IssueList issues={state.result.issues} />
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {state.currentView === 'analytics' && (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Advanced <span className="text-emerald-500">Analytics</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Processing historical data pulse...</p>
          </div>
        )}
      </main>

      {state.result && <VoiceAssistant contextCode={state.code} language={state.language} />}
    </div>
  );
};

export default App;
