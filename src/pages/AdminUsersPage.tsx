// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Admin: User Management Page
// Administrators can create users, change roles, and toggle account status.
// Accessible only to ADMINISTRATOR role.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  UserPlus,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthService, RolePermissions } from '@/services/auth/authService';
import type { AuthUser, AuthRole } from '@/types/auth';

const ALL_ROLES: AuthRole[] = [
  'GROUND_OPERATOR',
  'EXPERIMENT_SCIENTIST',
  'MISSION_ENGINEER',
  'RESEARCHER',
  'ADMINISTRATOR',
  'VIEWER',
];

// ── Create User Modal ─────────────────────────────────────────────────────────
interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'GROUND_OPERATOR' as AuthRole,
    organization: 'ALTRON Ground Operations Prototype',
  });
  const [showPw, setShowPw] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.userId.trim() || !form.name.trim() || !form.email.trim() || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setState('saving');
    const res = await AuthService.createUser({
      userId: form.userId.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      organization: form.organization.trim() || 'ALTRON Ground Operations Prototype',
    });

    if (res.success) {
      onCreated();
      onClose();
    } else {
      setError(res.error || 'Failed to create user.');
      setState('error');
    }
  };

  const inputCls =
    'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 focus:border-[#1a6fc4] transition disabled:opacity-60';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#d32f2f] via-[#f59e0b] to-[#1a6fc4]" />
        <div className="px-7 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-[#0d2b5e] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#1a6fc4]" />
              Create New User
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 px-3 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                  User ID *
                </label>
                <input
                  type="text"
                  value={form.userId}
                  onChange={set('userId')}
                  placeholder="e.g. shim"
                  className={inputCls}
                  disabled={state === 'saving'}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                  Role *
                </label>
                <select
                  value={form.role}
                  onChange={set('role')}
                  className={inputCls}
                  disabled={state === 'saving'}
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{RolePermissions.ROLE_MAP[r].title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Shim Operator"
                className={inputCls}
                disabled={state === 'saving'}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="e.g. shim@altron.ops"
                className={inputCls}
                disabled={state === 'saving'}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                Organization
              </label>
              <input
                type="text"
                value={form.organization}
                onChange={set('organization')}
                className={inputCls}
                disabled={state === 'saving'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min. 4 chars"
                    className={`${inputCls} pr-8`}
                    disabled={state === 'saving'}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                  Confirm *
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Repeat password"
                  className={inputCls}
                  disabled={state === 'saving'}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={state === 'saving'}
                className="flex-1 py-2.5 bg-[#0d2b5e] hover:bg-[#1a4080] disabled:opacity-60 text-white font-bold text-[13px] tracking-wider rounded-lg transition flex items-center justify-center gap-2"
              >
                {state === 'saving' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                ) : (
                  'CREATE USER'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Main Admin User Management Page ──────────────────────────────────────────
export const AdminUsersPage: React.FC = () => {
  const { user: currentUser, hasRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState('');

  const isAdmin = hasRole('ADMINISTRATOR');

  const loadUsers = () => {
    setUsers(AuthService.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = (userId: string) => {
    AuthService.toggleUserStatus(userId);
    loadUsers();
    setMessage('User status updated.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRoleChange = (userId: string, newRole: AuthRole) => {
    if (userId === currentUser?.id) {
      setMessage('You cannot change your own role.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    AuthService.updateUserRole(userId, newRole);
    loadUsers();
    setMessage('Role updated.');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-2 uppercase tracking-wider">Access Restricted</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          User management requires Administrator access.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-[#002244] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#0d2b5e] tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-[#1a6fc4]" />
          User Management
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="p-2 border border-gray-200 rounded-lg text-slate-500 hover:text-[#002244] hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d2b5e] hover:bg-[#1a4080] text-white text-[13px] font-bold tracking-wider rounded-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1a6fc4]" />
            <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">
              All Users ({users.length})
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => {
            const roleDef = RolePermissions.ROLE_MAP[u.role];
            const isCurrentUser = u.id === currentUser?.id;
            return (
              <div
                key={u.id}
                className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50 transition ${
                  u.status === 'DISABLED' ? 'opacity-60' : ''
                }`}
              >
                {/* Avatar + identity */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0d2b5e] flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-slate-800">{u.name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded font-mono font-bold">YOU</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 border rounded font-mono font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {u.userId} · {u.email}
                    </div>
                  </div>
                </div>

                {/* Role selector */}
                <div className="flex items-center gap-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as AuthRole)}
                    disabled={isCurrentUser}
                    className={`text-[11px] font-mono border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a6fc4]/40 transition disabled:opacity-50 ${roleDef.badgeColor}`}
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>{RolePermissions.ROLE_MAP[r].title}</option>
                    ))}
                  </select>

                  {/* Toggle status */}
                  {!isCurrentUser && (
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`text-[11px] px-3 py-1.5 border rounded font-semibold transition ${
                        u.status === 'ACTIVE'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prototype note */}
      <p className="text-[11px] text-slate-400 font-mono text-center">
        ALTRON Ground Operations Prototype — User data stored in local browser storage.
      </p>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            loadUsers();
            setMessage('User created successfully. They can now sign in.');
          }}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
