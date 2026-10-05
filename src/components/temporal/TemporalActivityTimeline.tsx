// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Activity Timeline
// Dynamically logs recognized temporal action sequences, stability, and verification outcomes
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { GitCommit, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import type { TemporalTimelineEntry } from '@/types/temporalHAR';

interface TemporalActivityTimelineProps {
  timeline: TemporalTimelineEntry[];
  onClear?: () => void;
}

export const TemporalActivityTimeline: React.FC<TemporalActivityTimelineProps> = ({
  timeline,
  onClear,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-bold text-[#002244] uppercase tracking-wide">
            TEMPORAL ACTIVITY TIMELINE ({timeline.length})
          </span>
        </div>
        {timeline.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-[10px] text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Timeline</span>
          </button>
        )}
      </div>

      {timeline.length === 0 ? (
        <div className="py-6 text-center text-gray-400 text-xs italic">
          No temporal action events committed yet. Timeline will record dynamically as actions stabilize.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {timeline.map((entry) => {
            const isVerified = entry.procedureOutcome === 'VERIFIED';
            const isDeviation = entry.procedureOutcome === 'WRONG_STEP';
            const isOutOfOrder = entry.procedureOutcome === 'OUT_OF_ORDER';
            const isSkipped = entry.procedureOutcome === 'SKIPPED';
            const isAmbiguous = entry.procedureOutcome === 'AMBIGUOUS';

            const bgClass = isVerified
              ? 'bg-emerald-50/70 border-emerald-200'
              : isDeviation || isOutOfOrder
              ? 'bg-rose-50/70 border-rose-200'
              : isAmbiguous
              ? 'bg-purple-50/70 border-purple-200'
              : isSkipped
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-slate-50 border-gray-200';

            const outcomeBadge = isVerified ? (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>VERIFIED</span>
              </span>
            ) : isOutOfOrder ? (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>OUT-OF-ORDER</span>
              </span>
            ) : isDeviation ? (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>DEVIATION</span>
              </span>
            ) : isAmbiguous ? (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                AMBIGUOUS
              </span>
            ) : isSkipped ? (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                SKIPPED
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-bold text-[10px]">
                OBSERVING
              </span>
            );

            return (
              <div
                key={entry.id}
                className={`p-2.5 rounded-md border flex items-center justify-between text-xs transition-all ${bgClass}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{entry.timestamp}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#002244] tracking-wide text-xs">
                      {entry.action}
                    </span>
                    <span className="ml-2 text-[10px] text-gray-500 font-medium">
                      ({entry.windowFrames}f / {entry.windowDurationSec}s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-gray-600 font-bold">
                    {entry.confidenceDisplay}
                  </span>
                  {outcomeBadge}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
