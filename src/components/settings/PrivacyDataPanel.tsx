// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Privacy & Data Settings Panel (14 PRIVACY & DATA)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Lock, ShieldCheck, Trash2 } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const PrivacyDataPanel: React.FC<Props> = ({ config, onChange }) => {
  const handleClearSession = () => {
    if (confirm('Are you sure you want to clear all local session audit logs and stored recordings?')) {
      localStorage.removeItem('AltronSystemConfig');
      alert('Local session data cleared.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>14 Privacy Guarantees & Local Data Retention</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          ALTRON operates with strict local edge processing guarantees: zero facial recognition, zero identity tracking, zero cloud streaming.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded space-y-1">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% LOCAL INFERENCE
            </span>
            <p className="text-[11px] text-emerald-800 font-sans">Camera frames are processed entirely inside browser memory via WebGL/TensorFlow.js.</p>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded space-y-1">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              NO FACIAL RECOGNITION
            </span>
            <p className="text-[11px] text-emerald-800 font-sans">Human subjects are tracked anonymously as Person #1, Person #2 without biometric naming.</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
          <label className="font-bold text-[#002244] block">Data Retention Policy</label>
          <select
            value={config.privacy.dataRetention}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                privacy: { ...prev.privacy, dataRetention: e.target.value as any },
              }))
            }
            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
          >
            <option value="Session only">Session only (Wipe memory on page close)</option>
            <option value="Saved locally">Saved locally in browser localStorage</option>
          </select>
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
          <span className="text-gray-500">Manage Local Storage:</span>
          <button
            onClick={handleClearSession}
            className="px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-800 rounded font-bold hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR LOCAL SESSION DATA
          </button>
        </div>
      </div>
    </div>
  );
};
