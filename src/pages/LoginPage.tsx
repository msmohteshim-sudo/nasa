// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — High-Tech Space Operations Console Login
// Pixel-accurate recreation of the aerospace cockpit login screen with
// biometric Face ID recognition, persistent storage, and password authentication.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AltronLogo } from '@/components/AltronLogo';
import heroAstronautImg from '@/assets/hero_astronaut.png';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Globe,
  Monitor,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText,
  AudioLines,
  BarChart3,
  Box,
  Scan,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/services/auth/authService';
import { FaceBiometricScanner } from '@/components/auth/FaceBiometricScanner';
import { FaceBiometricService, FaceBiometricProfile } from '@/services/auth/faceBiometricService';
import { AuthUser } from '@/types/auth';

// ── Enrolled credentials reference ──────────────────────────────────────────
const DEMO_CREDS = [
  { userId: 'shim',     pw: '123456', role: 'Ground Operator',        name: 'Shim' },
  { userId: 'saba_s2',  pw: '123456', role: 'Experiment Scientist',   name: 'its saba' },
  { userId: 'shim_718', pw: '123456', role: 'Ground Operator',        name: 'saad' },
];

export const LoginPage: React.FC = () => {
  const { loginWithBiometrics, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Mandatory 2-Factor Sequential Authentication: Step 1 (ID & Password) -> Step 2 (Face ID)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [verifiedUser, setVerifiedUser] = useState<AuthUser | null>(null);

  // Form Fields
  const [userId, setUserId] = useState('shim');
  const [password, setPassword] = useState('123456');
  const [showPw, setShowPw] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  // Live UTC Clock
  const [utcTime, setUtcTime] = useState('');

  const userIdInputRef = useRef<HTMLInputElement>(null);

  // Update live UTC clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(decodeURIComponent(redirectTo), { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Step 1: Verify ID and Password
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanId = userId.trim();
    if (!cleanId) {
      setLocalError('Please enter your User ID or Institutional Email.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.verifyCredentials(cleanId, password);
      if (res.success && res.user) {
        setVerifiedUser(res.user);
        setCurrentStep(2);
        setLocalError(null);
        FaceBiometricService.playAudioCue('scan');
      } else {
        setLocalError(res.error || 'Authentication failed: Invalid User ID or Password.');
        FaceBiometricService.playAudioCue('denied');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Credential verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle Biometric Verification Success (Mandatory Second Factor)
  const handleStep2BiometricVerified = async (profile: FaceBiometricProfile) => {
    if (!verifiedUser) return;
    setIsSubmitting(true);
    setLocalError(null);

    const success = await loginWithBiometrics(
      verifiedUser.userId,
      rememberDevice,
      `Two-Factor Sequential Login Success: Step 1 (ID & Password) + Step 2 (Face ID for ${profile.name})`
    );

    if (success) {
      setLoginSuccess(true);
      setTimeout(() => {
        navigate(decodeURIComponent(redirectTo), { replace: true });
      }, 750);
    } else {
      setIsSubmitting(false);
      setLocalError('Biometric authentication could not create session.');
    }
  };

  // Back to Step 1: Change user or re-enter credentials
  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setVerifiedUser(null);
    setLocalError(null);
    setTimeout(() => userIdInputRef.current?.focus(), 100);
  };

  // Quick-fill credentials from drawer
  const fillDemo = (cred: typeof DEMO_CREDS[0]) => {
    setUserId(cred.userId);
    setPassword(cred.pw);
    setLocalError(null);
    if (currentStep === 2) {
      setCurrentStep(1);
      setVerifiedUser(null);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="relative min-h-screen w-full bg-[#020914] text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* ── 1. Full-screen ISS Cupola Astronaut Background Image ── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <img
          src={heroAstronautImg}
          alt="ALTRON ISS Orbital Cupola"
          className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] saturate-[1.12]"
        />
        {/* Dark subtle cinematic overlay matching the screenshot */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020a16]/90 via-[#030e1e]/60 to-[#020a16]/85" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#020a16]/40 to-[#020a16]/95" />
      </div>

      {/* ── 2. Top Header Navigation Bar ── */}
      <header className="relative z-20 w-full px-6 py-4 lg:px-10 flex items-center justify-between border-b border-white/5 bg-[#020a16]/50 backdrop-blur-md">
        {/* Left: ALTRON Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <AltronLogo size={38} className="w-9 h-9 shrink-0 drop-shadow-[0_0_14px_rgba(56,189,248,0.5)]" />
          <div>
            <div className="text-[18px] font-black tracking-[0.24em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-sky-300 font-sans leading-none">
              ALTRON
            </div>
            <div className="text-[9px] font-bold tracking-[0.22em] text-[#38bdf8] uppercase mt-1">
              AI PROCEDURAL INTELLIGENCE
            </div>
          </div>
        </Link>

        {/* Right: Live UTC Clock & Encrypted Badge */}
        <div className="flex items-center gap-6 text-right">
          <div className="hidden sm:block">
            <div className="text-[12px] font-mono font-medium text-slate-200 tracking-wider">
              {utcTime || '2026-10-05 10:05:00 UTC'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Earth Orbit &nbsp;|&nbsp; ISS View (Live)
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#051424]/90 border border-emerald-500/40 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <div className="text-[10.5px] font-extrabold tracking-wider text-white uppercase leading-none">
                Secure Connection
              </div>
              <div className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                End-to-End Encrypted
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 3. Main Center Content Area ── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Side: Ground Operations Access Info */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center text-left">
          <div className="inline-block text-[11px] font-bold tracking-[0.22em] text-white/50 uppercase mb-3">
            GROUND OPERATIONS ACCESS
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
            AI Procedural<br />
            Intelligence for<br />
            <span className="text-[#3b82f6] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Space Experiments
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed max-w-md mb-8">
            Secure ground access for authorized experiment monitoring, procedural verification, and AI-assisted operations.
          </p>

          {/* 6 Feature Badges in 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            {/* 1 */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg backdrop-blur-md hover:border-cyan-500/40 transition">
              <div className="w-6 h-6 rounded-md bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Eye className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="text-[11.5px] font-medium text-slate-200 leading-snug">
                Computer Vision<br /><span className="text-slate-400 text-[10.5px]">& Activity Recognition</span>
              </div>
            </div>

            {/* 2 */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg backdrop-blur-md hover:border-cyan-500/40 transition">
              <div className="w-6 h-6 rounded-md bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="text-[11.5px] font-medium text-slate-200 leading-snug">
                Procedure Engine<br /><span className="text-slate-400 text-[10.5px]">& Verification</span>
              </div>
            </div>

            {/* 3 */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg backdrop-blur-md hover:border-cyan-500/40 transition">
              <div className="w-6 h-6 rounded-md bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <AudioLines className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="text-[11.5px] font-medium text-slate-200 leading-snug">
                Voice Guidance<br /><span className="text-slate-400 text-[10.5px]">& Assistance</span>
              </div>
            </div>

            {/* 4 */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg backdrop-blur-md hover:border-cyan-500/40 transition">
              <div className="w-6 h-6 rounded-md bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="text-[11.5px] font-medium text-slate-200 leading-snug">
                Evidence Recording<br /><span className="text-slate-400 text-[10.5px]">& Mission Analytics</span>
              </div>
            </div>

            {/* 5 */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg backdrop-blur-md hover:border-cyan-500/40 transition">
              <div className="w-6 h-6 rounded-md bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="text-[11.5px] font-medium text-slate-200 leading-snug">
                Deviation Detection<br /><span className="text-slate-400 text-[10.5px]">& Early Alerts</span>
              </div>
            </div>

            {/* 6 */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg backdrop-blur-md hover:border-cyan-500/40 transition">
              <div className="w-6 h-6 rounded-md bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Box className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="text-[11.5px] font-medium text-slate-200 leading-snug">
                Real-time Monitoring<br /><span className="text-slate-400 text-[10.5px]">& Experiment Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The ALTRON Console Cockpit Card */}
        <div className="w-full lg:w-[58%] max-w-2xl bg-[#091527]/90 border border-sky-500/30 rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.18),0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-5 sm:p-7 relative overflow-hidden">
          {/* Subtle accent border glow: Blue on top, Amber on bottom */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent opacity-70" />

          {/* Grid inside the card: Left = Auth & Biometrics, Right = Status & Drawer */}
          <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.9fr] gap-6 sm:gap-7 items-start">
            {/* ── Sub-Column 1: Authentication Console ── */}
            <div>
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-extrabold tracking-[0.22em] text-cyan-400 uppercase">
                    OPERATIONS ACCESS
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                  ALTRON Console
                </h2>
                <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                  Sign in to access the experiment monitoring and procedural verification console.
                </p>
              </div>

              {/* Success Notification */}
              {loginSuccess && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-emerald-950/80 border border-emerald-500 rounded-lg text-xs text-emerald-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Access Authorized. Launching mission telemetry…</span>
                </div>
              )}

              {/* Error Notification */}
              {displayError && !loginSuccess && (
                <div className="mb-4 flex items-start gap-2 px-3 py-2 bg-rose-950/80 border border-rose-500/80 rounded-lg text-xs text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{displayError}</span>
                </div>
              )}

              {/* ── 2-Factor Sequential Authentication Stepper ── */}
              <div className="mb-4 bg-[#050f1c]/90 border border-cyan-900/60 rounded-xl p-2.5 backdrop-blur-sm shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  {/* Step 1 Chip */}
                  <div
                    className={`flex-1 flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      currentStep === 1
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : verifiedUser
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                        currentStep === 1
                          ? 'bg-cyan-500 text-[#020a16]'
                          : verifiedUser
                          ? 'bg-emerald-500 text-[#020a16]'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {verifiedUser ? <Check className="w-3.5 h-3.5" /> : '1'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight flex items-center gap-1">
                        <span>1. Credentials</span>
                        {verifiedUser && (
                          <span className="text-[9px] text-emerald-400 font-mono">✓ Verified</span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-slate-400 truncate">
                        {verifiedUser ? `${verifiedUser.userId}` : 'ID & Password'}
                      </div>
                    </div>
                  </div>

                  {/* Arrow divider */}
                  <div className="text-slate-600 font-mono text-xs px-0.5">➔</div>

                  {/* Step 2 Chip */}
                  <div
                    className={`flex-1 flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      currentStep === 2
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                        currentStep === 2
                          ? 'bg-cyan-500 text-[#020a16]'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      2
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight flex items-center gap-1">
                        <Scan className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>2. Face Recon</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400 truncate">
                        {currentStep === 2 ? 'Biometric Face ID' : 'Awaiting Step 1'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 1: Enter ID & Password ── */}
              {currentStep === 1 && (
                <div className="animate-in fade-in duration-200">
                  <div className="mb-3">
                    <div className="text-[11px] font-extrabold tracking-[0.2em] text-cyan-300 uppercase">
                      Step 1 of 2 — Operator Credentials
                    </div>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      Enter your authorized User ID and password. Both ID/password and Face Recognition are strictly required.
                    </p>
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-3.5" noValidate>
                    {/* User ID Input */}
                    <div>
                      <label
                        htmlFor="login-user-id"
                        className="block text-[10.5px] font-bold tracking-wider text-slate-400 uppercase mb-1"
                      >
                        USER ID / INSTITUTIONAL EMAIL
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="login-user-id"
                          ref={userIdInputRef}
                          type="text"
                          autoComplete="username"
                          placeholder="e.g. shim, saba_s2, or shim_718"
                          value={userId}
                          onChange={(e) => {
                            setUserId(e.target.value);
                            setLocalError(null);
                          }}
                          disabled={isSubmitting || loginSuccess}
                          className="w-full pl-9 pr-3 py-2 bg-[#050f1c] border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label
                        htmlFor="login-password"
                        className="block text-[10.5px] font-bold tracking-wider text-slate-400 uppercase mb-1"
                      >
                        PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="login-password"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setLocalError(null);
                          }}
                          disabled={isSubmitting || loginSuccess}
                          className="w-full pl-9 pr-9 py-2 bg-[#050f1c] border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                          tabIndex={-1}
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                          {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Device Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        id="remember-device"
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        disabled={isSubmitting || loginSuccess}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 accent-cyan-500"
                      />
                      <label htmlFor="remember-device" className="text-[11px] text-slate-400 cursor-pointer select-none">
                        Remember this device for 7 days
                      </label>
                    </div>

                    {/* Submit Step 1 Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || loginSuccess}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-[12.5px] tracking-wider uppercase rounded-lg transition shadow-md flex items-center justify-center gap-2 border border-cyan-400/30 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>VERIFYING CREDENTIALS…</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Credentials & Proceed to Step 2</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Forgot password link */}
                  <div className="mt-3 text-center">
                    <Link
                      to="/forgot-password"
                      className="text-[11.5px] text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Face Recognition Biometrics (Mandatory Second Factor) ── */}
              {currentStep === 2 && verifiedUser && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Step 1 Passed Verification Badge */}
                  <div className="mb-3.5 p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-200">
                          Step 1 Cleared: {verifiedUser.name}
                        </div>
                        <div className="text-[10px] text-emerald-400/80 font-mono">
                          Operator ID: {verifiedUser.userId} · {verifiedUser.role}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Change User</span>
                    </button>
                  </div>

                  {/* Step 2 Header */}
                  <div className="mb-3">
                    <div className="text-[11px] font-extrabold tracking-[0.2em] text-cyan-300 uppercase">
                      Step 2 of 2 — Face Recognition Verification
                    </div>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      Position your face inside the viewfinder to verify biometric identity for{' '}
                      <strong className="text-white font-mono">{verifiedUser.userId}</strong>.
                    </p>
                  </div>

                  {/* Face Biometric Scanner Locked To Verified User */}
                  <FaceBiometricScanner
                    onVerified={handleStep2BiometricVerified}
                    selectedUserId={verifiedUser.userId}
                  />

                  {/* Back to Step 1 Button */}
                  <div className="mt-3.5 pt-2 border-t border-slate-800/80 text-center">
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      className="text-[11.5px] text-slate-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Step 1 (Change Credentials)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sub-Column 2: Cockpit Status & Support Information ── */}
            <div className="space-y-4 pt-1 border-t md:border-t-0 md:border-l border-slate-800/80 md:pl-6">
              {/* CURRENT ACCESS STATUS matching the screenshot */}
              <div>
                <div className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mb-3">
                  CURRENT ACCESS STATUS
                </div>

                <div className="space-y-3 text-xs">
                  {/* Status 1: Systems Online */}
                  <div className="flex items-start gap-2.5">
                    <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <div className="font-bold text-slate-200 text-[11.5px] leading-tight">Systems Online</div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">All authentication systems operational</div>
                    </div>
                  </div>

                  {/* Status 2: Secure Connection */}
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200 text-[11.5px] leading-tight">Secure Connection</div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">End-to-end encrypted session</div>
                    </div>
                  </div>

                  {/* Status 3: Recognized Device */}
                  <div className="flex items-start gap-2.5">
                    <Monitor className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200 text-[11.5px] leading-tight">Recognized Device</div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">ALTRON-DEV-01 &nbsp;·&nbsp; Windows · Chrome</div>
                    </div>
                  </div>

                  {/* Status 4: Access Location */}
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200 text-[11.5px] leading-tight flex items-center gap-1.5">
                        <span>Access Location</span>
                        <span className="text-[12px]">🇮🇳</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">New Delhi, India</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Callout Box (Amber/Gold border) matching the screenshot */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-slate-300">
                    <span className="font-bold text-amber-300">Authorized personnel only.</span><br />
                    This console is intended for authorized ALTRON ground operations, experiment and research personnel.
                    <div className="mt-1 text-slate-400">
                      Need access? <span className="text-slate-300 font-medium">Contact your ALTRON administrator.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEMO ACCOUNTS (Dev Mode Only) matching the screenshot */}
              <div className="rounded-xl border border-amber-500/50 bg-[#0f1f33]/70 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDemoDrawer(!showDemoDrawer)}
                  className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold tracking-wider text-amber-300 uppercase hover:bg-amber-950/30 transition"
                >
                  <span>ENROLLED PERSONNEL ACCOUNTS</span>
                  {showDemoDrawer ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
                </button>

                {showDemoDrawer && (
                  <div className="p-2 border-t border-amber-500/30 space-y-1 bg-[#060f1c] max-h-48 overflow-y-auto">
                    {DEMO_CREDS.map((cred) => (
                      <button
                        key={cred.userId}
                        type="button"
                        onClick={() => fillDemo(cred)}
                        className="w-full p-1.5 rounded-lg text-left text-[11px] hover:bg-amber-950/40 flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                            {cred.userId}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cred.name} · {cred.role}
                          </div>
                        </div>
                        <div className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                          {cred.pw}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Development Environment Alert matching the screenshot */}
              <div className="px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-600/40 text-[10.5px] text-amber-300/90 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Development Environment – Not production secure.</span>
              </div>

              {/* Return to Homepage Link matching the screenshot */}
              <div className="pt-2 text-right">
                <Link
                  to="/"
                  className="text-[11.5px] text-slate-400 hover:text-cyan-400 font-medium transition inline-flex items-center gap-1"
                >
                  <span>← Return to ALTRON Homepage</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── 4. Bottom Footer Note ── */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-white/5 bg-[#020a16]/60 backdrop-blur-sm text-center sm:text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-white/35 font-mono">
          <span>ALTRON Ground Operations Prototype — SIH26174 | Not an official ISRO production system.</span>
          <span>Security Protocol TLS v1.3 &nbsp;|&nbsp; Biometric ID v4.2</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
