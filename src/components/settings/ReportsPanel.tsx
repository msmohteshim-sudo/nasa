// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Reports Configuration Panel (12 REPORTS)
// ─────────────────────────────────────────────────────────────────────────────

import { FileText } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const ReportsPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <FileText className="w-4 h-4 text-teal-600" />
          <span>12 Compliance Report & Export Settings</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Select included report sections, default file formats (JSON / CSV / PDF), and export parameters.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4 font-mono text-xs">
        <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-2">
          <label className="font-bold text-[#002244] block">Default Export Format</label>
          <select
            value={config.reports.defaultFormat}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                reports: { ...prev.reports, defaultFormat: e.target.value as any },
              }))
            }
            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
          >
            <option value="JSON">JSON (Machine-readable audit package)</option>
            <option value="CSV">CSV (Spreadsheet matrix table)</option>
            <option value="PDF">PDF (Formatted institutional report)</option>
          </select>
        </div>

        <span className="font-bold text-[#002244] uppercase tracking-wider block pt-2">
          INCLUDED REPORT SECTIONS
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'summary', label: 'Experiment Summary' },
            { key: 'timeline', label: 'Procedure Timeline' },
            { key: 'verification', label: 'Verification Events' },
            { key: 'deviations', label: 'Deviations & Out-of-Sequence' },
            { key: 'voice', label: 'Voice Guidance Log' },
            { key: 'camera', label: 'Camera & Vision Session' },
            { key: 'performance', label: 'Performance Metrics' },
          ].map((sec) => (
            <label key={sec.key} className="p-2.5 bg-slate-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer">
              <span className="text-[11px] font-semibold text-gray-800">{sec.label}</span>
              <input
                type="checkbox"
                checked={(config.reports.includedSections as any)[sec.key]}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    reports: {
                      ...prev.reports,
                      includedSections: {
                        ...prev.reports.includedSections,
                        [sec.key]: e.target.checked,
                      },
                    },
                  }))
                }
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
