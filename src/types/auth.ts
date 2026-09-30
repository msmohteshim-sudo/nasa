// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Authentication & Authorization Types
// Operational Ground Operations Identity & Role-Based Access Control (RBAC)
// ─────────────────────────────────────────────────────────────────────────────

export type AuthRole =
  | 'GROUND_OPERATOR'
  | 'EXPERIMENT_SCIENTIST'
  | 'MISSION_ENGINEER'
  | 'RESEARCHER'
  | 'ADMINISTRATOR'
  | 'VIEWER';

export type Permission =
  | 'MISSION_VIEW'
  | 'MISSION_CONTROL'
  | 'EXPERIMENT_VIEW'
  | 'EXPERIMENT_RUN'
  | 'EXPERIMENT_EDIT'
  | 'LIVE_MONITOR_VIEW'
  | 'REPORT_VIEW'
  | 'REPORT_EXPORT'
  | 'SETTINGS_VIEW'
  | 'SETTINGS_EDIT'
  | 'USER_MANAGEMENT';

export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: AuthRole;
  organization: string;
  permissions: Permission[];
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthSession {
  authenticated: boolean;
  user: AuthUser | null;
  sessionId: string | null;
  expiresAt: string | null;
  rememberDevice: boolean;
  loginTimestamp: string | null;
  ipAddress: string;
  userAgent: string;
}

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'ROLE_CHANGE'
  | 'ACCOUNT_LOCKED'
  | 'USER_CREATED'
  | 'USER_DISABLED';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: AuthRole;
  eventType: SecurityEventType;
  ipAddress: string;
  details: string;
  level: 'info' | 'warning' | 'critical';
}

export interface LoginCredentials {
  userIdOrEmail: string;
  password: string;
  rememberDevice?: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  session?: AuthSession;
}

export interface RoleDefinition {
  role: AuthRole;
  title: string;
  description: string;
  permissions: Permission[];
  badgeColor: string;
}
