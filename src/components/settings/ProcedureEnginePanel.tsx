// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Procedure Engine Settings Panel (07 PROCEDURE ENGINE)
// ─────────────────────────────────────────────────────────────────────────────

import { Cpu, Shield } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const ProcedureEnginePanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Cpu className="w-4 h-4 text-[#002244]" />
          <span>07 Procedure Engine & Verification Logic</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure rule-based verification, strict sequence enforcement, out-of-sequence handling, and step timeouts.
        </p>
      </div>

      {/* Primary Toggles */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
          <div>
            <span className="font-bold text-[#002244] block">Enable Automatic Procedure Verification</span>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">Validates observed actions against expected experiment steps.</p>
          </div>
          <input
            type="checkbox"
            checked={config.procedure.verificationEnabled}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                procedure: { ...prev.procedure, verificationEnabled: e.target.checked },
              }))
            }
            className="w-4 h-4 accent-[#002244] rounded cursor-pointer"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
          <div>
            <span className="font-bold text-[#002244] block">Strict Sequence Enforcement (Recommended: ON)</span>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">Rejects out-of-order action execution during space experiment protocols.</p>
          </div>
          <input
            type="checkbox"
            checked={config.procedure.strictSequence}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                procedure: { ...prev.procedure, strictSequence: e.target.checked },
              }))
            }
            className="w-4 h-4 accent-[#002244] rounded cursor-pointer"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
          <div>
            <span className="font-bold text-[#002244] block">Allow Operator Step Skipping (Default: OFF)</span>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">Permits manual skipping of required experiment steps.</p>
          </div>
          <input
            type="checkbox"
            checked={config.procedure.allowStepSkipping}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                procedure: { ...prev.procedure, allowStepSkipping: e.target.checked },
              }))
            }
            className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Handling Rules */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-600" />
          <span>DEVIATION & OUT-OF-SEQUENCE HANDLING</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
            <label className="font-bold text-gray-800 block">Out-of-Sequence Action Handling</label>
            <select
              value={config.procedure.outOfSequenceHandling}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  procedure: { ...prev.procedure, outOfSequenceHandling: e.target.value as any },
                }))
              }
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            >
              <option value="Warning">Warning Only (Log & Notify)</option>
              <option value="Block">Block Step Advance</option>
              <option value="Voice warning + block">Voice Warning + Block (Recommended)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
            <label className="font-bold text-gray-800 block">Step Verification Confirmation</label>
            <select
              value={config.procedure.stepConfirmation}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  procedure: { ...prev.procedure, stepConfirmation: e.target.value as any },
                }))
              }
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            >
              <option value="Automatic">Automatic (AI Verification)</option>
              <option value="Manual">Manual Operator Confirmation Required</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
