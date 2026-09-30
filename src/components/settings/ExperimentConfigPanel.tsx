// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Experiment Configuration Panel (08 EXPERIMENT CONFIGURATION)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FileCode, Info } from 'lucide-react';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const ExperimentConfigPanel: React.FC<Props> = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <FileCode className="w-4 h-4 text-blue-600" />
          <span>08 Active Experiment Protocol Definition</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          View active space experiment canonical workflow parameters and step structure.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider">
              CANONICAL EXPERIMENT
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">{CANONICAL_EXPERIMENT.title}</h3>
            <p className="text-xs text-gray-500 font-medium">{CANONICAL_EXPERIMENT.subtitle}</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded font-bold">
            {CANONICAL_EXPERIMENT.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded">
            <span className="text-[10px] text-gray-400 font-bold uppercase">EXPERIMENT ID</span>
            <p className="font-bold text-[#002244] mt-0.5">{CANONICAL_EXPERIMENT.id}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-gray-200 rounded">
            <span className="text-[10px] text-gray-400 font-bold uppercase">CATEGORY</span>
            <p className="font-bold text-[#002244] mt-0.5">{CANONICAL_EXPERIMENT.category}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-gray-200 rounded">
            <span className="text-[10px] text-gray-400 font-bold uppercase">TOTAL STEPS</span>
            <p className="font-bold text-[#002244] mt-0.5">{CANONICAL_EXPERIMENT.steps.length} Steps</p>
          </div>
          <div className="p-3 bg-slate-50 border border-gray-200 rounded">
            <span className="text-[10px] text-gray-400 font-bold uppercase">ESTIMATED DURATION</span>
            <p className="font-bold text-[#002244] mt-0.5">~45 mins</p>
          </div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs text-gray-700 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{CANONICAL_EXPERIMENT.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
