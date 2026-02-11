
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { authService } from '../services/authService';
import { VirtualEmail } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  Inbox, 
  ChevronDown,
  UserCheck,
  Zap,
  Gauge
} from 'lucide-react';

interface Props {
  onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup' | 'confirm'>('signin');
  const [virtualCode, setVirtualCode] = useState('');
  const [inbox, setInbox] = useState<VirtualEmail[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<VirtualEmail | null>(null);

  useEffect(() => {
    if (mode === 'signin') {
      setEmail('demo@refinyx.io');
    }
  }, [mode]);

  const dispatchVirtualEmail = (targetEmail: string, code: string) => {
    const newEmail: VirtualEmail = {
      id: Math.random().toString(36).substr(2, 9),
      from: 'security@refinyx.io',
      subject: '[Refinyx] Groq LPU Authorization Code',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      code: code,
      body: `Architect,\n\nAuthorize your secure Groq LPU workspace using the code below.\n\nCode: ${code}\n\nSecurity notice: This is a frontend-only simulation.`
    };
    setInbox(prev => [newEmail, ...prev]);
    setIsInboxOpen(true);
    setTimeout(() => { setSelectedEmail(newEmail); }, 600);
  };

  const handleGuestAccess = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin("Guest Architect");
      setLoading(false);
    }, 800);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.signIn(email);
    if (res.success && res.user) {
      onLogin(res.user.name);
    } else if (res.error === "Verification pending.") {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVirtualCode(code);
      dispatchVirtualEmail(email, code);
      setMode('confirm');
    } else {
      setError(res.error || "Login failed.");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.signUp(email, fullName || email.split('@')[0]);
    if (res.success) {
      setVirtualCode(res.code || '');
      dispatchVirtualEmail(email, res.code || '');
      setMode('confirm');
    } else {
      setError(res.error || "Registration failed.");
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.verifyCode(email, verificationCode, virtualCode);
    if (res.success) {
      const users = authService.getUsers();
      const user = users.find(u => u.email === email);
      onLogin(user?.name || email);
    } else {
      setError(res.error || "Invalid code. Click the inbox below.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-grid opacity-10"></div>

      {/* Pulsing Virtual Inbox */}
      <div className={`fixed bottom-8 left-8 z-[100] transition-all duration-700 transform ${isInboxOpen ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="w-80 md:w-96 bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 text-slate-900">
          <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Inbox className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-sm block">Refinyx Mail</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incoming Logs</span>
              </div>
            </div>
            <button onClick={() => setIsInboxOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl"><ChevronDown className="w-5 h-5" /></button>
          </div>
          <div className="h-[400px] overflow-y-auto bg-white custom-scroll">
            {selectedEmail ? (
              <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-300">
                <button onClick={() => setSelectedEmail(null)} className="text-xs text-orange-600 font-black mb-6">← Back</button>
                <h4 className="font-black text-xl leading-tight mb-4">{selectedEmail.subject}</h4>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
                   <p className="text-xs text-slate-600 leading-relaxed mb-8 italic">"{selectedEmail.body}"</p>
                   <div className="text-center py-6 bg-white rounded-2xl border-2 border-dashed border-orange-200">
                      <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Verification PIN</p>
                      <p className="text-4xl font-black text-orange-600 tracking-[0.2em]">{selectedEmail.code}</p>
                   </div>
                </div>
                <Button onClick={() => { setVerificationCode(selectedEmail.code); setSelectedEmail(null); setIsInboxOpen(false); }} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-black uppercase">Auto-Fill PIN</Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {inbox.length === 0 ? <div className="p-24 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">No Incoming Logs</div> : inbox.map(item => (
                  <div key={item.id} onClick={() => setSelectedEmail(item)} className="p-5 hover:bg-orange-50 cursor-pointer flex gap-4 transition-all">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20"><ShieldCheck className="w-6 h-6 text-orange-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1"><span className="text-xs font-black">LPU Protocol</span><span className="text-[10px] text-slate-400 font-bold">{item.time}</span></div>
                      <p className="text-xs font-black text-slate-800 truncate mb-1">{item.subject}</p>
                      <p className="text-[10px] text-slate-500 font-bold">PIN: {item.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {inbox.length > 0 && !isInboxOpen && (
        <button 
          onClick={() => setIsInboxOpen(true)}
          className="fixed bottom-8 left-8 z-[110] flex items-center gap-4 bg-white px-6 py-4 rounded-[24px] shadow-2xl border border-orange-100 animate-bounce hover:scale-105 transition-all ring-4 ring-orange-500/20"
        >
          <div className="relative">
            <Inbox className="w-6 h-6 text-orange-600" />
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">{inbox.length}</div>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-slate-900 block uppercase tracking-widest leading-none mb-1">Authorization PIN</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Intercepted Data</span>
          </div>
        </button>
      )}

      <div className="w-full max-w-lg p-1 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass rounded-[48px] shadow-2xl border border-white/5 p-10 md:p-14 overflow-hidden relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/10 rounded-3xl mb-8 border border-orange-500/20 shadow-inner group transition-all hover:rotate-6">
              <Layers className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Refinyx <span className="text-orange-500">{mode === 'confirm' ? 'Gate' : 'LPU'}</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">{mode === 'confirm' ? 'Inference Handshake' : 'Groq-Powered Code Architecture'}</p>
          </div>

          {error && <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-xs font-bold animate-in slide-in-from-top-4"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-4">
                <input required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="demo@refinyx.io" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input required type="password" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Password (Any)" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              
              <div className="space-y-3">
                <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20">
                  Authorize Identity <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                
                <div className="relative py-4">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-700"><span className="bg-[#0b1321] px-4">Instant Entry</span></div>
                </div>

                <Button type="button" onClick={handleGuestAccess} variant="ghost" className="w-full border border-white/10 hover:bg-white/5 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-orange-400">
                  <UserCheck className="w-3.5 h-3.5 mr-2" />
                  Continue as Guest
                </Button>
              </div>

              <div className="text-center pt-4">
                <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-orange-400 uppercase tracking-widest transition-colors underline decoration-orange-500/20 underline-offset-8">
                  Initialize LPU Credentials
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <input required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input required type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Architect Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input required type="password" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Security PIN" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">
                Register Architect <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-orange-400 uppercase tracking-widest">
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'confirm' && (
            <form onSubmit={handleVerify} className="space-y-8">
              <div className="text-center p-6 bg-orange-500/5 rounded-[32px] border border-orange-500/10">
                <p className="text-[10px] text-orange-400 uppercase font-black tracking-widest mb-2 flex items-center justify-center gap-2">
                   <Gauge className="w-3 h-3 animate-pulse" /> LPU Tunnel Open
                </p>
                <p className="text-xs text-slate-400 font-medium italic">Check intercepted mail (bottom-left) for PIN</p>
              </div>
              <input required maxLength={6} type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-3xl px-6 py-6 text-center text-4xl tracking-[0.6em] text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-black shadow-inner" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} />
              <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-orange-500/30">
                Confirm Handshake
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
