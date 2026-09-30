// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Evidence Collection & Logging Settings Panel (11 EVIDENCE & LOGGING)
// ─────────────────────────────────────────────────────────────────────────────

import { Shield, Lock } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const EvidenceLoggingPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>11 Evidence Collection & Audit Logging</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure timestamped immutable event logging, verification audit trail detail, and local video evidence.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
          <div>
            <span className="font-bold text-[#002244] block">Record Timestamped Audit Events</span>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">Logs procedure step verification outcomes and observed actions.</p>
          </div>
          <input
            type="checkbox"
            checked={config.evidence.recordEvents}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                evidence: { ...prev.evidence, recordEvents: e.target.checked },
              }))
            }
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
          <label className="font-bold text-[#002244] block">Evidence Log Detail Level</label>
          <select
            value={config.evidence.detailLevel}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                evidence: { ...prev.evidence, detailLevel: e.target.value as any },
              }))
            }
            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono text-gray-900"
          >
            <option value="Minimal">Minimal (Step completion & deviations only)</option>
            <option value="Standard">Standard (Detections, actions, voice guidance)</option>
            <option value="Detailed">Detailed (Full frame-level observation packets)</option>
          </select>
        </div>

        <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
          <div>
            <span className="font-bold text-[#002244] block">Enable Local MediaRecorder Video Evidence</span>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">Records local video stream during active experiment sessions.</p>
          </div>
          <input
            type="checkbox"
            checked={config.evidence.videoRecordingEnabled}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                evidence: { ...prev.evidence, videoRecordingEnabled: e.target.checked },
              }))
            }
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-gray-700 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Video and log evidence remains 100% local on device memory unless explicitly exported by the operator.</span>
        </div>
      </div>
    </div>
  );
};
