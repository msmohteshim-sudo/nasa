// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Protected Route Guard
// Redirects unauthenticated requests to /login with redirect parameter.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020B18] flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-6 py-4 shadow-xl">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-sm font-mono text-slate-300">
            Verifying ALTRON Ground Operational Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  return <>{children}</>;
};
