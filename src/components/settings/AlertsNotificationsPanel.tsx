// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Alerts & Notifications Settings Panel (10 ALERTS & NOTIFICATIONS)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Shield, Bell } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const AlertsNotificationsPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Bell className="w-4 h-4 text-rose-600" />
          <span>10 Alert Management & Incident Dispatch</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure visual notifications, audio alerts, incident log triggers, and severity levels.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <span className="text-xs font-bold text-[#002244] uppercase tracking-wider block">
          SYSTEM ALERT SEVERITY THRESHOLD
        </span>
        <select
          value={config.alerts.severityLevel}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              alerts: { ...prev.alerts, severityLevel: e.target.value as any },
            }))
          }
          className="w-full bg-slate-50 border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-900"
        >
          <option value="INFO">INFO (Log all minor notifications)</option>
          <option value="NOTICE">NOTICE (Log procedural deviations & camera events)</option>
          <option value="WARNING">WARNING (Log warnings & wrong step actions)</option>
          <option value="CRITICAL">CRITICAL (Only log critical hardware/AI failures)</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-600" />
          <span>INCIDENT TRIGGER RULES</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {[
            { key: 'cameraDisconnect', label: 'Camera Disconnected Alert' },
            { key: 'aiUnavailable', label: 'AI Model / Inference Offline' },
            { key: 'wrongAction', label: 'Wrong Action Deviation Alert' },
            { key: 'outOfSequence', label: 'Out-of-Sequence Protocol Warning' },
            { key: 'multiplePeople', label: 'Secondary Person Safety Warning' },
            { key: 'objectMissing', label: 'Required Hardware Object Missing' },
          ].map((item) => (
            <div key={item.key} className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
              <span className="font-semibold text-gray-800">{item.label}</span>
              <input
                type="checkbox"
                checked={(config.alerts as any)[item.key]}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    alerts: { ...prev.alerts, [item.key]: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
