
import React, { useState } from 'react';
import Button from './Button';

interface Props {
  onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin(email.split('@')[0] || 'Architect');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 -left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md p-10 glass rounded-[40px] shadow-2xl relative z-10 border border-white/5 mx-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-3xl mb-6 border border-emerald-500/20 shadow-inner">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">CodeReview AI</h1>
          <p className="text-slate-400 font-medium">Secure Developer Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity (Email)</label>
            <input 
              required
              type="email" 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              placeholder="architect@nexus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Security Token</label>
            <input 
              required
              type="password" 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            isLoading={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
          >
            Authenticate
          </Button>
        </form>
      </div>
    </div>
  );
}
