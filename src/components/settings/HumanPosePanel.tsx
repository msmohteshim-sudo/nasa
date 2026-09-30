// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Human & Pose Analysis Panel (04 HUMAN / POSE ANALYSIS)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Zap, Activity } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const HumanPosePanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>04 Full-Body Pose & Multi-Person Analysis</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure MoveNet 17-landmark pose smoothing, skeleton line display, and multi-person tracking rules.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
          POSE ESTIMATION PARAMETERS
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
            <label className="font-bold text-gray-800 block">Pose Keypoint Smoothing</label>
            <select
              value={config.humanPose.poseSmoothing}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  humanPose: { ...prev.humanPose, poseSmoothing: e.target.value as any },
                }))
              }
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            >
              <option value="Low">Low (Fastest response)</option>
              <option value="Medium">Medium (Balanced temporal filter)</option>
              <option value="High">High (Smooth skeleton lines)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-800 block">Display Skeleton Overlay</span>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">Draw 17 joint dots & connection lines.</p>
            </div>
            <input
              type="checkbox"
              checked={config.humanPose.skeletonDisplay}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  humanPose: { ...prev.humanPose, skeletonDisplay: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Multi-Person Rules */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>MULTI-PERSON TRACKING & SAFETY RULES</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
            <label className="font-bold text-gray-800 block">Max People Tracked Simultaneously</label>
            <select
              value={config.multiPerson.maxPeopleTracked}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  multiPerson: { ...prev.multiPerson, maxPeopleTracked: Number(e.target.value) },
                }))
              }
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            >
              <option value={1}>1 Person (Single Operator)</option>
              <option value={2}>2 Persons (Operator + Assistant)</option>
              <option value={3}>3 Persons (Multi-subject)</option>
              <option value={5}>5+ Persons (Lab environment)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-800 block">Secondary Person Alert</span>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">Flag warning when extra person enters workspace.</p>
            </div>
            <input
              type="checkbox"
              checked={config.multiPerson.secondaryWarning}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  multiPerson: { ...prev.multiPerson, secondaryWarning: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
