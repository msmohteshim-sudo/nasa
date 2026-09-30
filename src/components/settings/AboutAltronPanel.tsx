// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — About ALTRON Panel (17 ABOUT ALTRON)
// ─────────────────────────────────────────────────────────────────────────────

import { Info, ShieldAlert } from 'lucide-react';

export const AboutAltronPanel: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Info className="w-4 h-4 text-blue-600" />
          <span>17 About ALTRON & Research Project Context</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          AI Procedural Intelligence for Space Experiments.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">PROJECT IDENTITY</span>
          <h1 className="text-xl font-bold text-[#002244] mt-0.5">ALTRON</h1>
          <p className="text-xs text-gray-600 font-medium">AI Human Activity Recognition for On-board BAS Experiments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs pt-2">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded">
            <span className="text-[10px] text-gray-400 font-bold uppercase">SYSTEM TYPE</span>
            <p className="font-bold text-[#002244] mt-0.5">Research Prototype</p>
          </div>
          <div className="p-3 bg-slate-50 border border-gray-200 rounded">
            <span className="text-[10px] text-gray-400 font-bold uppercase">VERSION</span>
            <p className="font-bold text-[#002244] mt-0.5">v2.4-PROTOTYPE</p>
          </div>
          <div className="p-3 bg-slate-50 border border-gray-200 rounded">
            <span className="text-[10px] text-gray-400 font-bold uppercase">DOMAIN</span>
            <p className="font-bold text-[#002244] mt-0.5">Space Technology / Computer Vision</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-gray-200 rounded text-xs text-gray-700 leading-relaxed font-sans space-y-2">
          <span className="font-bold text-[#002244] block font-mono text-xs uppercase">Platform Purpose</span>
          <p>
            ALTRON is an AI-powered computer vision and procedural intelligence system designed to observe, verify, and document structured scientific microgravity experiments performed aboard space biology modules. By combining real-time pose estimation, hand-object interaction analysis, and rule-based verification, ALTRON reduces astronaut cognitive load and ensures procedure compliance.
          </p>
        </div>

        {/* Institutional Non-Affiliation Disclaimer */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded text-xs text-[#002244] space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-blue-900">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>INSTITUTIONAL STATEMENT & DISCLAIMER</span>
          </div>
          <p className="text-[11px] leading-relaxed font-medium text-gray-700">
            ALTRON is a prototype developed for demonstration, research, and technical evaluation purposes. The visual design and information architecture draw inspiration from modern institutional aerospace organizations. ALTRON is not an official ISRO software system, does not claim official ISRO affiliation or trademark endorsement, and does not represent certified spaceflight software.
          </p>
        </div>
      </div>
    </div>
  );
};
