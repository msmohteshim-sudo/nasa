// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Auth Context Provider & Custom Hook
// Single source of truth for user authentication and authorization across app.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  AuthUser,
  AuthSession,
  AuthRole,
  Permission,
  SecurityEvent,
  LoginCredentials,
} from '@/types/auth';
import { AuthService } from '@/services/auth/authService';

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Execute real login */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** Execute biometric face login */
  loginWithBiometrics: (userId: string, rememberDevice?: boolean, details?: string) => Promise<boolean>;
  /** Clear session and logout */
  logout: () => void;
  /** Check if current user has a specific permission */
  hasPermission: (permission: Permission) => boolean;
  /** Check if current user matches role */
  hasRole: (role: AuthRole | AuthRole[]) => boolean;
  /** Change current user password */
  changePassword: (oldPw: string, newPw: string) => Promise<{ success: boolean; error?: string }>;
  /** Fetch current security audit logs */
  securityLogs: SecurityEvent[];
  /** Refresh security logs */
  refreshLogs: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);

  // Restore session on initial load
  useEffect(() => {
    const activeSession = AuthService.restoreSession();
    if (activeSession) {
      setSession(activeSession);
    }
    setSecurityLogs(AuthService.getSecurityLogs());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await AuthService.login(
        credentials.userIdOrEmail,
        credentials.password,
        credentials.rememberDevice
      );

      if (result.success && result.session) {
        setSession(result.session);
        setSecurityLogs(AuthService.getSecurityLogs());
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'Authentication failed.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected authentication error occurred.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const loginWithBiometrics = useCallback(
    async (userId: string, rememberDevice = false, details?: string): Promise<boolean> => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await AuthService.loginWithBiometrics(userId, rememberDevice, details);

        if (result.success && result.session) {
          setSession(result.session);
          setSecurityLogs(AuthService.getSecurityLogs());
          setIsLoading(false);
          return true;
        } else {
          setError(result.error || 'Biometric authentication failed.');
          setIsLoading(false);
          return false;
        }
      } catch (err: any) {
        setError(err?.message || 'An unexpected biometric error occurred.');
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    AuthService.logout(session?.user);
    setSession(null);
    setError(null);
  }, [session?.user]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!session?.authenticated || !session.user) return false;
      return session.user.permissions.includes(permission);
    },
    [session]
  );

  const hasRole = useCallback(
    (role: AuthRole | AuthRole[]): boolean => {
      if (!session?.authenticated || !session.user) return false;
      if (Array.isArray(role)) {
        return role.includes(session.user.role);
      }
      return session.user.role === role;
    },
    [session]
  );

  const changePassword = useCallback(
    async (oldPw: string, newPw: string) => {
      if (!session?.user) return { success: false, error: 'No active session.' };
      const res = await AuthService.changePassword(session.user.id, oldPw, newPw);
      if (res.success) {
        setSecurityLogs(AuthService.getSecurityLogs());
      }
      return res;
    },
    [session?.user]
  );

  const refreshLogs = useCallback(() => {
    setSecurityLogs(AuthService.getSecurityLogs());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isAuthenticated: !!session?.authenticated,
        isLoading,
        error,
        login,
        loginWithBiometrics,
        logout,
        hasPermission,
        hasRole,
        changePassword,
        securityLogs,
        refreshLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
