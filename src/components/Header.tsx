import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  X,
  Home,
  ChevronRight,
  Video,
  Cpu,
  ChevronDown,
  LogOut,
  Shield,
  UserCircle2,
  Settings,
  Clock,
  Circle,
  Users,
} from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { NAV_ITEMS } from '@/data/navigation';
import { useAuth } from '@/context/AuthContext';
import { RolePermissions } from '@/services/auth/authService';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logs } = useSystemStatus();
  const { user, session, logout, isAuthenticated } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentNavItem = NAV_ITEMS.find((item) => item.path === location.pathname) || {
    label: 'Mission Console',
    description: 'AI Procedural Intelligence for Space Experiments',
  };

  const recentAlerts = logs.filter((l) => l.level === 'warning' || l.level === 'error' || l.level === 'critical');

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleDef = user ? RolePermissions.ROLE_MAP[user.role] : null;

  // Session expiry display
  const sessionExpiryStr = session?.expiresAt
    ? new Date(session.expiresAt).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <header className="h-[64px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">

      {/* Left: Breadcrumb + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-500">
          <Link to="/" className="hover:text-[#002244] transition-colors flex items-center gap-1 font-bold text-[#002244]">
            <Home className="w-3.5 h-3.5 text-gray-500" />
            <span>ALTRON</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium">{currentNavItem.label}</span>
        </div>

        <div className="sm:hidden">
          <div className="text-sm font-bold text-[#002244]">{currentNavItem.label}</div>
        </div>

        <div className="hidden sm:block w-px h-4 bg-gray-300 mx-1" />

        <div className="hidden md:block min-w-0">
          <p className="text-xs text-gray-500 truncate">{currentNavItem.description}</p>
        </div>
      </div>

      {/* Right: Search, Badges, Notifications, User */}
      <div className="flex items-center gap-2.5">

        {/* Search */}
        <div className="relative">
          {showSearch ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-gray-300 rounded-md px-3 py-1.5 w-56 shadow-inner">
              <Search className="w-3.5 h-3.5 text-[#002244] shrink-0" />
              <input
                type="text"
                placeholder="Search console..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none w-full font-sans"
                autoFocus
              />
              <button
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-1.5 rounded-md border border-gray-200 bg-gray-50 text-gray-600 hover:text-[#002244] hover:bg-gray-100 transition-colors"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Badges: Prototype, Camera Ready, AI Ready */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2.5 py-1 bg-slate-100 border border-gray-200 rounded text-gray-700 font-semibold uppercase">
            Prototype
          </span>
          <span className="hidden lg:flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-semibold uppercase">
            <Video className="w-3 h-3 text-emerald-600" />
            Camera Ready
          </span>
          <span className="hidden lg:flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-semibold uppercase">
            <Cpu className="w-3 h-3 text-emerald-600" />
            AI Ready
          </span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="p-2 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:text-[#002244] hover:bg-gray-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {recentAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                {recentAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-md bg-white border border-gray-200 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" /> Procedural Alerts
                </span>
                <span className="text-[10px] bg-blue-100 text-[#002244] px-2 py-0.5 rounded-full font-mono font-semibold">
                  {recentAlerts.length} ACTIVE
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {recentAlerts.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6 font-mono">No active alerts.</p>
                ) : (
                  recentAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono ${
                          alert.level === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          alert.level === 'error'    ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                       'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {alert.level}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{alert.timestamp.slice(11)}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-snug">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile menu — only when authenticated */}
        {isAuthenticated && user && (
          <div className="relative" ref={userMenuRef}>
            <button
              id="altron-user-menu-btn"
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              title="User menu"
            >
              {/* Avatar or initials */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#0d2b5e] flex items-center justify-center text-[10px] font-bold text-white">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[11px] font-semibold text-slate-800 max-w-[110px] truncate">{user.name}</span>
                <span className="text-[9px] text-slate-500 font-mono max-w-[110px] truncate">
                  {RolePermissions.ROLE_MAP[user.role].title}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-gray-200 shadow-2xl z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-4 bg-[#f7f9fc] border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#0d2b5e] flex items-center justify-center text-sm font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{user.name}</div>
                      <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${roleDef?.badgeColor}`}>
                        {roleDef?.title}
                      </div>
                    </div>
                  </div>
                  {/* Session active indicator */}
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">
                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                    <span className="font-semibold">SESSION ACTIVE</span>
                    {sessionExpiryStr && (
                      <span className="ml-auto text-emerald-600 font-mono">until {sessionExpiryStr}</span>
                    )}
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/account'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCircle2 className="w-4 h-4 text-slate-400" />
                    Profile & Account
                  </button>
                  <button
                    onClick={() => { navigate('/security'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    Security
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Console Settings
                  </button>
                  {/* Admin-only: User Management */}
                  {user.role === 'ADMINISTRATOR' && (
                    <button
                      onClick={() => { navigate('/admin/users'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <Users className="w-4 h-4 text-amber-500" />
                      User Management
                    </button>
                  )}
                  <div className="flex items-center gap-3 px-4 py-2.5 text-[11px] text-slate-400 border-t border-gray-100 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Session: <span className="font-mono">{session?.sessionId?.slice(0, 12)}</span>
                    </span>
                  </div>
                </div>

                {/* Sign out */}
                <div className="border-t border-gray-100 p-2">
                  {showLogoutConfirm ? (
                    <div className="px-2 py-2">
                      <p className="text-[11px] text-slate-600 mb-2 font-medium">
                        End your ALTRON operations session?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowLogoutConfirm(false)}
                          className="flex-1 py-1.5 text-[11px] border border-gray-200 rounded text-slate-600 hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex-1 py-1.5 text-[11px] bg-rose-600 hover:bg-rose-700 text-white rounded transition font-semibold"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center gap-3 px-2 py-2 text-[13px] text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
