// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Vision AI & Overlay Settings Panel (03 VISION & DETECTION)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Eye, Zap, Sliders, Layers } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const VisionDetectionPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Eye className="w-4 h-4 text-blue-600" />
          <span>03 Vision AI & Detection Configuration</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Select vision mode, toggle perception sub-modules, set confidence thresholds, and configure live overlays.
        </p>
      </div>

      {/* Vision Mode Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>PRIMARY VISION MODE</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              mode: 'STANDARD' as const,
              title: 'STANDARD',
              desc: 'Prioritizes maximum execution speed and lower CPU/GPU usage.',
            },
            {
              mode: 'BALANCED' as const,
              title: 'BALANCED',
              desc: 'Optimal balance between real-time inference quality and smooth frame rate.',
            },
            {
              mode: 'MAXIMUM' as const,
              title: 'MAXIMUM',
              desc: 'Highest practical detection capability available on laptop hardware.',
            },
          ].map((item) => (
            <div
              key={item.mode}
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  vision: { ...prev.vision, visionMode: item.mode },
                }))
              }
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                config.vision.visionMode === item.mode
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-bold text-xs">
                <span className={config.vision.visionMode === item.mode ? 'text-[#002244]' : 'text-gray-700'}>
                  {item.title}
                </span>
                {config.vision.visionMode === item.mode && <span className="text-blue-600">● ACTIVE</span>}
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Submodule Toggles */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
          VISION PERCEPTION SUBSYSTEM TOGGLES
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {[
            { key: 'enablePersonDetection', label: 'Person Detection' },
            { key: 'enableObjectDetection', label: 'Object Detection' },
            { key: 'enablePoseEstimation', label: 'Pose Estimation' },
            { key: 'enableHandDetection', label: 'Hand Detection' },
            { key: 'enableTracking', label: 'Multi-Person / Object Tracking' },
            { key: 'enableMotionAnalysis', label: 'Motion & Velocity Analysis' },
            { key: 'enableActionRecognition', label: 'Temporal Action Recognition (HAR)' },
            { key: 'enableInteractionAnalysis', label: 'Human-Object Interaction' },
          ].map((sub) => (
            <div key={sub.key} className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
              <span className="font-semibold text-gray-800">{sub.label}</span>
              <input
                type="checkbox"
                checked={(config.vision as any)[sub.key]}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    vision: { ...prev.vision, [sub.key]: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Detection Confidence Threshold Sliders */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>INFERENCE CONFIDENCE THRESHOLDS</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
          {[
            { key: 'personConfidence', label: 'Person Detection Confidence', rec: '35% – 70%' },
            { key: 'objectConfidence', label: 'Object Detection Confidence', rec: '30% – 65%' },
            { key: 'poseConfidence', label: 'Pose Estimation Confidence', rec: '30% – 50%' },
            { key: 'handConfidence', label: 'Hand Detection Confidence', rec: '25% – 50%' },
            { key: 'actionConfidence', label: 'Action Recognition Threshold', rec: '60% – 85%' },
            { key: 'interactionConfidence', label: 'Interaction Confidence', rec: '50% – 80%' },
          ].map((item) => (
            <div key={item.key} className="space-y-1.5 p-3 bg-slate-50 border border-gray-200 rounded">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-gray-700">{item.label}</span>
                <span className="font-bold text-blue-700">{(config.thresholds as any)[item.key]}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={95}
                value={(config.thresholds as any)[item.key]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChange((prev) => ({
                    ...prev,
                    thresholds: { ...prev.thresholds, [item.key]: val },
                  }));
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] text-gray-500 font-sans">Rec: {item.rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Overlay Toggles */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>LIVE CAMERA OVERLAY GRAPHICS</span>
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {[
            { key: 'showPersonBoxes', label: 'Person Boxes' },
            { key: 'showObjectBoxes', label: 'Object Boxes' },
            { key: 'showPoseSkeleton', label: 'Pose Skeleton' },
            { key: 'showHands', label: 'Hand Regions' },
            { key: 'showFingerLandmarks', label: 'Finger Joint Dots' },
            { key: 'showTrackingIDs', label: 'Tracking IDs' },
            { key: 'showConfidenceLabels', label: 'Confidence Scores' },
            { key: 'showMotionVectors', label: 'Motion Vectors' },
            { key: 'showInteractionLines', label: 'Interaction Links' },
            { key: 'showROI', label: 'Workspace ROI' },
          ].map((ov) => (
            <label key={ov.key} className="p-2.5 bg-slate-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer hover:bg-slate-100">
              <span className="text-[11px] font-semibold text-gray-800">{ov.label}</span>
              <input
                type="checkbox"
                checked={(config.overlays as any)[ov.key]}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    overlays: { ...prev.overlays, [ov.key]: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
