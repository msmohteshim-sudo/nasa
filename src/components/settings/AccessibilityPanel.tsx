// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Accessibility Panel (15 ACCESSIBILITY)
// ─────────────────────────────────────────────────────────────────────────────

import { Eye } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const AccessibilityPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Eye className="w-4 h-4 text-blue-600" />
          <span>15 Accessibility & Contrast Adjustments</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure text sizing, high contrast colors, reduced motion preferences, and keyboard shortcuts.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
          <label className="font-bold text-[#002244] block">UI Text Size Scale</label>
          <select
            value={config.accessibility.textSize}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                accessibility: { ...prev.accessibility, textSize: e.target.value as any },
              }))
            }
            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
          >
            <option value="Small">Small (Compact font size)</option>
            <option value="Default">Default (Standard ALTRON typography)</option>
            <option value="Large">Large (Enlarged font size)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer">
            <span className="font-semibold text-gray-800">High Contrast UI</span>
            <input
              type="checkbox"
              checked={config.accessibility.highContrast}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  accessibility: { ...prev.accessibility, highContrast: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer">
            <span className="font-semibold text-gray-800">Reduced Motion</span>
            <input
              type="checkbox"
              checked={config.accessibility.reducedMotion}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  accessibility: { ...prev.accessibility, reducedMotion: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer">
            <span className="font-semibold text-gray-800">Keyboard Navigation</span>
            <input
              type="checkbox"
              checked={config.accessibility.keyboardNav}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  accessibility: { ...prev.accessibility, keyboardNav: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
