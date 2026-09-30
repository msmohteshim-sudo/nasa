// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Real Authentication Service
// Ground Operations Access, Password Hashing (SHA-256), Session & Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

import {
  AuthUser,
  AuthSession,
  AuthRole,
  Permission,
  SecurityEvent,
  SecurityEventType,
  LoginResult,
  RoleDefinition,
} from '@/types/auth';

// ── Role Definitions & Permissions ──────────────────────────────────────────

export class RolePermissions {
  static readonly ROLE_MAP: Record<AuthRole, RoleDefinition> = {
    GROUND_OPERATOR: {
      role: 'GROUND_OPERATOR',
      title: 'Ground Operator',
      description: 'Executes and monitors space experiment procedures in real time.',
      permissions: [
        'MISSION_VIEW',
        'MISSION_CONTROL',
        'EXPERIMENT_VIEW',
        'EXPERIMENT_RUN',
        'LIVE_MONITOR_VIEW',
        'REPORT_VIEW',
        'REPORT_EXPORT',
        'SETTINGS_VIEW',
      ],
      badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
    },
    EXPERIMENT_SCIENTIST: {
      role: 'EXPERIMENT_SCIENTIST',
      title: 'Experiment Scientist',
      description: 'Designs scientific steps, parameters, and verifies experiment protocols.',
      permissions: [
        'MISSION_VIEW',
        'EXPERIMENT_VIEW',
        'EXPERIMENT_RUN',
        'EXPERIMENT_EDIT',
        'LIVE_MONITOR_VIEW',
        'REPORT_VIEW',
        'REPORT_EXPORT',
        'SETTINGS_VIEW',
      ],
      badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
    },
    MISSION_ENGINEER: {
      role: 'MISSION_ENGINEER',
      title: 'Mission / System Engineer',
      description: 'Configures vision pipeline parameters, hardware integration, and thresholds.',
      permissions: [
        'MISSION_VIEW',
        'MISSION_CONTROL',
        'EXPERIMENT_VIEW',
        'EXPERIMENT_RUN',
        'EXPERIMENT_EDIT',
        'LIVE_MONITOR_VIEW',
        'REPORT_VIEW',
        'REPORT_EXPORT',
        'SETTINGS_VIEW',
        'SETTINGS_EDIT',
      ],
      badgeColor: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
    },
    RESEARCHER: {
      role: 'RESEARCHER',
      title: 'Researcher',
      description: 'Analyzes procedural logs, telemetry, and exports experiment reports.',
      permissions: [
        'MISSION_VIEW',
        'EXPERIMENT_VIEW',
        'LIVE_MONITOR_VIEW',
        'REPORT_VIEW',
        'REPORT_EXPORT',
      ],
      badgeColor: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
    },
    ADMINISTRATOR: {
      role: 'ADMINISTRATOR',
      title: 'Administrator',
      description: 'Full administrative access, user management, and security policy control.',
      permissions: [
        'MISSION_VIEW',
        'MISSION_CONTROL',
        'EXPERIMENT_VIEW',
        'EXPERIMENT_RUN',
        'EXPERIMENT_EDIT',
        'LIVE_MONITOR_VIEW',
        'REPORT_VIEW',
        'REPORT_EXPORT',
        'SETTINGS_VIEW',
        'SETTINGS_EDIT',
        'USER_MANAGEMENT',
      ],
      badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
    },
    VIEWER: {
      role: 'VIEWER',
      title: 'Viewer',
      description: 'Read-only access to mission telemetry, procedure progress, and reports.',
      permissions: [
        'MISSION_VIEW',
        'EXPERIMENT_VIEW',
        'LIVE_MONITOR_VIEW',
        'REPORT_VIEW',
      ],
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
  };
}

// ── Password Hashing Helper (SHA-256 Web Crypto API) ───────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`altron_salt_2026_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed SHA-256 hashes for development demo accounts
// Hash formula: SHA-256("altron_salt_2026_" + rawPassword)
const DEMO_HASHES: Record<string, string> = {
  'demo.operator': '60b37dbd178e630cc6114eb304044be2dfce22616f7435fbd0ea9edbb3fdf6c6', // Operator#2026
  'demo.scientist': 'a88c03fe0b2401878d655f4cd6fbcdfffc9062eb1bfbb3bf437021ebfb1a3848', // Scientist#2026
  'demo.engineer': '03ddcefd3c22ea0a402375faeb1adfc634ae7efb9fb4cf06db48fcd6ea07ed08', // Engineer#2026
  'demo.researcher': 'b28eb97e7ed034d6a8b75f56477e68ad1eeb5c8e31a9aa6ff7a01a35ae74a589', // Researcher#2026
  'demo.admin': 'aef783df8be8bd93322d8e48b8c2bebbccf6d0f1eb7ff8dbe9ea2fcfcd97fa52', // Admin#2026
  'demo.viewer': '9c4f74d081fbb48c697818e97f02b9cb0bdffebfca9517e5a75bd5ec55d9d714', // Viewer#2026
  'shim': '5165fee906936a51a96510345091f52dda8709397c17160766fb19d11c8fbc24',         // 123456
};

// ── Initial Seed Users ───────────────────────────────────────────────────────

const SEEDED_USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: 'usr-op-01',
    userId: 'demo.operator',
    name: 'Alex Sharma',
    email: 'alex.sharma@altron.ops',
    role: 'GROUND_OPERATOR',
    organization: 'ALTRON Ground Operations Prototype',
    permissions: RolePermissions.ROLE_MAP.GROUND_OPERATOR.permissions,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T08:00:00Z',
    passwordHash: DEMO_HASHES['demo.operator'],
  },
  {
    id: 'usr-sc-02',
    userId: 'demo.scientist',
    name: 'Dr. Evelyn Reed',
    email: 'evelyn.reed@altron.ops',
    role: 'EXPERIMENT_SCIENTIST',
    organization: 'ALTRON Ground Operations Prototype',
    permissions: RolePermissions.ROLE_MAP.EXPERIMENT_SCIENTIST.permissions,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-16T09:30:00Z',
    passwordHash: DEMO_HASHES['demo.scientist'],
  },
  {
    id: 'usr-eng-03',
    userId: 'demo.engineer',
    name: 'Marcus Vance',
    email: 'marcus.vance@altron.ops',
    role: 'MISSION_ENGINEER',
    organization: 'ALTRON Ground Operations Prototype',
    permissions: RolePermissions.ROLE_MAP.MISSION_ENGINEER.permissions,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-18T11:00:00Z',
    passwordHash: DEMO_HASHES['demo.engineer'],
  },
  {
    id: 'usr-res-04',
    userId: 'demo.researcher',
    name: 'Priya Nair',
    email: 'priya.nair@altron.ops',
    role: 'RESEARCHER',
    organization: 'ALTRON Ground Operations Prototype',
    permissions: RolePermissions.ROLE_MAP.RESEARCHER.permissions,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T14:20:00Z',
    passwordHash: DEMO_HASHES['demo.researcher'],
  },
  {
    id: 'usr-adm-05',
    userId: 'demo.admin',
    name: 'Commander Vikram Sethi',
    email: 'vikram.sethi@altron.ops',
    role: 'ADMINISTRATOR',
    organization: 'ALTRON Ground Operations Prototype',
    permissions: RolePermissions.ROLE_MAP.ADMINISTRATOR.permissions,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    passwordHash: DEMO_HASHES['demo.admin'],
  },
  {
    id: 'usr-vw-06',
    userId: 'demo.viewer',
    name: 'Observer Access',
    email: 'observer@altron.ops',
    role: 'VIEWER',
    organization: 'ALTRON Ground Operations Prototype',
    permissions: RolePermissions.ROLE_MAP.VIEWER.permissions,
    status: 'ACTIVE',
    createdAt: '2026-02-10T10:00:00Z',
    passwordHash: DEMO_HASHES['demo.viewer'],
  },
  {
    id: 'usr-shim-07',
    userId: 'shim',
    name: 'Shim',
    email: 'shim@altron.ops',
    role: 'GROUND_OPERATOR',
    organization: 'ALTRON Ground Operations Prototype',
    permissions: RolePermissions.ROLE_MAP.GROUND_OPERATOR.permissions,
    status: 'ACTIVE',
    createdAt: '2026-09-30T00:00:00Z',
    passwordHash: DEMO_HASHES['shim'],
  },
];

// ── Persistent Storage Keys ──────────────────────────────────────────────────

const USERS_KEY = 'altron_auth_users_db_v1';
const SESSION_KEY = 'altron_auth_session_v1';
const SECURITY_LOGS_KEY = 'altron_security_audit_logs_v1';

// ── Auth Service Class ───────────────────────────────────────────────────────

export class AuthService {
  private static usersStore: (AuthUser & { passwordHash: string })[] = [];
  private static securityLogs: SecurityEvent[] = [];

  // Initialize store from localStorage if available.
  // We always upsert SEEDED_USERS by userId so newly seeded accounts
  // (like 'shim') propagate into existing localStorage databases.
  private static initStores() {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) {
        const parsed: (AuthUser & { passwordHash: string })[] = JSON.parse(storedUsers);
        // Upsert: add any seeded user that doesn't exist yet
        const userIdSet = new Set(parsed.map((u) => u.userId));
        let dirty = false;
        for (const seeded of SEEDED_USERS) {
          if (!userIdSet.has(seeded.userId)) {
            parsed.push(seeded);
            dirty = true;
          }
        }
        this.usersStore = parsed;
        if (dirty) {
          localStorage.setItem(USERS_KEY, JSON.stringify(this.usersStore));
        }
      } else {
        this.usersStore = [...SEEDED_USERS];
        localStorage.setItem(USERS_KEY, JSON.stringify(this.usersStore));
      }

      const storedLogs = localStorage.getItem(SECURITY_LOGS_KEY);
      if (storedLogs) {
        this.securityLogs = JSON.parse(storedLogs);
      } else {
        // Seed initial audit log
        this.securityLogs = [
          {
            id: 'sec-001',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            userId: 'usr-op-01',
            userName: 'Alex Sharma',
            userRole: 'GROUND_OPERATOR',
            eventType: 'LOGIN_SUCCESS',
            ipAddress: '192.168.1.42 (Ops Center Terminal 4)',
            details: 'Successful authentication via ground ops credentials.',
            level: 'info',
          },
        ];
        localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(this.securityLogs));
      }
    } catch {
      this.usersStore = [...SEEDED_USERS];
    }
  }

  /** Log a security event into audit trail */
  static logSecurityEvent(
    userId: string,
    userName: string,
    userRole: AuthRole,
    eventType: SecurityEventType,
    details: string,
    level: 'info' | 'warning' | 'critical' = 'info'
  ) {
    this.initStores();
    const event: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole,
      eventType,
      ipAddress: '192.168.1.104 (Ground Workstation)',
      details,
      level,
    };

    this.securityLogs.unshift(event);
    this.securityLogs = this.securityLogs.slice(0, 300); // keep last 300
    try {
      localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(this.securityLogs));
    } catch {
      // ignore storage errors
    }
  }

  /** Real login authentication method */
  static async login(
    userIdOrEmail: string,
    password: string,
    rememberDevice = false
  ): Promise<LoginResult> {
    this.initStores();

    // Small artificial delay to reflect real network authentication
    await new Promise((res) => setTimeout(res, 600));

    const cleanInput = userIdOrEmail.trim().toLowerCase();
    const userWithHash = this.usersStore.find(
      (u) => u.userId.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
    );

    if (!userWithHash) {
      this.logSecurityEvent(
        'unknown',
        cleanInput,
        'VIEWER',
        'LOGIN_FAILED',
        `Failed authentication attempt for non-existent identifier: '${cleanInput}'`,
        'warning'
      );
      return {
        success: false,
        error: 'Invalid credentials. User ID or password is incorrect.',
      };
    }

    if (userWithHash.status !== 'ACTIVE') {
      this.logSecurityEvent(
        userWithHash.id,
        userWithHash.name,
        userWithHash.role,
        'LOGIN_FAILED',
        `Attempted login on non-active account status: ${userWithHash.status}`,
        'warning'
      );
      return {
        success: false,
        error: 'Account access disabled. Please contact your ALTRON Operations Administrator.',
      };
    }

    // Hash input password with SHA-256 and compare
    const inputHash = await hashPassword(password);
    
    // Also support exact match if raw matches fallback in dev, but primary check is SHA-256 hash!
    const matchesHash = inputHash === userWithHash.passwordHash || (DEMO_HASHES[userWithHash.userId] && inputHash === DEMO_HASHES[userWithHash.userId]);

    if (!matchesHash) {
      this.logSecurityEvent(
        userWithHash.id,
        userWithHash.name,
        userWithHash.role,
        'LOGIN_FAILED',
        `Failed password verification for user '${userWithHash.userId}'`,
        'warning'
      );
      return {
        success: false,
        error: 'Invalid credentials. User ID or password is incorrect.',
      };
    }

    // Success! Update last login timestamp
    const nowIso = new Date().toISOString();
    userWithHash.lastLoginAt = nowIso;
    this.saveUsers();

    const { passwordHash, ...userClean } = userWithHash;

    // Build session
    const sessionExpiry = new Date(Date.now() + (rememberDevice ? 86400000 * 7 : 86400000)).toISOString();
    const session: AuthSession = {
      authenticated: true,
      user: userClean,
      sessionId: `SES-${Date.now().toString(36).toUpperCase()}`,
      expiresAt: sessionExpiry,
      rememberDevice,
      loginTimestamp: nowIso,
      ipAddress: '192.168.1.104 (Ground Workstation)',
      userAgent: navigator.userAgent || 'ALTRON Ground Client',
    };

    // Store active session
    try {
      if (rememberDevice) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // ignore
    }

    this.logSecurityEvent(
      userClean.id,
      userClean.name,
      userClean.role,
      'LOGIN_SUCCESS',
      `Authorized session established. Expiry: ${new Date(sessionExpiry).toLocaleTimeString()}`,
      'info'
    );

    return {
      success: true,
      user: userClean,
      session,
    };
  }

  /** Restore active session on page reload */
  static restoreSession(): AuthSession | null {
    this.initStores();
    try {
      const sessionStr = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;

      const session: AuthSession = JSON.parse(sessionStr);
      if (!session.authenticated || !session.expiresAt) return null;

      // Check expiry
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout();
        return null;
      }

      // Refresh permissions from active user DB
      if (session.user) {
        const freshUser = this.usersStore.find((u) => u.id === session.user?.id);
        if (freshUser && freshUser.status === 'ACTIVE') {
          const { passwordHash, ...userClean } = freshUser;
          session.user = userClean;
        } else {
          this.logout();
          return null;
        }
      }

      return session;
    } catch {
      return null;
    }
  }

  /** End session */
  static logout(user?: AuthUser | null): void {
    if (user) {
      this.logSecurityEvent(
        user.id,
        user.name,
        user.role,
        'LOGOUT',
        'User manually signed out of ALTRON Operations Console.',
        'info'
      );
    }
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }

  /** Change user password with verification */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    this.initStores();
    const user = this.usersStore.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    const oldHash = await hashPassword(oldPassword);
    if (oldHash !== user.passwordHash) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    user.passwordHash = await hashPassword(newPassword);
    this.saveUsers();

    this.logSecurityEvent(
      user.id,
      user.name,
      user.role,
      'PASSWORD_CHANGED',
      'Account password updated successfully.',
      'info'
    );

    return { success: true };
  }

  /** Request password reset */
  static async requestPasswordReset(userIdOrEmail: string): Promise<{ success: boolean; message: string }> {
    this.initStores();
    const cleanInput = userIdOrEmail.trim().toLowerCase();
    const user = this.usersStore.find(
      (u) => u.userId.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
    );

    if (user) {
      this.logSecurityEvent(
        user.id,
        user.name,
        user.role,
        'PASSWORD_RESET_REQUESTED',
        `Password reset requested for email '${user.email}'.`,
        'info'
      );
    }

    // Always return neutral response to prevent account enumeration
    return {
      success: true,
      message: 'If an authorized account matches your request, password reset instructions have been logged to the security dispatch.',
    };
  }

  /** Retrieve security logs for audit page */
  static getSecurityLogs(): SecurityEvent[] {
    this.initStores();
    return [...this.securityLogs];
  }

  /** Retrieve all users (Admin only) */
  static getUsers(): AuthUser[] {
    this.initStores();
    return this.usersStore.map(({ passwordHash, ...user }) => user);
  }

  /** Create user (Admin only) */
  static async createUser(
    userData: Omit<AuthUser, 'id' | 'createdAt' | 'status' | 'permissions'> & { password: string }
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    this.initStores();
    if (this.usersStore.some((u) => u.userId.toLowerCase() === userData.userId.toLowerCase())) {
      return { success: false, error: 'User ID already exists.' };
    }

    const passwordHash = await hashPassword(userData.password);
    const newUser: AuthUser & { passwordHash: string } = {
      id: `usr-${Date.now().toString(36)}`,
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      organization: userData.organization || 'ALTRON Ground Operations Prototype',
      permissions: RolePermissions.ROLE_MAP[userData.role].permissions,
      status: 'ACTIVE',
      avatar: userData.avatar,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    this.usersStore.push(newUser);
    this.saveUsers();

    this.logSecurityEvent(
      newUser.id,
      newUser.name,
      newUser.role,
      'USER_CREATED',
      `New user created with role ${newUser.role} by Administrator.`,
      'info'
    );

    const { passwordHash: _, ...clean } = newUser;
    return { success: true, user: clean };
  }

  /** Update user role (Admin only) */
  static updateUserRole(userId: string, newRole: AuthRole): { success: boolean; error?: string } {
    this.initStores();
    const user = this.usersStore.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    const oldRole = user.role;
    user.role = newRole;
    user.permissions = RolePermissions.ROLE_MAP[newRole].permissions;
    this.saveUsers();

    this.logSecurityEvent(
      user.id,
      user.name,
      user.role,
      'ROLE_CHANGE',
      `Role updated from ${oldRole} to ${newRole}.`,
      'warning'
    );

    return { success: true };
  }

  /** Toggle user active status (Admin only) */
  static toggleUserStatus(userId: string): { success: boolean; error?: string } {
    this.initStores();
    const user = this.usersStore.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    user.status = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    this.saveUsers();

    this.logSecurityEvent(
      user.id,
      user.name,
      user.role,
      'USER_DISABLED',
      `Account status toggled to ${user.status}.`,
      'warning'
    );

    return { success: true };
  }

  private static saveUsers() {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(this.usersStore));
    } catch {
      // ignore
    }
  }
}
