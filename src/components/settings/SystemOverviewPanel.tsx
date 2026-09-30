// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — System Overview & Status Settings Panel (01 SYSTEM OVERVIEW)
// ─────────────────────────────────────────────────────────────────────────────

import {
  Activity,
  Camera,
  Cpu,
  Eye,
  Volume2,
  Shield,
  FileText,
  Boxes,
  Zap,
} from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  cameraActive: boolean;
}

export const SystemOverviewPanel: React.FC<Props> = ({ config, cameraActive }) => {
  return (
    <div className="space-y-6 font-sans">
      {/* ── Section Header ── */}
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>01 System Status & Configuration Overview</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure ALTRON vision, experiment execution, procedural verification, voice guidance, evidence collection and system behavior.
        </p>
      </div>

      {/* ── System Status Indicators ── */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
            REAL-TIME SYSTEM SUBSYSTEM STATUS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold">
            ● OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              Camera
            </span>
            <span className={`font-bold ${cameraActive ? 'text-emerald-600' : 'text-amber-600'}`}>
              {cameraActive ? '● Active' : '● Ready'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              Vision Engine
            </span>
            <span className="font-bold text-emerald-600">● Ready</span>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              Pose Engine
            </span>
            <span className="font-bold text-emerald-600">● Ready</span>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Boxes className="w-3.5 h-3.5 text-amber-600" />
              Object Detect
            </span>
            <span className="font-bold text-emerald-600">● Ready</span>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Procedure Engine
            </span>
            <span className="font-bold text-emerald-600">● Ready</span>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              Voice
            </span>
            <span className={`font-bold ${config.voice.enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
              {config.voice.enabled ? '● Ready' : '— Disabled'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              Evidence Log
            </span>
            <span className="font-bold text-emerald-600">● Ready</span>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-700">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Report Engine
            </span>
            <span className="font-bold text-emerald-600">● Ready</span>
          </div>
        </div>
      </div>

      {/* ── Quick Configuration Summary Card ── */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider">
            ACTIVE CONFIGURATION SUMMARY
          </span>
          <span className="text-xs font-mono text-gray-500">CANONICAL STATE</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {[
            { label: 'Camera Resolution', value: config.camera.resolution },
            { label: 'Target FPS', value: `${config.camera.targetFPS} FPS` },
            { label: 'Vision Mode', value: config.vision.visionMode },
            { label: 'Person Detection', value: config.vision.enablePersonDetection ? 'Enabled' : 'Disabled' },
            { label: 'Pose Estimation', value: config.vision.enablePoseEstimation ? 'Enabled' : 'Disabled' },
            { label: 'Hand Tracking', value: config.vision.enableHandDetection ? 'Enabled' : 'Disabled' },
            { label: 'Object Detection', value: config.vision.enableObjectDetection ? 'Enabled' : 'Disabled' },
            { label: 'Multi-Person Tracking', value: config.vision.enableTracking ? 'Enabled' : 'Disabled' },
            { label: 'Motion Analysis', value: config.vision.enableMotionAnalysis ? 'Enabled' : 'Disabled' },
            { label: 'Voice Guidance', value: config.voice.enabled ? 'Enabled' : 'Disabled' },
            { label: 'Evidence Logging', value: config.evidence.recordEvents ? 'Enabled' : 'Disabled' },
            { label: 'Procedure Verification', value: config.procedure.verificationEnabled ? 'Enabled' : 'Disabled' },
          ].map((item) => (
            <div key={item.label} className="p-2.5 bg-slate-50 border border-gray-200 rounded flex justify-between items-center">
              <span className="text-gray-600 text-[11px] font-medium">{item.label}:</span>
              <strong className="text-[#002244] text-xs">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
