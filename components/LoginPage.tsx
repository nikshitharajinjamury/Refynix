
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
  const [mode, setMode] = useState<'signin' | 'signup' | 'confirm' | 'forgot' | 'reset'>('signin');
  const [virtualCode, setVirtualCode] = useState(''); // Keep for UX feedback (check console)

  // Google Login Mock
  const handleGoogleLogin = async () => {
    setLoading(true);
    // In real app, this would use the Google OAuth flow
    const res = await authService.googleLogin("mock_google_token");
    if (res.success && res.user) {
      onLogin(res.user.name);
    } else {
      setError("Google Login failed");
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.signIn(email, password);
    if (res.success && res.user) {
      onLogin(res.user.name);
    } else if (res.error?.includes("verified")) {
      // Handle pending verification if needed, currently API just blocks
      setError(res.error);
    } else {
      setError(res.error || "Login failed.");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.signUp(email, fullName || email.split('@')[0], password);
    if (res.success) {
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

    const res = await authService.verifyCode(email, verificationCode);
    if (res.success) {
      setMode('signin');
      setError("Verified! Please sign in.");
    } else {
      setError(res.error || "Invalid code.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authService.forgotPassword(email);
    setMode('reset');
    setError("If email exists, code sent (check backend console).");
    setLoading(false);
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await authService.resetPassword(email, verificationCode, password); // Reusing password state for new password
    if (res.success) {
      setMode('signin');
      setError("Password reset! Please sign in.");
    } else {
      setError("Reset failed.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-grid opacity-10"></div>

      <div className="w-full max-w-lg p-1 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass rounded-[48px] shadow-2xl border border-white/5 p-10 md:p-14 overflow-hidden relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/10 rounded-3xl mb-8 border border-orange-500/20 shadow-inner group transition-all hover:rotate-6">
              <Layers className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Refinyx <span className="text-orange-500">{mode === 'confirm' ? 'Gate' : 'Auth'}</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Identity Provider</p>
          </div>

          {error && <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-xs font-bold animate-in slide-in-from-top-4"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-4">
                <input required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input required type="password" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="text-right">
                  <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Forgot Password?</button>
                </div>
              </div>

              <div className="space-y-3">
                <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20">
                  Sign In <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-700"><span className="bg-[#0b1321] px-4">Or</span></div>
                </div>

                <Button type="button" onClick={handleGoogleLogin} variant="ghost" className="w-full border border-white/10 hover:bg-white/5 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-white">
                  Continue with Google
                </Button>
              </div>

              <div className="text-center pt-4">
                <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-orange-400 uppercase tracking-widest transition-colors underline decoration-orange-500/20 underline-offset-8">
                  Create Account
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <input required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input required type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input required type="password" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Set Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">
                Create Account <ArrowRight className="ml-2 w-4 h-4" />
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
                  <Gauge className="w-3 h-3 animate-pulse" /> Verify Email
                </p>
                <p className="text-xs text-slate-400 font-medium italic">Check the backend console for the verification code.</p>
              </div>
              <input required maxLength={6} type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-3xl px-6 py-6 text-center text-4xl tracking-[0.6em] text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-black shadow-inner" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} />
              <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-orange-500/30">
                Verify
              </Button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-orange-400 uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <input required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="Enter Registration Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">
                Send Reset Code <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-orange-400 uppercase tracking-widest">
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center p-4 bg-orange-500/5 rounded-2xl mb-4">
                <p className="text-xs text-slate-400 font-medium italic">Check backend console for code.</p>
              </div>
              <input required maxLength={6} type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-center text-2xl tracking-[0.5em] text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-black" placeholder="CODE" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} />
              <input required type="password" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-medium" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">
                Set New Password
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
