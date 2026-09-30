// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Object & Interaction Settings Panel (05 OBJECT & INTERACTION)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Boxes, Layers } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const ObjectInteractionPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Boxes className="w-4 h-4 text-amber-600" />
          <span>05 Experiment Objects & Interaction Analysis</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Enable or disable specific space experiment hardware object classes and configure hand-to-object spatial links.
        </p>
      </div>

      {/* Object Classes Checkboxes */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
          CANONICAL EXPERIMENT HARDWARE OBJECT CLASSES
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {Object.entries(config.objects.enabledClasses).map(([className, isEnabled]) => (
            <div key={className} className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
              <span className="font-semibold text-gray-800">{className}</span>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    objects: {
                      ...prev.objects,
                      enabledClasses: {
                        ...prev.objects.enabledClasses,
                        [className]: e.target.checked,
                      },
                    },
                  }))
                }
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Interaction Types */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>SPATIAL-TEMPORAL INTERACTION TYPES</span>
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {[
            { key: 'near', label: 'NEAR (Proximity < 240px)' },
            { key: 'touching', label: 'TOUCHING (Proximity < 140px)' },
            { key: 'holding', label: 'HOLDING (Bounding Overlap)' },
            { key: 'moving', label: 'MOVING (Overlap + Motion Vector)' },
            { key: 'positioning', label: 'POSITIONING (Fixture Alignment)' },
          ].map((typeItem) => (
            <label key={typeItem.key} className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer">
              <span className="text-[11px] font-semibold text-gray-800">{typeItem.label}</span>
              <input
                type="checkbox"
                checked={(config.interaction.types as any)[typeItem.key]}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    interaction: {
                      ...prev.interaction,
                      types: {
                        ...prev.interaction.types,
                        [typeItem.key]: e.target.checked,
                      },
                    },
                  }))
                }
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
