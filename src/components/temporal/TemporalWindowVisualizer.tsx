// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Sliding Window Visualizer
// Visualizes sliding buffer frames, timestamp-derived duration, and FPS
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Sliders, Layers, Clock, Zap } from 'lucide-react';
import type { TemporalHARMetrics, TemporalWindowConfig } from '@/types/temporalHAR';

interface TemporalWindowVisualizerProps {
  metrics?: TemporalHARMetrics;
  config: TemporalWindowConfig;
  onUpdateConfig: (config: Partial<TemporalWindowConfig>) => void;
  status: string;
}

export const TemporalWindowVisualizer: React.FC<TemporalWindowVisualizerProps> = ({
  metrics,
  config,
  onUpdateConfig,
  status,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const currentCount = metrics?.currentWindowSize ?? 0;
  const targetSize = config.windowSize;
  const fillPct = Math.min(100, Math.round((currentCount / targetSize) * 100));
  const durationSec = metrics?.windowDurationSec ?? 0;
  const fps = metrics?.cameraFps ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-bold text-[#002244] uppercase tracking-wide">
            TEMPORAL SLIDING WINDOW
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-bold border border-slate-200">
              {status}
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
            metrics?.isBufferReady
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-amber-50 text-amber-800 border border-amber-300'
          }`}>
            {metrics?.isBufferReady ? '● WINDOW READY' : '○ ACCUMULATING'}
          </span>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-slate-100"
            title="Configure Window Size & Stride"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Window Stream */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-gray-600 font-semibold">
          <span>t - {targetSize} frames</span>
          <span className="text-cyan-800 font-bold">{currentCount} / {targetSize} frames ({fillPct}%)</span>
          <span>current (t)</span>
        </div>

        {/* Progress Bar with Window Ticks */}
        <div className="relative w-full h-5 bg-slate-100 rounded border border-gray-300 overflow-hidden flex items-center">
          <div
            className={`h-full transition-all duration-150 ${
              metrics?.isBufferReady
                ? 'bg-gradient-to-r from-cyan-600 to-blue-700'
                : 'bg-gradient-to-r from-amber-500 to-cyan-600'
            }`}
            style={{ width: `${fillPct}%` }}
          />

          {/* Tick marks */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30 text-[9px] text-black items-center">
            <span>|</span>
            <span>|</span>
            <span>|</span>
            <span>|</span>
            <span>|</span>
          </div>
        </div>
      </div>

      {/* Metric details derived from timestamps (Not hardcoded) */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 border border-gray-200 rounded">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">DURATION</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-cyan-700" />
            <span className="font-bold text-[#002244]">{durationSec > 0 ? `${durationSec.toFixed(2)}s` : '—'}</span>
          </div>
        </div>

        <div className="p-2 bg-slate-50 border border-gray-200 rounded">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">MEASURED FPS</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-emerald-700" />
            <span className="font-bold text-emerald-800">{fps > 0 ? `${fps.toFixed(1)}` : '—'}</span>
          </div>
        </div>

        <div className="p-2 bg-slate-50 border border-gray-200 rounded">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">STRIDE / RATE</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="font-bold text-gray-700">{config.stride} frames</span>
          </div>
        </div>
      </div>

      {/* Inline Configuration Drawer */}
      {showConfig && (
        <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Window Size (Frames):</span>
            <div className="flex gap-1">
              {[30, 60, 90].map((sz) => (
                <button
                  key={sz}
                  onClick={() => onUpdateConfig({ windowSize: sz })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    config.windowSize === sz
                      ? 'bg-[#002244] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {sz}f (~{(sz / 30).toFixed(1)}s)
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Inference Stride:</span>
            <div className="flex gap-1">
              {[2, 5, 10].map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateConfig({ stride: st })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    config.stride === st
                      ? 'bg-[#002244] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {st}f
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
