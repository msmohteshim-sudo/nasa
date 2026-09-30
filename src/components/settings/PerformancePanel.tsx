// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Vision Performance Panel (13 PERFORMANCE)
// ─────────────────────────────────────────────────────────────────────────────

import { Zap } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const PerformancePanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Zap className="w-4 h-4 text-blue-600" />
          <span>13 Hardware Optimization & Inference Performance</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure adaptive processing, inference resolution scaling, and frame rate optimization.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
            <label className="font-bold text-[#002244] block">Inference Processing Mode</label>
            <select
              value={config.performance.processingMode}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  performance: { ...prev.performance, processingMode: e.target.value as any },
                }))
              }
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            >
              <option value="Performance">Performance (Prioritize speed)</option>
              <option value="Balanced">Balanced (Optimal ratio)</option>
              <option value="Quality">Quality (Maximum precision)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
            <label className="font-bold text-[#002244] block">Frame Processing Strategy</label>
            <select
              value={config.performance.frameProcessing}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  performance: { ...prev.performance, frameProcessing: e.target.value as any },
                }))
              }
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            >
              <option value="Every frame">Every frame (Full inference rate)</option>
              <option value="Every 2 frames">Every 2 frames (Half rate)</option>
              <option value="Adaptive">Adaptive (Recommended - Auto throttle on load)</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
          <div>
            <span className="font-bold text-[#002244] block">Auto-Optimize Performance</span>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">Automatically reduces optional overlays if latency exceeds 100ms.</p>
          </div>
          <input
            type="checkbox"
            checked={config.performance.autoOptimize}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                performance: { ...prev.performance, autoOptimize: e.target.checked },
              }))
            }
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
