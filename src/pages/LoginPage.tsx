// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Login Page
// Professional institutional OPERATIONS ACCESS screen for ground operators.
// Split-panel: left = branding, right = login form.
// NO social login. SHA-256 hashed. Real auth via AuthService.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Layers,
  AlertTriangle,
  Lock,
  User,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Demo credentials reference (dev-only, never shown in production builds) ──
const DEMO_CREDS = [
  { userId: 'demo.operator',    pw: 'Operator#2026',  role: 'Ground Operator'         },
  { userId: 'demo.scientist',   pw: 'Scientist#2026', role: 'Experiment Scientist'    },
  { userId: 'demo.engineer',    pw: 'Engineer#2026',  role: 'Mission / Sys Engineer'  },
  { userId: 'demo.researcher',  pw: 'Researcher#2026',role: 'Researcher'              },
  { userId: 'demo.admin',       pw: 'Admin#2026',     role: 'Administrator'           },
  { userId: 'demo.viewer',      pw: 'Viewer#2026',    role: 'Viewer'                  },
  { userId: 'shim',             pw: '123456',         role: 'Ground Operator'         },
];

// ── Login state ───────────────────────────────────────────────────────────────
type LoginState = 'idle' | 'authenticating' | 'success' | 'error';

// ── LeftPanel: ALTRON branding ────────────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <div className="hidden lg:flex lg:w-[52%] relative bg-[#071428] flex-col overflow-hidden">
    {/* Decorative grid */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          'linear-gradient(#7ab3f0 1px, transparent 1px), linear-gradient(90deg, #7ab3f0 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    />

    {/* Color bar at top */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d32f2f] via-[#f59e0b] to-[#1a6fc4]" />

    {/* Content */}
    <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-auto">
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-[17px] font-extrabold tracking-widest text-white uppercase leading-none">
            ALTRON
          </div>
          <div className="text-[9px] font-medium tracking-[0.2em] text-[#7ab3f0] uppercase mt-0.5">
            AI Procedural Intelligence
          </div>
        </div>
      </div>

      {/* Main copy */}
      <div className="mt-auto pb-2">
        <div className="text-[10px] font-bold tracking-[0.22em] text-white/40 uppercase mb-5">
          Ground Operations Access
        </div>
        <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
          AI Procedural<br />Intelligence for<br />
          <span className="text-[#7ab3f0]">Space Experiments</span>
        </h2>
        <div className="w-10 h-[3px] bg-[#d32f2f] mb-6" />
        <p className="text-sm text-white/60 leading-relaxed max-w-sm">
          Secure ground access for authorized experiment monitoring,
          procedural verification, and AI-assisted operations.
        </p>

        {/* Feature chips */}
        <div className="mt-8 grid grid-cols-2 gap-2.5">
          {[
            'Computer Vision',
            'Procedure Engine',
            'Voice Guidance',
            'Evidence Recording',
            'Deviation Detection',
            'Real-time Monitoring',
          ].map((feat) => (
            <div
              key={feat}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded text-[11px] text-white/70 font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-[#7ab3f0] shrink-0" />
              {feat}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 pt-6 border-t border-white/10 text-[10px] text-white/30 font-mono">
        ALTRON Ground Operations Prototype — SIH26174 | Not an official ISRO production system.
      </div>
    </div>
  </div>
);

// ── Main Login Page ───────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const userIdRef = useRef<HTMLInputElement>(null);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(decodeURIComponent(redirectTo), { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Focus first input on mount
  useEffect(() => {
    userIdRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!userId.trim()) {
      setLocalError('Please enter your User ID or institutional email.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setLoginState('authenticating');

    const success = await login({ userIdOrEmail: userId.trim(), password, rememberDevice });

    if (success) {
      setLoginState('success');
      setTimeout(() => {
        navigate(decodeURIComponent(redirectTo), { replace: true });
      }, 700);
    } else {
      setLoginState('error');
    }
  };

  const fillDemo = (cred: typeof DEMO_CREDS[0]) => {
    setUserId(cred.userId);
    setPassword(cred.pw);
    setShowDemoPanel(false);
    setLocalError(null);
    setLoginState('idle');
  };

  const displayError = localError || (loginState === 'error' ? (authError || 'Authentication failed.') : null);

  const isSubmitting = loginState === 'authenticating';

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* ── Left branding panel ── */}
      <LeftPanel />

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Top: mobile logo */}
        <div className="lg:hidden px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#0d2b5e] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-widest text-[#0d2b5e] uppercase">ALTRON</span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[380px]">
            {/* Title */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#1a6fc4]" />
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#1a6fc4] uppercase">
                  Operations Access
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#0d2b5e] tracking-tight leading-tight mb-2">
                ALTRON Console Sign In
              </h1>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Sign in to access the experiment monitoring and procedural verification console.
              </p>
            </div>

            {/* Success banner */}
            {loginState === 'success' && (
              <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Authentication successful. Opening console…</span>
              </div>
            )}

            {/* Error banner */}
            {displayError && loginState !== 'success' && (
              <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* User ID */}
              <div>
                <label
                  htmlFor="altron-user-id"
                  className="block text-[11px] font-semibold tracking-wider text-slate-600 uppercase mb-1.5"
                >
                  User ID / Institutional Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="altron-user-id"
                    ref={userIdRef}
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. demo.operator"
                    value={userId}
                    onChange={(e) => { setUserId(e.target.value); setLocalError(null); setLoginState('idle'); }}
                    disabled={isSubmitting || loginState === 'success'}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 focus:border-[#1a6fc4] placeholder:text-gray-400 disabled:bg-gray-50 disabled:opacity-70 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="altron-password"
                  className="block text-[11px] font-semibold tracking-wider text-slate-600 uppercase mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="altron-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLocalError(null); setLoginState('idle'); }}
                    disabled={isSubmitting || loginState === 'success'}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 focus:border-[#1a6fc4] placeholder:text-gray-400 disabled:bg-gray-50 disabled:opacity-70 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember device */}
              <div className="flex items-center gap-2">
                <input
                  id="altron-remember"
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  disabled={isSubmitting || loginState === 'success'}
                  className="w-4 h-4 rounded border-gray-300 text-[#1a6fc4] focus:ring-[#1a6fc4] accent-[#1a6fc4]"
                />
                <label htmlFor="altron-remember" className="text-[12px] text-slate-600 select-none">
                  Remember this device for 7 days
                </label>
              </div>

              {/* Submit */}
              <button
                id="altron-sign-in-btn"
                type="submit"
                disabled={isSubmitting || loginState === 'success'}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-[#0d2b5e] hover:bg-[#1a4080] disabled:opacity-60 text-white font-bold text-[13px] tracking-wider rounded-lg transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AUTHENTICATING…
                  </>
                ) : loginState === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    SUCCESS
                  </>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Forgot password */}
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-[12px] text-[#1a6fc4] hover:text-[#0d2b5e] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Access note */}
            <div className="mt-7 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">Authorized personnel only.</span>
                  {' '}This console is intended for authorized ALTRON ground operations, experiment and research personnel.
                  <br className="hidden sm:block" />
                  Need access?{' '}
                  <span className="text-slate-600 font-medium">Contact your ALTRON administrator.</span>
                </div>
              </div>
            </div>

            {/* Dev-only demo credentials panel */}
            {import.meta.env.DEV && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowDemoPanel((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition"
                >
                  <span>🔧 DEMO ACCOUNTS (Dev Mode Only)</span>
                  <span>{showDemoPanel ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showDemoPanel && (
                  <div className="mt-1.5 border border-amber-200 rounded-lg overflow-hidden divide-y divide-amber-100 text-[11px]">
                    {DEMO_CREDS.map((c) => (
                      <button
                        key={c.userId}
                        type="button"
                        onClick={() => fillDemo(c)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-left transition"
                      >
                        <div>
                          <span className="font-mono font-semibold text-slate-800">{c.userId}</span>
                          <span className="ml-2 text-amber-700">{c.role}</span>
                        </div>
                        <span className="font-mono text-slate-500">{c.pw}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Env indicator */}
            <div className="mt-8 text-center">
              {import.meta.env.DEV ? (
                <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                  ⚠ Development Environment — Not production secure
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  🔒 Secure Operations Access — Session Encrypted (HTTPS/TLS)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom nav back to homepage */}
        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <Link to="/" className="text-[12px] text-slate-400 hover:text-[#1a6fc4] transition-colors">
            ← Return to ALTRON Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
