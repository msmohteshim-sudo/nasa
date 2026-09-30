import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from '@/context/SessionContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { AppLayout } from '@/layouts/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExperimentsPage } from '@/pages/ExperimentsPage';
import { MonitorPage } from '@/pages/MonitorPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AccountPage } from '@/pages/AccountPage';
import { SecurityPage } from '@/pages/SecurityPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public pages ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* ── Protected operational console ── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/experiments"  element={<ExperimentsPage />} />
              <Route path="/monitor"      element={<MonitorPage />} />
              <Route path="/reports"      element={<ReportsPage />} />
              <Route path="/settings"     element={<SettingsPage />} />
              <Route path="/account"      element={<AccountPage />} />
              <Route path="/security"     element={<SecurityPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;
