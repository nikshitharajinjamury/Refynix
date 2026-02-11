
import React, { useState } from 'react';
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
  ChevronDown
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

  const dispatchVirtualEmail = (targetEmail: string, code: string) => {
    const newEmail: VirtualEmail = {
      id: Math.random().toString(36).substr(2, 9),
      from: 'security@refinyx.io',
      subject: '[Refinyx] Click this link to confirm your email address',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      code: code,
      body: `Hi there,\n\nWelcome to Refinyx! To complete your registration and unlock architectural code refinement, please enter the following code in your browser:\n\nVerification Code: ${code}\n\nThis is a simulation because there is no SMTP server in this environment.`
    };
    setInbox(prev => [newEmail, ...prev]);
    setIsInboxOpen(true);
    setTimeout(() => { setSelectedEmail(newEmail); }, 500);
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
      setVirtualCode(res.code);
      dispatchVirtualEmail(email, res.code);
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
      setError(res.error || "Verification failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
      {/* Ambience */}
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute inset-0 bg-grid opacity-10"></div>

      {/* Virtual Inbox Simulator */}
      <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-500 transform ${isInboxOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="w-80 md:w-96 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Inbox className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">Refinyx Virtual Inbox</span>
            </div>
            <button onClick={() => setIsInboxOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><ChevronDown className="w-4 h-4" /></button>
          </div>
          <div className="h-96 overflow-y-auto bg-white">
            {selectedEmail ? (
              <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={() => setSelectedEmail(null)} className="text-xs text-blue-600 font-bold mb-4">← Back</button>
                <h4 className="font-black text-lg leading-tight mb-2">{selectedEmail.subject}</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                   <p className="text-xs text-slate-600 leading-relaxed mb-6">{selectedEmail.body}</p>
                   <div className="text-center py-4 bg-white rounded-xl border border-dashed border-blue-200">
                      <p className="text-[10px] font-black text-slate-400 mb-2">VERIFICATION CODE</p>
                      <p className="text-3xl font-black text-blue-600 tracking-[0.2em]">{selectedEmail.code}</p>
                   </div>
                </div>
                <Button onClick={() => { setVerificationCode(selectedEmail.code); setSelectedEmail(null); setIsInboxOpen(false); }} className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Apply Code</Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {inbox.length === 0 ? <div className="p-20 text-center text-slate-400 text-xs">Waiting for incoming logs...</div> : inbox.map(item => (
                  <div key={item.id} onClick={() => setSelectedEmail(item)} className="p-4 hover:bg-slate-50 cursor-pointer flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-emerald-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between"><span className="text-xs font-black">Security Team</span><span className="text-[9px] text-slate-400">{item.time}</span></div>
                      <p className="text-xs font-bold text-slate-800 truncate">{item.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg p-1 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass rounded-[48px] shadow-2xl border border-white/5 p-10 md:p-14">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-3xl mb-8 border border-emerald-500/20"><Layers className="w-10 h-10 text-emerald-500" /></div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Refinyx <span className="text-emerald-500">Identity</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">{mode === 'confirm' ? 'Code Verification Required' : 'Authorize Architectural Workspace'}</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-bounce"><AlertCircle className="w-4 h-4" />{error}</div>}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <input required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input required type="password" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" isLoading={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase text-xs">Enter Portal <ArrowRight className="ml-2 w-4 h-4" /></Button>
              <div className="text-center"><button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-emerald-400 uppercase">New Architect? Register</button></div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <input required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input required type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input required type="password" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" isLoading={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase text-xs">Request Access <ArrowRight className="ml-2 w-4 h-4" /></Button>
              <div className="text-center"><button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-emerald-400 uppercase">Return to Login</button></div>
            </form>
          )}

          {mode === 'confirm' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center mb-4"><p className="text-[10px] text-slate-500 uppercase font-black">Code Dispatched to Virtual Inbox Below</p></div>
              <input required maxLength={6} type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-center text-2xl tracking-[0.5em] text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-black" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} />
              <Button type="submit" isLoading={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase text-xs">Verify & Enter <ArrowRight className="ml-2 w-4 h-4" /></Button>
              <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="w-full text-[10px] font-black text-slate-700 hover:text-slate-400 uppercase">Cancel</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
