// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Motion & Activity Settings Panel (06 MOTION & ACTIVITY)
// ─────────────────────────────────────────────────────────────────────────────

import { Activity } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const MotionActivityPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Activity className="w-4 h-4 text-purple-600" />
          <span>06 Motion Velocity & Activity Breakdown</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure temporal displacement calculation, body region motion metrics, and intensity sensitivity.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider">
              TEMPORAL MOTION ANALYSIS
            </span>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Calculates frame-to-frame pixel and landmark displacement velocity.
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.motion.enabled}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                motion: { ...prev.motion, enabled: e.target.checked },
              }))
            }
            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
            <label className="font-bold text-gray-800 block">Motion Sensitivity Threshold</label>
            <select
              value={config.motion.intensityThreshold}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  motion: { ...prev.motion, intensityThreshold: e.target.value as any },
                }))
              }
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            >
              <option value="Low">Low (Detect minor hand twitches)</option>
              <option value="Moderate">Moderate (Standard displacement)</option>
              <option value="High">High (Major body movements only)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-800 block">Track Movement Vector Directions</span>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">Renders arrow lines indicating trajectory.</p>
            </div>
            <input
              type="checkbox"
              checked={config.motion.trackDirections}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  motion: { ...prev.motion, trackDirections: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
