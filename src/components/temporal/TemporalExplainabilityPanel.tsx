// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal HAR Explainability Panel ("Why this action?")
// Displays structured, honest evidence derived from real perception features
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { HelpCircle, CheckCircle2, XCircle, Info, ShieldCheck } from 'lucide-react';
import type { TemporalExplainability } from '@/types/temporalHAR';

interface TemporalExplainabilityPanelProps {
  explainability?: TemporalExplainability;
  action: string;
  isRealInference?: boolean;
}

export const TemporalExplainabilityPanel: React.FC<TemporalExplainabilityPanelProps> = ({
  explainability,
  action,
  isRealInference,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-bold text-[#002244] uppercase tracking-wide">
            EXPLAINABILITY: WHY {action.toUpperCase()}?
          </span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
          isRealInference
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : 'bg-slate-100 text-gray-600 border border-gray-200'
        }`}>
          {isRealInference ? 'PERCEPTUAL EVIDENCE' : 'SIMULATION MOCK'}
        </span>
      </div>

      {/* Summary */}
      {explainability?.summary && (
        <div className="p-2.5 bg-slate-50 border border-gray-200 rounded text-xs text-gray-800 font-sans leading-relaxed">
          {explainability.summary}
        </div>
      )}

      {/* Evidence checklist */}
      <div className="space-y-1.5 text-xs">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
          OBSERVED TEMPORAL EVIDENCE:
        </span>

        {explainability?.evidencePoints && explainability.evidencePoints.length > 0 ? (
          explainability.evidencePoints.map((ev) => (
            <div
              key={ev.id}
              className={`p-2 rounded border flex items-start justify-between gap-2 transition-colors ${
                ev.observed
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-gray-200 text-gray-500'
              }`}
            >
              <div className="flex items-start gap-2">
                {ev.observed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-xs text-gray-900">{ev.label}</p>
                  {ev.details && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{ev.details}</p>
                  )}
                </div>
              </div>

              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                ev.observed ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {ev.observed ? 'OBSERVED' : 'NOT DETECTED'}
              </span>
            </div>
          ))
        ) : (
          <div className="p-3 bg-slate-50 border border-gray-200 rounded text-center text-gray-400 text-xs italic">
            Evidence not available until window accumulation completes.
          </div>
        )}
      </div>

      {/* Confidence & Procedural Assessment */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
          <span>{explainability?.confidenceAssessment || 'Observing motion features'}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-[10px]">
          <Info className="w-3 h-3 text-gray-400" />
          <span>Evidence grounded in live vision pipeline</span>
        </div>
      </div>
    </div>
  );
};
