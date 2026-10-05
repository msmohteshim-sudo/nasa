// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Account Page
// Shows authenticated user profile, role, org, session info.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Shield,
  Building2,
  Clock,
  ArrowLeft,
  Circle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RolePermissions } from '@/services/auth/authService';

const Field: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-slate-100 last:border-0">
    <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:w-44 shrink-0">{label}</span>
    <span className={`text-[13px] text-slate-800 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
  </div>
);

export const AccountPage: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const roleDef = RolePermissions.ROLE_MAP[user.role];
  const sessionExpiry = session?.expiresAt
    ? new Date(session.expiresAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
  const lastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : 'This session';

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-[#002244] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-[#d32f2f] via-[#f59e0b] to-[#1a6fc4]" />

        <div className="px-7 py-7">
          {/* Avatar + identity */}
          <div className="flex items-start gap-5 mb-7">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shadow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#0d2b5e] flex items-center justify-center text-2xl font-extrabold text-white">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-[#0d2b5e] leading-tight">{user.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border mt-1.5 ${roleDef.badgeColor}`}>
                {roleDef.title}
              </span>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                <span className="font-semibold">Session Active</span>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">
            Identity
          </div>
          <div className="mb-5">
            <Field label="User ID" value={user.userId} mono />
            <Field label="Full Name" value={user.name} />
            <Field
              label="Email"
              value={
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
              }
            />
          </div>

          <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">
            Authorization
          </div>
          <div className="mb-5">
            <Field
              label="Role"
              value={
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold ${roleDef.badgeColor}`}>
                  <Shield className="w-3 h-3" />
                  {roleDef.title}
                </span>
              }
            />
            <Field label="Organization" value={
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {user.organization}
              </span>
            } />
            <Field label="Account Status" value={
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                user.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {user.status}
              </span>
            } />
          </div>

          <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">
            Session
          </div>
          <div>
            <Field label="Session ID" value={session?.sessionId || '—'} mono />
            <Field label="Last Login" value={
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {lastLogin}
              </span>
            } />
            <Field label="Session Expires" value={sessionExpiry} />
            <Field label="Remember Device" value={session?.rememberDevice ? 'Yes (7-day session)' : 'No (session only)'} />
          </div>

          {/* Permissions list */}
          <div className="mt-7">
            <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3">
              Permissions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.permissions.map((p) => (
                <span
                  key={p}
                  className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prototype notice */}
      <p className="text-[11px] text-slate-400 font-mono text-center">
        ALTRON Ground Operations Prototype — SIH26174 | Demo Account
      </p>
    </div>
  );
};

export default AccountPage;
