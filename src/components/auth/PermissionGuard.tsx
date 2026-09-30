// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Permission Guard
// Blocks rendering if user lacks required permission. Shows ACCESS RESTRICTED.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Permission } from '@/types/auth';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  /** Optional custom fallback; defaults to ACCESS RESTRICTED card */
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-2 uppercase tracking-wider">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          You do not have permission to access this section of the ALTRON console.
          <br />
          Contact your ALTRON administrator if you require elevated access.
        </p>
        <div className="mt-4 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded text-[11px] font-mono text-rose-700">
          Required permission: {permission}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
