// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Forgot Password Page
// Institutional password reset request page. Honest: warns if email not wired.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AltronLogo } from '@/components/AltronLogo';
import { ArrowLeft, Mail, Loader2, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AuthService } from '@/services/auth/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdOrEmail.trim()) return;

    setState('submitting');
    try {
      const res = await AuthService.requestPasswordReset(userIdOrEmail.trim());
      setMessage(res.message);
      setState('done');
    } catch {
      setState('error');
      setMessage('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-[420px] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Top bar */}
        <div className="h-1 bg-gradient-to-r from-[#d32f2f] via-[#f59e0b] to-[#1a6fc4]" />

        <div className="px-8 py-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <AltronLogo size={38} className="w-9 h-9 shrink-0 drop-shadow-[0_2px_8px_rgba(26,111,196,0.3)]" />
            <div>
              <div className="text-[15px] font-black tracking-[0.2em] text-[#0d2b5e] uppercase leading-none">ALTRON</div>
              <div className="text-[9px] tracking-[0.18em] text-[#1a6fc4] uppercase font-bold mt-0.5">AI Procedural Intelligence</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#1a6fc4]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#1a6fc4] uppercase">Password Recovery</span>
          </div>

          <h1 className="text-xl font-extrabold text-[#0d2b5e] mb-1">Forgot Password?</h1>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-7">
            Enter your ALTRON User ID or institutional email. If an authorized account exists, a reset link will be dispatched to the security log.
          </p>

          {/* Prototype notice */}
          <div className="mb-5 flex items-start gap-2 px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <span className="font-semibold">ALTRON Prototype:</span> Email delivery is not configured in this prototype environment. Reset requests are recorded in the security audit log only.
            </p>
          </div>

          {state === 'done' ? (
            <div className="flex items-start gap-3 px-4 py-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[13px] text-emerald-800 leading-relaxed">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-id" className="block text-[11px] font-semibold tracking-wider text-slate-600 uppercase mb-1.5">
                  User ID / Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reset-id"
                    type="text"
                    value={userIdOrEmail}
                    onChange={(e) => setUserIdOrEmail(e.target.value)}
                    placeholder="e.g. alex.sharma@altron.ops"
                    disabled={state === 'submitting'}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 focus:border-[#1a6fc4] placeholder:text-gray-400 disabled:opacity-60 transition"
                  />
                </div>
              </div>

              {state === 'error' && (
                <p className="text-[12px] text-rose-600">{message}</p>
              )}

              <button
                type="submit"
                disabled={state === 'submitting' || !userIdOrEmail.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0d2b5e] hover:bg-[#1a4080] disabled:opacity-60 text-white font-bold text-[13px] tracking-wider rounded-lg transition-colors"
              >
                {state === 'submitting' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> SENDING REQUEST…</>
                ) : (
                  'SEND RESET LINK'
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-[#1a6fc4] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to ALTRON Operations Access
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-5 text-[11px] text-slate-400 font-mono">
        ALTRON Ground Operations Prototype — SIH26174
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
