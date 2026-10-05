import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AltronLogo } from '@/components/AltronLogo';
import {
  LayoutDashboard,
  FlaskConical,
  Tv,
  FileText,
  Sliders,
  BookOpen,
  Camera,
  Cpu,
  Activity,
  Volume2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { label: 'Mission Console', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Experiments',     path: '/experiments', icon: FlaskConical },
  { label: 'Live Monitor',    path: '/monitor',     icon: Tv },
  { label: 'Reports',         path: '/reports',     icon: FileText },
  { label: 'Documentation',   path: '/docs',        icon: BookOpen },
  { label: 'Settings',        path: '/settings',    icon: Sliders },
];

const SYSTEM_STATUS = [
  { label: 'Camera',           icon: Camera,   status: 'Ready' },
  { label: 'Vision Engine',    icon: Cpu,      status: 'Ready' },
  { label: 'Procedure Engine', icon: Activity, status: 'Ready' },
  { label: 'Voice',            icon: Volume2,  status: 'Ready' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 font-sans">

      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="h-[64px] px-5 flex items-center gap-3 border-b border-gray-200 bg-white">
          <Link to="/" className="flex items-center gap-2.5 group">
            <AltronLogo size={36} className="w-9 h-9 shrink-0 drop-shadow-[0_2px_8px_rgba(26,111,196,0.3)]" />
            <div>
              <div className="text-sm font-black text-[#002244] tracking-[0.2em] leading-none uppercase">ALTRON</div>
              <div className="text-[9px] text-[#1a6fc4] font-bold tracking-[0.16em] uppercase mt-0.5">AI Procedural Intelligence</div>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 font-mono">
            NAVIGATION
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-[#002244] text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#002244]'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section — SYSTEM STATUS */}
      <div className="p-3 m-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-[10px] font-bold text-[#002244] uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
          <span>SYSTEM STATUS</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          {SYSTEM_STATUS.map((sys) => {
            const Icon = sys.icon;
            return (
              <div key={sys.label} className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-gray-500" />
                  <span className="text-[11px] font-sans font-medium text-gray-700">{sys.label}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {sys.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
