import React, { useState, useEffect } from 'react';
import Button from './Button';
import { authService } from '../services/authService';
import ParticlesBackground from './ParticlesBackground';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import {
  ShieldCheck,
  Lock,
  Mail,
  Layers,
  ArrowRight,
  AlertCircle,
  Gauge,
  User,
  Building2,
  Code2,
  X
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      const res = await authService.googleLogin(credentialResponse.credential);
      if (res.success && res.user) {
        onLogin(res.user.name);
      } else {
        setError("Google Login failed");
      }
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Login Failed");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.signIn(email, password);
    if (res.success && res.user) {
      onLogin(res.user.name);
    } else if (res.error?.includes("verified")) {
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
    const res = await authService.resetPassword(email, verificationCode, password);
    if (res.success) {
      setMode('signin');
      setError("Password reset! Please sign in.");
    } else {
      setError("Reset failed.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617] selection:bg-blue-500/30">
      <ParticlesBackground />

      {/* Background Gradients */}
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-grid opacity-10"></div>

      <div className="w-full max-w-[420px] p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass rounded-[32px] shadow-2xl border border-white/10 p-8 md:p-10 overflow-hidden relative backdrop-blur-xl bg-[#0f172a]/60">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {mode === 'signin' ? 'Welcome to Refynix' :
                mode === 'signup' ? 'Join Refynix' :
                  mode === 'confirm' ? 'Verify Identity' : 'Reset Access'}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === 'signin' ? 'Log in to your account' :
                mode === 'signup' ? 'Start your journey' :
                  mode === 'confirm' ? 'Enter the code sent to your email' : 'Secure your account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-semibold animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                  <input required type="email" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <input required type="password" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="text-right">
                  <button type="button" onClick={() => setMode('forgot')} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all">
                  Log In
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500"><span className="bg-[#0f172a00] px-2 backdrop-blur-xl">Or</span></div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                    width="300"
                  />
                </div>
              </div>

              <div className="text-center pt-4">
                <span className="text-xs text-slate-500">Don't have an account? </span>
                <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  Sign up
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                <input required type="email" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <input required type="text" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <input required type="password" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 mt-2">
                Create Account
              </Button>
              <div className="text-center pt-4">
                <span className="text-xs text-slate-500">Already have an account? </span>
                <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  Log in
                </button>
              </div>
            </form>
          )}

          {mode === 'confirm' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest mb-1 flex items-center justify-center gap-2">
                  <Mail className="w-3 h-3" /> Check Email
                </p>
                <p className="text-xs text-slate-400">Code sent to your email (check console)</p>
              </div>
              <input required maxLength={6} type="text" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-2xl px-6 py-5 text-center text-3xl tracking-[0.5em] text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} />
              <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30">
                Verify
              </Button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <input required type="email" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30">
                Send Reset Code
              </Button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center p-3 bg-blue-500/10 rounded-xl mb-2">
                <p className="text-xs text-blue-300 font-medium">Enter code from console</p>
              </div>
              <input required maxLength={6} type="text" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-4 text-center text-xl tracking-[0.5em] text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="CODE" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} />
              <input required type="password" className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30">
                Reset Password
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
