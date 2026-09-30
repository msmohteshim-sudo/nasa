// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Developer & Prototype Controls (16 DEVELOPER / PROTOTYPE)
// ISOLATED PROTOTYPE / DEVELOPMENT ONLY TOOLS (NOT OPERATIONAL ASTRONAUT SETTINGS)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Code, RotateCcw, AlertTriangle, Bug } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
  onResetSession: () => void;
}

export const DeveloperPrototypePanel: React.FC<Props> = ({ config, onChange, onResetSession }) => {
  const [showJsonViewer, setShowJsonViewer] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-rose-200">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-rose-600" />
          <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider font-mono">
            16 Developer & Prototype Control Center
          </h2>
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-mono text-[10px] font-bold">
            PROTOTYPE / DEV ONLY
          </span>
        </div>
        <p className="text-xs text-rose-700 font-medium mt-0.5">
          Internal development tools, mock telemetry triggers, and state inspectors. Isolated from normal operational astronaut settings.
        </p>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs font-mono text-amber-900 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>CAUTION: Developer toggles alter mock perception loops and state simulation parameters.</span>
      </div>

      {/* Developer Toggles */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <span className="text-xs font-bold text-[#002244] uppercase tracking-wider block">
          DEVELOPMENT & TESTING CONTROLS
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'mockDetection', label: 'Mock Observation Sampling Loop' },
            { key: 'mockProcedureEvents', label: 'Simulated Procedure Events' },
            { key: 'visionDebugOverlay', label: 'Vision Debug Overlay (FPS & Box IDs)' },
            { key: 'detectionJsonViewer', label: 'Show Detection Packet JSON Inspector' },
            { key: 'procedureStateViewer', label: 'Show Procedure State Inspector' },
          ].map((item) => (
            <div key={item.key} className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
              <span className="font-semibold text-gray-800">{item.label}</span>
              <input
                type="checkbox"
                checked={(config.developer as any)[item.key]}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    developer: { ...prev.developer, [item.key]: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Quick Action Triggers */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <button
            onClick={onResetSession}
            className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEMO SESSION STATE</span>
          </button>

          <button
            onClick={() => setShowJsonViewer(!showJsonViewer)}
            className="px-3.5 py-2 bg-[#002244] hover:bg-[#003366] text-white rounded font-bold flex items-center gap-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJsonViewer ? 'HIDE CANONICAL CONFIG JSON' : 'INSPECT CONFIG JSON'}</span>
          </button>
        </div>

        {/* JSON State Inspector */}
        {showJsonViewer && (
          <div className="mt-3 p-4 bg-slate-950 text-emerald-400 rounded border border-slate-800 max-h-80 overflow-y-auto font-mono text-[11px]">
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
