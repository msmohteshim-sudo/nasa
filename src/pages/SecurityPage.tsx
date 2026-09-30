// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Security Page
// Password change, 2FA status (future), active sessions, security audit log.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Key,
  Smartphone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Lock,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LOG_ICONS: Record<string, React.ReactNode> = {
  LOGIN_SUCCESS:             <LogIn className="w-3.5 h-3.5 text-emerald-500" />,
  LOGIN_FAILED:              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />,
  LOGOUT:                    <LogOut className="w-3.5 h-3.5 text-slate-400" />,
  SESSION_EXPIRED:           <Clock className="w-3.5 h-3.5 text-amber-500" />,
  PASSWORD_CHANGED:          <Key className="w-3.5 h-3.5 text-blue-500" />,
  PASSWORD_RESET_REQUESTED:  <Lock className="w-3.5 h-3.5 text-amber-500" />,
  ROLE_CHANGE:               <Shield className="w-3.5 h-3.5 text-purple-500" />,
  ACCOUNT_LOCKED:            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
  USER_CREATED:              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  USER_DISABLED:             <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
};

const LOG_LEVEL_STYLE: Record<string, string> = {
  info:     'bg-slate-50 text-slate-600 border-slate-200',
  warning:  'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const SecurityPage: React.FC = () => {
  const { user, changePassword, securityLogs, refreshLogs, logout } = useAuth();
  const navigate = useNavigate();

  // Change password state
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwState, setPwState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (!oldPw || !newPw || !confirmPw) {
      setPwError('All fields are required.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    setPwState('saving');
    const res = await changePassword(oldPw, newPw);
    if (res.success) {
      setPwState('success');
      setOldPw(''); setNewPw(''); setConfirmPw('');
      refreshLogs();
      setTimeout(() => setPwState('idle'), 3000);
    } else {
      setPwError(res.error || 'Password change failed.');
      setPwState('error');
    }
  };

  const handleSignOutAll = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const myLogs = securityLogs.filter((l) => l.userId === user.id).slice(0, 20);

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-[#002244] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-xl font-extrabold text-[#0d2b5e] tracking-tight flex items-center gap-2">
        <Shield className="w-5 h-5 text-[#1a6fc4]" />
        Account Security
      </h1>

      {/* ── Change Password ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#1a6fc4]" />
          <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Change Password</h2>
        </div>
        <div className="px-6 py-5">
          {pwState === 'success' && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Password updated successfully.
            </div>
          )}
          {pwError && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {pwError}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPw}
                  onChange={(e) => setOldPw(e.target.value)}
                  disabled={pwState === 'saving'}
                  placeholder="Current password"
                  className="w-full pr-10 pl-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 focus:border-[#1a6fc4] disabled:opacity-60 transition"
                />
                <button type="button" onClick={() => setShowOld((v) => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  disabled={pwState === 'saving'}
                  placeholder="At least 8 characters"
                  className="w-full pr-10 pl-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 focus:border-[#1a6fc4] disabled:opacity-60 transition"
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm new */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                disabled={pwState === 'saving'}
                placeholder="Repeat new password"
                className="w-full pl-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 focus:border-[#1a6fc4] disabled:opacity-60 transition"
              />
            </div>

            <button
              type="submit"
              disabled={pwState === 'saving'}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0d2b5e] hover:bg-[#1a4080] disabled:opacity-60 text-white text-[12px] font-bold tracking-wider rounded-lg transition"
            >
              {pwState === 'saving' ? <><Loader2 className="w-4 h-4 animate-spin" /> SAVING…</> : 'UPDATE PASSWORD'}
            </button>
          </form>
        </div>
      </div>

      {/* ── 2FA (future) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#1a6fc4]" />
          <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Two-Factor Authentication</h2>
        </div>
        <div className="px-6 py-5 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-slate-600 font-medium">Status: <span className="text-slate-400">Not configured</span></p>
            <p className="text-[12px] text-slate-400 mt-1">Two-factor authentication is planned for a future ALTRON prototype release.</p>
            <span className="inline-block mt-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-500">
              Available in future release
            </span>
          </div>
        </div>
      </div>

      {/* ── Active Sessions ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1a6fc4]" />
            <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Active Sessions</h2>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 px-3 py-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex-1">
              <div className="text-[12px] font-semibold text-emerald-800">Current Session — Ground Workstation</div>
              <div className="text-[11px] text-emerald-600 font-mono mt-0.5">192.168.1.104 (Ground Workstation)</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Active now</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 border border-emerald-200 rounded font-mono text-emerald-700 font-semibold">CURRENT</span>
          </div>
          <button
            onClick={handleSignOutAll}
            className="text-[12px] font-semibold text-rose-600 hover:text-rose-700 transition border border-rose-200 px-3 py-2 rounded-lg hover:bg-rose-50"
          >
            Sign out of this session
          </button>
        </div>
      </div>

      {/* ── Security Audit Log ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1a6fc4]" />
            <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Security Events</h2>
          </div>
          <button onClick={refreshLogs} className="text-[11px] text-[#1a6fc4] hover:underline">Refresh</button>
        </div>
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          {myLogs.length === 0 ? (
            <p className="text-[12px] text-slate-400 text-center py-8 font-mono">No security events recorded yet.</p>
          ) : (
            myLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition">
                <div className="mt-0.5">{LOG_ICONS[log.eventType] || <Shield className="w-3.5 h-3.5 text-slate-400" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${LOG_LEVEL_STYLE[log.level]}`}>
                      {log.eventType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <p className="text-[12px] text-slate-600 mt-0.5 leading-snug">{log.details}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ipAddress}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
