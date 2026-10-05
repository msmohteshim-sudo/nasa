// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Scenario & Model Test Controls
// Interactive test harness for judges: Scenarios 1-5, Model Status toggles
// ─────────────────────────────────────────────────────────────────────────────

import { PlayCircle, AlertCircle, HelpCircle, Layers, ShieldAlert, Cpu } from 'lucide-react';
import { useSession } from '@/context/SessionContext';

export const TemporalScenarioControls: React.FC = () => {
  const {
    simulateVerified,
    simulateWrong,
    simulateSkipped,
    temporalMode,
    setTemporalMode,
    triggerModelUnavailableTest,
    triggerModelAnalyticalTest,
    triggerAmbiguousTest,
    triggerOutOfOrderTest,
  } = useSession();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-bold text-[#002244] uppercase tracking-wide">
            TEMPORAL HAR EVALUATION HARNESS
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-bold">
          SIH26174 VERIFICATION
        </span>
      </div>

      {/* Model Mode Selector (Demo vs Real vs Unavailable) */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
          MODEL ARCHITECTURE STATE:
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => setTemporalMode('DEMO')}
            className={`p-2 rounded border font-bold text-[11px] flex flex-col items-center justify-center transition-all ${
              temporalMode === 'DEMO'
                ? 'bg-[#002244] text-white border-[#002244] shadow-xs'
                : 'bg-slate-50 text-gray-700 border-gray-200 hover:bg-slate-100'
            }`}
          >
            <span>DEMO MODE</span>
            <span className="text-[9px] opacity-80 mt-0.5">Simulated Sequence</span>
          </button>

          <button
            onClick={() => {
              setTemporalMode('REAL');
              triggerModelAnalyticalTest();
            }}
            className={`p-2 rounded border font-bold text-[11px] flex flex-col items-center justify-center transition-all ${
              temporalMode === 'REAL'
                ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                : 'bg-slate-50 text-gray-700 border-gray-200 hover:bg-slate-100'
            }`}
          >
            <span>REAL ANALYTICAL</span>
            <span className="text-[9px] opacity-80 mt-0.5">MoveNet + Vectors</span>
          </button>

          <button
            onClick={triggerModelUnavailableTest}
            className="p-2 rounded border font-bold text-[11px] flex flex-col items-center justify-center bg-slate-50 text-rose-800 border-rose-200 hover:bg-rose-50"
          >
            <span>UNAVAILABLE</span>
            <span className="text-[9px] opacity-80 mt-0.5">Awaiting Weights</span>
          </button>
        </div>
      </div>

      {/* 5 Specific Test Scenarios as required by Section 34 */}
      <div className="space-y-1.5 pt-2 border-t border-gray-100">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
          PROMPT SCENARIO TESTS (SECTION 34):
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <button
            onClick={simulateVerified}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-bold flex items-center gap-1.5"
            title="Scenario 1: Expected action matched -> VERIFIED"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">1. Match (VERIFY)</span>
          </button>

          <button
            onClick={simulateWrong}
            className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 rounded font-bold flex items-center gap-1.5"
            title="Scenario 2: Deliberate wrong action -> DEVIATION"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
            <span className="truncate">2. Deviation</span>
          </button>

          <button
            onClick={simulateSkipped}
            className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-bold flex items-center gap-1.5"
            title="Scenario 3: Skipped action flagged in audit log"
          >
            <Layers className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">3. Skip Step</span>
          </button>

          <button
            onClick={triggerAmbiguousTest}
            className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 rounded font-bold flex items-center gap-1.5"
            title="Scenario 4: Ambiguous action -> Procedure does NOT advance"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            <span className="truncate">4. Ambiguity</span>
          </button>

          <button
            onClick={triggerOutOfOrderTest}
            className="p-2 bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-900 rounded font-bold flex items-center gap-1.5"
            title="Scenario 5: Future action detected out of order -> OUT_OF_ORDER"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-orange-700 shrink-0" />
            <span className="truncate">5. Out-of-Order</span>
          </button>

          <button
            onClick={simulateVerified}
            className="p-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-900 rounded font-bold flex items-center gap-1.5 col-span-2 md:col-span-1"
            title="Scenario 6: Candidate action stabilizes across windows -> STABLE VERIFIED"
          >
            <PlayCircle className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <span className="truncate">6. Stabilize</span>
          </button>
        </div>
      </div>
    </div>
  );
};
