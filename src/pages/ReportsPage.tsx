import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  FileSpreadsheet,
  Volume2,
  Info,
} from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import { useSession } from '@/context/SessionContext';


/* ── 10-Step Demo Evidence Data ── */
const EXPERIMENT_EVIDENCE = [
  { step: '01', action: 'Initialize workstation',          result: 'VERIFIED', time: '12:41:05', conf: '96%', expected: 'Initialize workstation',          observed: 'Initialize workstation' },
  { step: '02', action: 'Retrieve experiment module',      result: 'VERIFIED', time: '12:41:08', conf: '94%', expected: 'Retrieve experiment module',      observed: 'Retrieve experiment module' },
  { step: '03', action: 'Verify module identification',   result: 'VERIFIED', time: '12:41:11', conf: '98%', expected: 'Verify module identification',   observed: 'Verify module identification' },
  { step: '04', action: 'Secure module in fixture',        result: 'VERIFIED', time: '12:41:22', conf: '95%', expected: 'Secure module in fixture',        observed: 'Secure module in fixture' },
  { step: '05', action: 'Prepare observation chamber',     result: 'VERIFIED', time: '12:41:30', conf: '92%', expected: 'Prepare observation chamber',     observed: 'Prepare observation chamber' },
  { step: '06', action: 'Transfer sample module',          result: 'VERIFIED', time: '12:41:42', conf: '93%', expected: 'Transfer sample module',          observed: 'Transfer sample module' },
  { step: '07', action: 'Position imaging unit',           result: 'DEVIATION',time: '12:41:50', conf: '88%', expected: 'Position imaging unit',           observed: 'Stow Experiment Module' },
  { step: '08', action: 'Capture observation',             result: 'PENDING',  time: '—',        conf: '—',   expected: 'Capture observation',             observed: '—' },
  { step: '09', action: 'Record observation',              result: 'PENDING',  time: '—',        conf: '—',   expected: 'Record observation',              observed: '—' },
  { step: '10', action: 'Secure and stow module',          result: 'PENDING',  time: '—',        conf: '—',   expected: 'Secure and stow module',          observed: '—' },
];

const VOICE_LOG = [
  { time: '12:41:00', msg: '"Experiment initialized — Microgravity Biological Observation."', ok: true },
  { time: '12:41:05', msg: '"Step one verified. Please retrieve the biological experiment module."', ok: true },
  { time: '12:41:08', msg: '"Step two verified. Please verify module identification barcode."', ok: true },
  { time: '12:41:11', msg: '"Step three verified. Secure the experiment module in the workstation fixture."', ok: true },
  { time: '12:41:22', msg: '"Step four verified. Prepare the observation chamber."', ok: true },
  { time: '12:41:30', msg: '"Step five verified. Transfer sample module to observation position."', ok: true },
  { time: '12:41:42', msg: '"Step six verified. Position the imaging unit."', ok: true },
  { time: '12:41:50', msg: '"Warning. This action is out of sequence. Please complete the observation step before stowing the module."', ok: false },
];

export const ReportsPage: React.FC = () => {
  const { logs } = useSystemStatus();
  const { session, temporalTimeline } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'evidence' | 'temporal' | 'audit' | 'voice'>('evidence');

  // Build evidence rows from session steps (real data) or fallback to static
  const evidenceRows = session.steps.map((s) => ({
    step: s.stepNumber,
    action: s.title,
    result: s.status === 'completed' ? 'VERIFIED' : s.status === 'wrong' ? 'DEVIATION' : s.status === 'skipped' ? 'SKIPPED' : 'PENDING',
    time: s.timestamp ?? '—',
    conf: s.confidence > 0 ? `${s.confidence}%` : '—',
    expected: s.expectedAction,
    observed: s.observedAction,
  }));



  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === 'all' ? true : log.level === levelFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Step', 'Action', 'Result', 'Timestamp', 'Confidence', 'Expected', 'Observed'];
    const rows = evidenceRows.map((e) => [
      e.step,
      `"${e.action}"`,
      e.result,
      e.time,
      e.conf,
      `"${e.expected}"`,
      `"${e.observed}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `altron_experiment_evidence_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const report = {
      system: 'ALTRON — AI Procedural Intelligence',
      sessionId: session.sessionId || 'demo',
      experiment: CANONICAL_EXPERIMENT.title,
      subtitle: CANONICAL_EXPERIMENT.subtitle,
      category: CANONICAL_EXPERIMENT.category,
      prototypeType: CANONICAL_EXPERIMENT.prototypeType,
      disclaimer: CANONICAL_EXPERIMENT.disclaimer,
      exportTime: new Date().toISOString(),
      sessionStatus: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      elapsedSeconds: session.elapsedSeconds,
      evidence: evidenceRows,
      auditLog: session.auditLog,
      voiceLog: VOICE_LOG,
      temporalHARActivity: temporalTimeline,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altron_experiment_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-900 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">

        {/* Page Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          {/* Scientific Disclaimer Note */}
          <div className="mb-4 p-2.5 bg-blue-50/60 border border-blue-200 rounded text-xs text-[#002244] flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{CANONICAL_EXPERIMENT.disclaimer}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                <FileText className="w-4 h-4 text-[#002244]" />
                <span>EXPERIMENT VERIFICATION REPORT</span>
              </div>
              <h1 className="text-2xl font-bold text-[#002244] tracking-tight mt-1">
                {CANONICAL_EXPERIMENT.title}
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {CANONICAL_EXPERIMENT.subtitle} • {CANONICAL_EXPERIMENT.category}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-gray-200 text-[#002244] text-xs font-bold rounded border border-gray-300 font-mono transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> EXPORT CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded shadow-xs font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> EXPORT REPORT JSON
              </button>
            </div>
          </div>

          {/* Report Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Run Status</span>
              <span className="font-bold text-emerald-800 mt-0.5 block">{session.status.toUpperCase()}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] uppercase font-bold block font-mono">Total Steps</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{session.steps.length} Steps</span>
            </div>
            <div className="p-3 bg-slate-50 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] uppercase font-bold block font-mono">Verified Steps</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">
                {session.steps.filter((s) => s.status === 'completed').length} Verified
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] uppercase font-bold block font-mono">Deviations</span>
              <span className="font-bold text-amber-700 mt-0.5 block">
                {session.steps.filter((s) => s.status === 'wrong').length} Detected
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] uppercase font-bold block font-mono">Temporal Events</span>
              <span className="font-bold text-cyan-800 mt-0.5 block">{temporalTimeline.length} Captured</span>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
          
          {/* Tab Bar */}
          <div className="px-6 pt-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 text-xs font-bold rounded-t-md border-t border-x transition-all ${
                activeTab === 'evidence'
                  ? 'bg-white text-[#002244] border-gray-200 border-b-transparent shadow-xs'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Step Evidence Log ({evidenceRows.length})
            </button>
            <button
              onClick={() => setActiveTab('temporal')}
              className={`px-4 py-2 text-xs font-bold rounded-t-md border-t border-x transition-all ${
                activeTab === 'temporal'
                  ? 'bg-white text-[#002244] border-gray-200 border-b-transparent shadow-xs'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Temporal HAR Timeline ({temporalTimeline.length})
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-4 py-2 text-xs font-bold rounded-t-md border-t border-x transition-all ${
                activeTab === 'voice'
                  ? 'bg-white text-[#002244] border-gray-200 border-b-transparent shadow-xs'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Voice Directives ({VOICE_LOG.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 text-xs font-bold rounded-t-md border-t border-x transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-[#002244] border-gray-200 border-b-transparent shadow-xs'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              System Audit Stream ({session.auditLog.length > 0 ? session.auditLog.length : filteredLogs.length})
            </button>
          </div>


          <div className="p-6">
            
            {/* Tab 1: Step Evidence */}
            {activeTab === 'evidence' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider font-mono">
                    Step-by-Step Verification Evidence Table
                  </h3>
                  <span className="text-[10px] bg-slate-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-gray-600">
                    SIMULATED PROTOTYPE RUN
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase">
                        <th className="py-2.5">STEP</th>
                        <th className="py-2.5">PROCEDURE ACTION</th>
                        <th className="py-2.5">EXPECTED VS OBSERVED</th>
                        <th className="py-2.5">RESULT</th>
                        <th className="py-2.5">CONFIDENCE</th>
                        <th className="py-2.5 text-right">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {EXPERIMENT_EVIDENCE.map((item) => (
                        <tr key={item.step} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 font-bold text-gray-800">{item.step}</td>
                          <td className="py-3 font-semibold text-[#002244]">{item.action}</td>
                          <td className="py-3 text-gray-600">
                            {item.expected === item.observed ? (
                              <span>Expected: {item.expected}</span>
                            ) : (
                              <span className="text-rose-700 font-bold">
                                Expected: {item.expected} → Observed: {item.observed}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                item.result === 'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : item.result === 'DEVIATION'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                            >
                              {item.result}
                            </span>
                          </td>
                          <td className="py-3 text-gray-700">{item.conf}</td>
                          <td className="py-3 text-right text-gray-400">{item.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Temporal HAR Timeline */}
            {activeTab === 'temporal' && (
              <div>
                <div className="flex items-center justify-between mb-4 font-mono">
                  <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider">
                    Temporal Human Activity Recognition (HAR) Sequence Log
                  </h3>
                  <span className="text-[10px] bg-cyan-50 border border-cyan-200 text-cyan-800 px-2 py-0.5 rounded font-bold">
                    SLIDING WINDOW LOG ({temporalTimeline.length} EVENTS)
                  </span>
                </div>

                {temporalTimeline.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-mono text-xs italic bg-slate-50 rounded border border-gray-200">
                    No temporal activity events logged in this session yet. Start an experiment session or test a scenario in Live Monitor.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase">
                          <th className="py-2.5">TIMESTAMP</th>
                          <th className="py-2.5">TEMPORAL ACTION</th>
                          <th className="py-2.5">WINDOW / DURATION</th>
                          <th className="py-2.5">CONFIDENCE</th>
                          <th className="py-2.5">STABILITY</th>
                          <th className="py-2.5">EXPECTED ACTION</th>
                          <th className="py-2.5 text-right">PROCEDURAL OUTCOME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {temporalTimeline.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 text-gray-500">{item.timestamp}</td>
                            <td className="py-3 font-bold text-[#002244]">{item.action}</td>
                            <td className="py-3 text-gray-600">
                              {item.windowFrames} frames ({item.windowDurationSec.toFixed(2)}s)
                            </td>
                            <td className="py-3 text-gray-700">{item.confidenceDisplay}</td>
                            <td className="py-3">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                item.stability === 'STABLE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.stability === 'AMBIGUOUS'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-gray-700'
                              }`}>
                                {item.stability}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600">{item.expectedAction || '—'}</td>
                            <td className="py-3 text-right">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  item.procedureOutcome === 'VERIFIED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : item.procedureOutcome === 'WRONG_STEP' || item.procedureOutcome === 'OUT_OF_ORDER'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : item.procedureOutcome === 'AMBIGUOUS'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                              >
                                {item.procedureOutcome}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Voice Directives */}
            {activeTab === 'voice' && (

              <div>
                <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider font-mono mb-4">
                  Voice Guidance Log
                </h3>

                <div className="space-y-2.5 font-mono text-xs">
                  {VOICE_LOG.map((v, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border flex items-center justify-between ${
                        v.ok ? 'bg-slate-50 border-gray-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className={`w-4 h-4 ${v.ok ? 'text-blue-600' : 'text-rose-600'}`} />
                        <span className="italic">{v.msg}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{v.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: System Audit Stream */}
            {activeTab === 'audit' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search audit logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-300 rounded pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none"
                    />
                  </div>

                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs font-mono text-gray-700 outline-none"
                  >
                    <option value="all">ALL LEVELS</option>
                    <option value="info">INFO</option>
                    <option value="warning">WARNING</option>
                    <option value="critical">CRITICAL</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase">
                        <th className="py-2.5">TIMESTAMP</th>
                        <th className="py-2.5">LEVEL</th>
                        <th className="py-2.5">CATEGORY</th>
                        <th className="py-2.5">MESSAGE</th>
                        <th className="py-2.5 text-right">SESSION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 text-gray-400">{log.timestamp}</td>
                          <td className="py-2.5">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                log.level === 'critical'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : log.level === 'warning'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {log.level}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-700 font-semibold">{log.category}</td>
                          <td className="py-2.5 text-gray-800">{log.message}</td>
                          <td className="py-2.5 text-right text-gray-400">{log.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
