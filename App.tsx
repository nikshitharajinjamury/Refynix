
import React, { useState, useEffect, useMemo } from 'react';
import { analyzeCode } from './services/geminiService';
import { ReviewState, Language, HistoryItem, View, Severity, Category } from './types';
import { SUPPORTED_LANGUAGES, SAMPLE_CODE } from './constants';
import Button from './components/Button';
import ReviewDashboard from './components/ReviewDashboard';
import IssueList from './components/IssueList';
import CodeComparison from './components/CodeComparison';
import VoiceAssistant from './components/VoiceAssistant';
import LoginPage from './components/LoginPage';
import ReviewHistory from './components/ReviewHistory';
import ParticlesBackground from './components/ParticlesBackground';
import TestCases from './components/TestCases';
import InterviewPrep from './components/InterviewPrep';
import {
  LayoutDashboard,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Bug,
  ShieldAlert,
  Zap,
  Code2,
  Cpu,
  Trash2,
  FileCode,
  Activity,
  Layers,
  Globe,
  Gauge,
  ArrowRight,
  Clock,
  ChevronRight,
  Check,
  GraduationCap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [analysisStep, setAnalysisStep] = useState(0);

  const [state, setState] = useState<ReviewState>(() => {
    const savedHistory = localStorage.getItem('codepulse_history');
    const userName = localStorage.getItem('userName') || '';

    return {
      code: '',
      language: Language.Python,
      isAnalyzing: false,
      result: null,
      error: null,
      history: [],
      currentView: 'dashboard' as View,
      settings: {
        displayName: userName,
        preferredLanguages: [Language.JavaScript, Language.Python],
        codingStyle: 'Standard',
        analysisDepth: 'Quick',
        emailReports: true,
        darkMode: true
      }
    };
  });

  const steps = ["Groq LPU Handshake", "Llama 3.3 Reasoning", "Security Vector Scan", "Optimizing Code", "Finalizing JSON"];

  useEffect(() => {
    let interval: any;
    if (state.isAnalyzing) {
      setAnalysisStep(0);
      interval = setInterval(() => {
        setAnalysisStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 200);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [state.isAnalyzing]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isLoggedIn) return;

      try {
        const token = localStorage.getItem('refinyx_token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Map backend id (number) to frontend expected format if needed, but we updated types to number
          setState(prev => ({ ...prev, history: data }));
        }
      } catch (err) {
        console.error("Failed to sync history from backend", err);
      }
    };

    fetchHistory();
  }, [isLoggedIn]);

  const handleLogin = (name: string) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    setIsLoggedIn(true);
    setState(prev => ({ ...prev, settings: { ...prev.settings, displayName: name } }));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('refinyx_token'); // Clear token on logout
    setIsLoggedIn(false);
  };

  const handleAnalyze = async () => {
    if (!state.code.trim()) return;
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, result: null }));

    try {
      const instruction = `Style: ${state.settings.codingStyle}. Depth: ${state.settings.analysisDepth}.`;
      const result = await analyzeCode(state.code, state.language, instruction);
      setState(prev => ({
        ...prev,
        result,
        isAnalyzing: false,
        history: [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          code: state.code,
          language: state.language,
          result
        }, ...prev.history].slice(0, 50)
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message || "Groq analysis failed. Verify API Key." }));
    }
  };

  const loadSample = () => {
    setState(prev => ({ ...prev, code: SAMPLE_CODE[prev.language] }));
  };

  const clearCode = () => {
    setState(prev => ({ ...prev, code: '', result: null }));
  };

  const analyticsData = useMemo(() => {
    return state.history.slice().reverse().map(h => {
      // Ensure UTC interpretation if 'Z' is missing from backend timestamp
      const ts = h.timestamp.endsWith('Z') ? h.timestamp : h.timestamp + 'Z';
      return {
        name: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quality: h.result.scores.quality,
        performance: h.result.scores.performance,
        security: h.result.scores.security,
      };
    });
  }, [state.history]);

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 relative overflow-hidden bg-[#020617]">
      <ParticlesBackground />

      {/* Background Gradients */}
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-10 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>

      {/* Loading Overlay */}
      {state.isAnalyzing && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center space-y-6 max-w-sm w-full px-6">
            <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 border-[3px] border-blue-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-[3px] border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Groq LPU Processing...</h3>
              <div className="flex flex-col gap-1.5">
                {steps.map((s, i) => (
                  <div key={s} className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${i === analysisStep ? 'text-blue-400 opacity-100 scale-105' : i < analysisStep ? 'text-slate-600 opacity-50' : 'text-slate-800 opacity-20'}`}>
                    {i === analysisStep && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>}
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="h-20 bg-[#0f172a]/60 backdrop-blur-xl sticky top-0 z-50 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setState(prev => ({ ...prev, currentView: 'dashboard' }))}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-white">Refynix <span className="text-blue-500">AI</span></span>
          </div>
          <div className="hidden md:flex gap-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'interview', icon: GraduationCap, label: 'Interview Prep' },
              { id: 'history', icon: Clock, label: 'History' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setState(prev => ({ ...prev, currentView: v.id as View }))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${state.currentView === v.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <v.icon className="w-3.5 h-3.5" />
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Groq LPU Backend</span>
              <span className="text-[9px] font-semibold text-slate-500">v3.3 connected</span>
            </div>
            <Gauge className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-2xl border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white uppercase">{state.settings.displayName.charAt(0)}</div>
            <span className="text-xs font-bold text-slate-300">{state.settings.displayName}</span>
            <button onClick={handleLogout} className="text-[10px] font-black text-slate-600 hover:text-red-400 transition-colors uppercase ml-2 flex items-center gap-1">
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-8 py-12 space-y-12 flex-1 relative z-10">
        {state.currentView === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {state.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-widest text-center animate-bounce">
                {state.error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'LPU Refinements', value: state.history.length, color: 'orange', icon: Search },
                { label: 'System Health', value: state.history.length > 0 ? Math.round(state.history.reduce((a, b) => a + b.result.scores.quality, 0) / state.history.length) + '%' : 'N/A', color: 'blue', icon: Activity },
                { label: 'Detected Issues', value: state.history.reduce((a, b) => a + b.result.issues.length, 0), color: 'amber', icon: Bug },
                { label: 'Refinyx Engine', value: 'Llama 3.3', color: 'orange', icon: Cpu },
              ].map((s, i) => (
                <div key={i} className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 hover:border-white/20 transition-all group overflow-hidden relative shadow-2xl">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full -mr-8 -mt-8`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                    <s.icon className={`w-4 h-4 text-slate-600`} />
                  </div>
                  <div className="text-4xl font-black text-white tracking-tighter">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative group">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <select
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 text-blue-400 uppercase tracking-widest cursor-pointer"
                        value={state.language}
                        onChange={(e) => setState(prev => ({ ...prev, language: e.target.value as Language }))}
                      >
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                      <button onClick={loadSample} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all">
                        <FileCode className="w-3 h-3 text-blue-500" />
                        Load Sample
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={clearCode} className="text-[10px] font-black text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1.5">
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500/30"></div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      className="w-full h-[450px] bg-transparent p-10 text-lg code-font text-slate-300 outline-none resize-none leading-relaxed placeholder:text-slate-700"
                      placeholder="// Paste your source code here for Groq-powered refinement..."
                      value={state.code}
                      onChange={(e) => setState(prev => ({ ...prev, code: e.target.value }))}
                    />
                    <div className="absolute bottom-8 right-8">
                      <Button
                        onClick={handleAnalyze}
                        isLoading={state.isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/30 flex items-center gap-3"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        Refine with Groq
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <ReviewHistory
                  history={state.history}
                  onSelectReview={(item) => setState(prev => ({ ...prev, code: item.code, result: item.result, language: item.language }))}
                />
              </div>
            </div>

            {state.result && (
              <div className="mt-20 space-y-16 animate-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
                <ReviewDashboard result={state.result} />
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                  <div className="xl:col-span-3 bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] border border-white/10 overflow-hidden h-[700px] shadow-2xl">
                    <CodeComparison original={state.code} optimized={state.result.optimizedCode} language={state.language} />
                  </div>
                  <div className="xl:col-span-2 max-h-[700px] overflow-auto pr-2 custom-scroll space-y-6">
                    <TestCases code={state.code} language={state.language} />
                    <IssueList issues={state.result.issues} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {state.currentView === 'interview' && (
          <InterviewPrep />
        )}

        {state.currentView === 'analytics' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Refynix <span className="text-blue-500">Insights</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Architectural performance & complexity metrics</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Performance Card */}
              <div className="bg-[#0f172a]/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl lg:col-span-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> User Performance Trend
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Area type="monotone" dataKey="quality" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorQuality)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Complexity Metrics Card */}
              <div className="space-y-8">
                <div className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors"></div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Time Complexity</h3>
                  <div className="text-5xl font-black text-white tracking-tighter mb-2 italic">
                    {state.result?.timeComplexity || 'N/A'}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Growth rate relative to input size</p>
                </div>

                <div className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-8 -mt-8 group-hover:bg-indigo-500/10 transition-colors"></div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Space Complexity</h3>
                  <div className="text-5xl font-black text-blue-500 tracking-tighter mb-2 italic">
                    {state.result?.spaceComplexity || 'N/A'}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Memory footprint during execution</p>
                </div>
              </div>
            </div>

            {state.history.length === 0 && (
              <div className="bg-[#0f172a]/60 backdrop-blur-xl p-20 rounded-[40px] text-center border border-dashed border-white/5 shadow-2xl">
                <BarChart3 className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No historical data found. Start by refining your first file.</p>
              </div>
            )}
          </div>
        )}

        {state.currentView === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Refinyx <span className="text-blue-500">Preferences</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Workspace Configuration</p>
            </div>
            <div className="space-y-6">
              <div className="bg-[#0f172a]/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-3xl font-black text-white shadow-2xl">{state.settings.displayName.charAt(0)}</div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Display Name</h3>
                    <input type="text" className="w-full bg-[#1e293b]/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" value={state.settings.displayName} onChange={(e) => setState(prev => ({ ...prev, settings: { ...prev.settings, displayName: e.target.value } }))} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Coding Style</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['Standard', 'Google', 'Airbnb'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, codingStyle: style as any } }))}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${state.settings.codingStyle === style ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Analysis Depth</h3>
                  <div className="flex gap-4 p-1 bg-black/40 rounded-2xl border border-white/5">
                    {['Quick', 'Detailed'].map((depth) => (
                      <button
                        key={depth}
                        onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, analysisDepth: depth as any } }))}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${state.settings.analysisDepth === depth ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {depth} Scan
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-2xl space-y-6">
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> System Status</h4>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <Cpu className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-200">Refynix Engine (Groq LPU)</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active & Ready</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${state.settings.emailReports ? 'border-blue-500 bg-blue-500' : 'border-slate-600'}`}>
                      {state.settings.emailReports && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">Email Reports</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Receive weekly analysis summaries</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, emailReports: !prev.settings.emailReports } }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${state.settings.emailReports ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${state.settings.emailReports ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {state.currentView === 'history' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Analysis <span className="text-blue-500">History</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Review your past code refinements</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {state.history.length === 0 ? (
                <div className="bg-[#0f172a]/60 backdrop-blur-xl p-20 rounded-[40px] text-center border border-dashed border-white/5 shadow-2xl">
                  <Clock className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No history found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.history.map((item) => (
                    <div key={item.id} className="bg-[#0f172a]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">{item.language}</span>
                          <span className="text-[10px] font-bold text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="h-16 mb-4 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]/80"></div>
                          <pre className="text-[10px] text-slate-500 font-mono opacity-50">{item.code}</pre>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Quality Score</span>
                            <span className="text-lg font-black text-blue-400">{item.result.scores.quality}%</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>

                        <button
                          onClick={() => {
                            setState(prev => ({ ...prev, currentView: 'dashboard', code: item.code, result: item.result }));
                          }}
                          className="w-full py-3 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          View Analysis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {state.result && <VoiceAssistant contextCode={state.code} language={state.language} />}
    </div>
  );
};

export default App;
