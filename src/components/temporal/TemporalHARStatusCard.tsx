// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal HAR Status Card
// Displays current recognized action, stability, model status, and measured metrics
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Activity, ShieldCheck, Users, Clock, CheckCircle, Cpu } from 'lucide-react';
import type { TemporalHARPrediction, TemporalHARMetrics } from '@/types/temporalHAR';

interface TemporalHARStatusCardProps {
  prediction?: TemporalHARPrediction | null;
  metrics?: TemporalHARMetrics | null;
  secondaryPersonPresent?: boolean;
}

export const TemporalHARStatusCard: React.FC<TemporalHARStatusCardProps> = ({
  prediction,
  metrics,
  secondaryPersonPresent,
}) => {
  const action = prediction?.action || 'OBSERVING_WORKSTATION';
  const stability = prediction?.stability || 'INSUFFICIENT_DATA';
  const status = prediction?.status || 'WAITING_FOR_OBSERVATIONS';
  const durationSec = prediction?.windowDurationSec || metrics?.windowDurationSec || 0;
  const frameCount = prediction?.frameCount || metrics?.currentWindowSize || 0;
  const confidenceDisplay = prediction?.confidenceDisplay || '—';
  const isReal = prediction?.isRealInference ?? false;

  const stabilityBadge =
    stability === 'STABLE' ? (
      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
        <CheckCircle className="w-3 h-3 text-emerald-700" />
        <span>STABLE</span>
      </span>
    ) : stability === 'CANDIDATE' ? (
      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded font-bold text-[10px] border border-cyan-300">
        CONFIRMING…
      </span>
    ) : stability === 'AMBIGUOUS' ? (
      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px] border border-purple-300">
        AMBIGUOUS
      </span>
    ) : stability === 'LOW_CONFIDENCE' ? (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] border border-amber-300">
        LOW CONFIDENCE
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-bold text-[10px] border border-gray-300">
        WARMING UP
      </span>
    );

  const modelBadge =
    status === 'MODEL_ACTIVE' ? (
      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold text-[10px] border border-emerald-300">
        MODEL ACTIVE
      </span>
    ) : status === 'DEMO_MODE' ? (
      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold text-[10px] border border-amber-300">
        DEMO MODE
      </span>
    ) : status === 'MODEL_UNAVAILABLE' ? (
      <span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded font-bold text-[10px] border border-rose-300">
        MODEL UNAVAILABLE
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-slate-100 text-gray-700 rounded font-bold text-[10px]">
        INITIALIZING
      </span>
    );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-bold text-[#002244] uppercase tracking-wide">
            TEMPORAL HUMAN ACTIVITY RECOGNITION (HAR)
          </span>
        </div>
        {modelBadge}
      </div>

      {/* Main Recognized Activity Hero Box */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-[#002244] rounded-lg text-white space-y-2 shadow-inner">
        <div className="flex justify-between items-center text-xs opacity-75">
          <span className="uppercase tracking-widest text-[10px]">CURRENT ACTION (OVER TIME):</span>
          <span className="text-[10px]">{prediction?.timestamp || '—'}</span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold tracking-tight text-cyan-300">
            {action}
          </span>
          {stabilityBadge}
        </div>

        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-gray-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Confidence:{' '}
              <strong className="text-white">
                {isReal && prediction && prediction.confidence !== null && prediction.confidence !== undefined
                  ? `${(prediction.confidence * 100).toFixed(0)}% (Measured)`
                  : confidenceDisplay}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Window:{' '}
              <strong className="text-white">
                {frameCount} frames (~{durationSec > 0 ? `${durationSec.toFixed(2)}s` : '2.0s'})
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Person Scene Notification (Section 37) */}
      {secondaryPersonPresent && (
        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold">MULTI-PERSON SCENE DETECTED:</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Temporal HAR pipeline is isolated to primary operator. Secondary person tracking active without observation crossover.
            </p>
          </div>
        </div>
      )}

      {/* Status Note / Honesty Callout */}
      <div className="p-2 bg-slate-50 border border-gray-200 rounded text-[11px] text-gray-600 flex items-start gap-2">
        <Cpu className="w-3.5 h-3.5 text-[#002244] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#002244]">PIPELINE ARCHITECTURE:</span>{' '}
          <span>{prediction?.statusNote || 'Sliding temporal sequence classifier with candidate stability debouncing.'}</span>
        </div>
      </div>
    </div>
  );
};
