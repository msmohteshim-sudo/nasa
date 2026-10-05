import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Volume2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import { useSession } from '@/context/SessionContext';
import { WorkstationSensorSuite } from '@/components/telemetry/WorkstationSensorSuite';

interface CameraFeedOption {
  id: string;
  channel: string;
  label: string;
  description: string;
  src: string;
  badge: string;
  telemetry: string;
  overlayHand: string;
  overlayFixture: string;
}

const CAMERA_FEEDS: CameraFeedOption[] = [
  {
    id: 'astronaut-experiment',
    channel: 'CAM 01',
    label: 'Microgravity Science Workstation',
    description: 'Astronaut performing biological & microgravity experiment inside space station',
    src: '/src/assets/astronaut_demo_original.mp4',
    badge: 'INTERNAL WORKSTATION',
    telemetry: 'Station Science Workstation • 1080p Stream',
    overlayHand: 'Hand → Experiment Module',
    overlayFixture: 'Workstation Fixture',
  },
];

export const DashboardPage: React.FC = () => {
  const { addLog } = useSystemStatus();
  const { session, simulateVerified, startSession, resetSession } = useSession();

  const [simulateDeviation, setSimulateDeviation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Multi-Sensor Overlays & HUD State
  const [sensorOverlayFilter, setSensorOverlayFilter] = useState<'ALL' | 'CORE' | 'OPTICAL' | 'ENVIRONMENT'>('ALL');
  const [showSensorsHUD, setShowSensorsHUD] = useState(true);
  const [liveMicroG, setLiveMicroG] = useState('0.0012g');
  const [liveTemp, setLiveTemp] = useState('37.1°C');
  const [livePressure, setLivePressure] = useState('101.3 kPa');
  const [liveProximity, setLiveProximity] = useState('18.4 cm');
  const [liveForce, setLiveForce] = useState('4.8 N');
  const [liveCrewHR, setLiveCrewHR] = useState('72 bpm');

  // Periodic sensor telemetry micro-fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveMicroG(`0.00${Math.floor(11 + Math.random() * 3)}g`);
      setLiveTemp(`${(37.0 + Math.random() * 0.2).toFixed(1)}°C`);
      setLivePressure(`101.${Math.floor(2 + Math.random() * 3)} kPa`);
      setLiveProximity(`${(18.2 + Math.random() * 0.4).toFixed(1)} cm`);
      setLiveForce(`${(4.7 + Math.random() * 0.2).toFixed(1)} N`);
      setLiveCrewHR(`${Math.floor(70 + Math.random() * 4)} bpm`);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const activeFeed = CAMERA_FEEDS[0];

  // Derive from global session state
  const steps = session.steps;
  const activeStepIdx = session.currentStepIndex;
  const completedSteps = steps
    .map((s, i) => (s.status === 'completed' ? i : -1))
    .filter((i) => i >= 0);
  const currentStep = steps[activeStepIdx] ?? steps[0];
  const nextStep = steps[activeStepIdx + 1] ?? null;

  // When session is idle, use canonical static data for initial display
  const isSessionIdle = session.status === 'idle';

  const handleVerifyCurrentStep = () => {
    simulateVerified();
    addLog(`Step ${currentStep.stepNumber} (${currentStep.title}) verified by AI engine.`, 'info', 'Experiment');
  };

  const handleStartIfIdle = () => {
    if (isSessionIdle) {
      resetSession();
      setTimeout(startSession, 100);
      addLog('Experiment session started from Dashboard.', 'info', 'System');
    }
  };

  // Voice directive trigger
  const handleTestVoice = () => {
    setIsSpeaking(true);
    const text = simulateDeviation
      ? "Warning. This action is out of sequence. Please complete the observation step before stowing the module."
      : `Step ${currentStep.stepNumber} active. ${currentStep.description}`;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 2500);
    }
    addLog('Voice guidance directive issued to crew headset.', 'info', 'System');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-900 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-8">

        {/* ════════════════════════════════════════════════════════════
           SECTION 01 — EXPERIMENT OVERVIEW
           ════════════════════════════════════════════════════════════ */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          {/* Scientific Disclaimer Note */}
          <div className="mb-4 p-2.5 bg-blue-50/60 border border-blue-200 rounded text-xs text-[#002244] flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {CANONICAL_EXPERIMENT.disclaimer}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                CURRENT EXPERIMENT
              </div>
              <h1 className="text-2xl font-bold text-[#002244] tracking-tight mt-1">
                {CANONICAL_EXPERIMENT.title}
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {CANONICAL_EXPERIMENT.subtitle} • {CANONICAL_EXPERIMENT.category}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                IN PROGRESS
              </span>
              <span className="text-xs text-gray-500 font-mono bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
                {CANONICAL_EXPERIMENT.status}
              </span>
            </div>
          </div>

          {/* Simple summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            <div className="p-4 bg-slate-50 border border-gray-200 rounded-md">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">PROGRESS</div>
              <div className="text-xl font-bold text-[#002244] mt-1 font-mono">
                {completedSteps.length} / {steps.length} steps verified
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#002244] h-full transition-all duration-500"
                  style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-md">
              <div className="text-[10px] font-bold text-[#002244] uppercase tracking-wider font-mono">CURRENT STEP</div>
              <div className="text-sm font-bold text-[#002244] mt-1">
                {currentStep.stepNumber} — {currentStep.title}
              </div>
              <p className="text-[11px] text-gray-600 mt-1 font-medium">
                {session.status === 'active' ? 'Active — AI monitoring in progress' : session.status === 'idle' ? 'Session not started' : `Session ${session.status}`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-gray-200 rounded-md">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">NEXT STEP</div>
              <div className="text-sm font-bold text-gray-700 mt-1">
                {nextStep ? `${nextStep.stepNumber} — ${nextStep.title}` : 'Protocol Complete'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">Awaiting action verification</p>
            </div>
          </div>

          {/* Quick start button when idle */}
          {isSessionIdle && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={handleStartIfIdle}
                className="px-4 py-2 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded font-mono transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                START EXPERIMENT SESSION
              </button>
              <span className="text-xs text-gray-500 font-mono">Or go to Monitor page for camera activation</span>
            </div>
          )}
        </section>


        {/* ════════════════════════════════════════════════════════════
           ROW 2: SECTION 02 (PROCEDURE PROGRESS) & SECTION 03 (AI OBSERVATION)
           ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SECTION 02 — PROCEDURE PROGRESS (7 Cols) */}
          <section className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                    Experiment Procedure
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    10-step procedural verification sequence
                  </p>
                </div>
                <button
                  onClick={handleVerifyCurrentStep}
                  className="px-3 py-1 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1 font-mono"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify Current Step</span>
                </button>
              </div>

              {/* Clean Vertical Sequence of 10 Steps */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {steps.map((step) => {
                  const isDone = step.status === 'completed';
                  const isActive = step.status === 'active';

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-md border flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                          : isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-gray-50/50 border-gray-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isActive
                              ? 'bg-[#002244] text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {isDone ? '✓' : step.stepNumber}
                        </span>
                        <div>
                          <div className={`text-xs font-bold ${isActive ? 'text-[#002244]' : 'text-gray-800'}`}>
                            {step.stepNumber} {step.title}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            Code: {step.code} {isDone && `• Verified at ${step.timestamp}`}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isActive
                            ? 'bg-blue-100 text-[#002244] border-blue-300'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {isDone ? 'COMPLETED' : isActive ? 'CURRENT' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>ALTRON Sequence Engine v2.4</span>
              <span>10 Total Protocol Steps</span>
            </div>
          </section>


          {/* SECTION 03 — CURRENT AI OBSERVATION (5 Cols) */}
          <section className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                  AI Observation & Vision
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Real-time human-object perception
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                session.cameraActive ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-gray-600 border-gray-200'
              }`}>
                {session.cameraActive ? '● REAL-TIME VISION' : 'IDLE OBSERVER'}
              </span>
            </div>

            {/* Detections List */}
            <div className="space-y-1.5 text-xs font-mono mb-4">
              {(session.lastObservation?.detections && session.lastObservation.detections.length > 0)
                ? session.lastObservation.detections.map((det, idx) => (
                    <div key={`${det.label}-${idx}`} className="flex items-center justify-between p-2 bg-slate-50 border border-gray-100 rounded">
                      <span className="flex items-center gap-2 text-gray-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        {det.label}
                      </span>
                      <span className="font-bold text-emerald-700">{Math.round(det.confidence * 100)}% score</span>
                    </div>
                  ))
                : CANONICAL_EXPERIMENT.objects.map((obj) => (
                    <div key={obj.label} className="flex items-center justify-between p-2 bg-slate-50 border border-gray-100 rounded">
                      <span className="flex items-center gap-2 text-gray-700">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: obj.color }} />
                        {obj.label}
                      </span>
                      <span className="font-bold text-emerald-700">{Math.round(obj.confidence * 100)}% score</span>
                    </div>
                  ))}
            </div>

            {/* Current Interaction & Recognized Action */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-md space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-gray-500">HUMAN-OBJECT INTERACTION:</span>
                <span className="font-bold text-[#002244]">
                  {session.lastObservation?.detections[0]?.interaction
                    ? `Hand → ${session.lastObservation.detections[0].interaction}`
                    : 'Right Hand → Experiment Module'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono pt-1 border-t border-blue-200/60">
                <span className="text-gray-500">RECOGNIZED ACTION:</span>
                <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                  {session.lastObservation?.dominantAction || currentStep.action}
                </span>
              </div>
            </div>
          </section>

        </div>


        {/* ════════════════════════════════════════════════════════════
           ROW 3: SECTION 04 (PROCEDURAL VERIFICATION) & SECTION 05 (NEXT STEP GUIDANCE)
           ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SECTION 04 — PROCEDURAL VERIFICATION (7 Cols) */}
          <section className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                Expected vs Observed
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Core AI procedural verification comparison
              </p>
            </div>

            {/* Expected vs Observed Flow Box */}
            <div className="bg-slate-50 border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                
                {/* Expected Box */}
                <div className="flex-1 bg-white p-3.5 rounded border border-gray-200 shadow-xs">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">EXPECTED ACTION (STEP {currentStep.stepNumber})</div>
                  <div className="text-sm font-bold text-[#002244] mt-1 font-mono">
                    {currentStep.expectedAction}
                  </div>
                </div>

                <div className="text-gray-400 font-mono text-xs">→</div>

                {/* Observed Box */}
                <div className={`flex-1 p-3.5 rounded border shadow-xs ${
                  simulateDeviation ? 'bg-rose-50 border-rose-300' : 'bg-white border-gray-200'
                }`}>
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">OBSERVED CREW ACTION</div>
                  <div className={`text-sm font-bold mt-1 font-mono ${
                    simulateDeviation ? 'text-rose-800' : 'text-[#002244]'
                  }`}>
                    {simulateDeviation ? 'Stow Experiment Module (Step 10)' : currentStep.action}
                  </div>
                </div>

              </div>

              {/* Verified Result Banner */}
              <div className={`w-full py-2.5 rounded-md font-mono font-bold text-xs flex items-center justify-center gap-2 border ${
                simulateDeviation
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {simulateDeviation ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>⚠ OUT OF SEQUENCE DEVIATION</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ VERIFIED MATCH</span>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-600 font-medium">
                {simulateDeviation
                  ? 'Procedure engine detected out-of-order execution: Step 07 (Position Imaging Unit) must be completed before Step 10 (Stow Module).'
                  : 'Procedure engine confirms that the observed human action matches the expected procedure step.'}
              </p>
            </div>
          </section>


          {/* SECTION 05 — NEXT STEP GUIDANCE (5 Cols) */}
          <section className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                  Next Required Action
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Automated operator instruction guidance
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-[#002244] font-mono">
                    {nextStep ? nextStep.stepNumber : '10'}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    WAITING FOR ACTION
                  </span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {nextStep ? nextStep.title : 'Procedure Complete'}
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  ALTRON will compare the next observed action with the expected procedure step.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/monitor"
                className="w-full py-2.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>OPEN LIVE MONITOR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

        </div>


        {/* ════════════════════════════════════════════════════════════
           ROW 4: SECTION 06 (LIVE CAMERA PREVIEW) & SECTION 07 (DEVIATION DETECTION)
           ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SECTION 06 — LIVE CAMERA PREVIEW WITH MULTI-SENSOR OVERLAYS (7 Cols) */}
          <section className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-3 mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                      Live Experiment View & Sensors
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-300 font-bold">
                      6 OVERLAYS ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {activeFeed.description}
                  </p>
                </div>
                
                {/* Sensor Filter Controls */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'CORE', 'OPTICAL', 'ENVIRONMENT'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSensorOverlayFilter(filter)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                        sensorOverlayFilter === filter
                          ? 'bg-[#002244] text-white shadow-xs'
                          : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'ALL' ? 'ALL SENSORS' : filter}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowSensorsHUD(!showSensorsHUD)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                      showSensorsHUD
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                        : 'bg-slate-50 text-gray-500 border-gray-300'
                    }`}
                    title="Toggle Live Sensor Telemetry HUD"
                  >
                    HUD: {showSensorsHUD ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Clean Camera Preview Box with Live Multi-Sensor Overlays */}
              <div className="relative bg-slate-900 aspect-16/9 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300 shadow-inner">
                <video
                  key={activeFeed.src}
                  src={activeFeed.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90"
                />

                {/* ── TOP SENSOR TELEMETRY HUD RIBBON ── */}
                {showSensorsHUD && (
                  <div className="absolute top-0 inset-x-0 bg-[#001428]/85 backdrop-blur-md px-3 py-1.5 border-b border-cyan-500/30 flex items-center justify-between text-[9px] font-mono text-slate-200 z-20 overflow-x-auto shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE SENSOR BUS:</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span title="Microgravity Accelerometer"><span className="text-gray-400">μ-g:</span> <strong className="text-sky-300">{liveMicroG}</strong></span>
                      <span title="Specimen Core Temperature"><span className="text-gray-400">Core:</span> <strong className="text-amber-300">{liveTemp}</strong></span>
                      <span title="Cabin Atmospheric Pressure"><span className="text-gray-400">Press:</span> <strong className="text-blue-300">{livePressure}</strong></span>
                      <span title="LiDAR Distance Sensor"><span className="text-gray-400">LiDAR:</span> <strong className="text-cyan-300">{liveProximity}</strong></span>
                      <span title="Tactile Clamping Load"><span className="text-gray-400">Force:</span> <strong className="text-emerald-300">{liveForce}</strong></span>
                      <span title="Cosmic Radiation Sensor"><span className="text-gray-400">Rad:</span> <strong className="text-pink-300">14.2 µSv/h</strong></span>
                      <span title="Astronaut Wrist Pulse"><span className="text-gray-400">Crew HR:</span> <strong className="text-rose-300">{liveCrewHR}</strong></span>
                    </div>
                  </div>
                )}

                {/* ── SENSOR OVERLAYS ON VIDEO ── */}

                {/* SENSOR 1: Hand → Experiment Module (Green Box) */}
                {(sensorOverlayFilter === 'ALL' || sensorOverlayFilter === 'CORE') && (
                  <div className="absolute top-[28%] left-[22%] w-[32%] h-[42%] border-2 border-emerald-400 rounded-xs bg-emerald-500/10 pointer-events-none transition-all z-10">
                    <span className="absolute -top-5 left-0 bg-emerald-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
                      {activeFeed.overlayHand}
                    </span>
                  </div>
                )}

                {/* SENSOR 2: Workstation Fixture (Blue Box) */}
                {(sensorOverlayFilter === 'ALL' || sensorOverlayFilter === 'CORE') && (
                  <div className="absolute top-[48%] right-[22%] w-[24%] h-[28%] border-2 border-blue-400 rounded-xs bg-blue-500/10 pointer-events-none transition-all z-10">
                    <span className="absolute -top-5 left-0 bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs">
                      {activeFeed.overlayFixture}
                    </span>
                  </div>
                )}

                {/* SENSOR 3: LiDAR Proximity & Depth Matrix (Cyan Box) */}
                {(sensorOverlayFilter === 'ALL' || sensorOverlayFilter === 'OPTICAL') && (
                  <div className="absolute top-[15%] left-[46%] w-[18%] h-[26%] border-2 border-dashed border-cyan-400 rounded-xs bg-cyan-500/10 pointer-events-none transition-all z-10">
                    <span className="absolute -top-5 left-0 bg-cyan-600 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-200" />
                      LiDAR: {liveProximity} · Depth: 0.62m
                    </span>
                    {/* Reticle Crosshair in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 border border-cyan-400/80 rounded-full" />
                    </div>
                  </div>
                )}

                {/* SENSOR 4: Thermal IR Specimen Chamber Sensor (Amber Box) */}
                {(sensorOverlayFilter === 'ALL' || sensorOverlayFilter === 'OPTICAL') && (
                  <div className="absolute top-[46%] left-[36%] w-[16%] h-[24%] border-2 border-amber-400 rounded-xs bg-amber-500/10 pointer-events-none transition-all z-10">
                    <span className="absolute -top-5 left-0 bg-amber-600 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-xs">
                      Thermal IR: {liveTemp} [Nominal]
                    </span>
                  </div>
                )}

                {/* SENSOR 5: Ventilation Airflow & Gas Sensor (Purple Box on Air Duct) */}
                {(sensorOverlayFilter === 'ALL' || sensorOverlayFilter === 'ENVIRONMENT') && (
                  <div className="absolute top-[18%] left-[56%] w-[11%] h-[46%] border-2 border-dashed border-purple-400 rounded-xs bg-purple-500/10 pointer-events-none transition-all z-10">
                    <span className="absolute -top-5 left-0 bg-purple-700 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                      Airflow: 0.18 m/s · O₂ 21.1%
                    </span>
                  </div>
                )}

                {/* SENSOR 6: Tactile Clamping Force & Latch Sensor (Emerald Box on Equipment Rack) */}
                {(sensorOverlayFilter === 'ALL' || sensorOverlayFilter === 'ENVIRONMENT') && (
                  <div className="absolute top-[14%] left-[65%] w-[18%] h-[32%] border-2 border-emerald-400 rounded-xs bg-emerald-500/10 pointer-events-none transition-all z-10">
                    <span className="absolute -top-5 left-0 bg-emerald-700 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-xs">
                      Tactile Latch: {liveForce} · LOCKED
                    </span>
                  </div>
                )}

                {/* SENSOR 7 & 8: Corner Badges (Micro-g & Radiation) */}
                {sensorOverlayFilter === 'ALL' && (
                  <>
                    <div className="absolute top-10 left-3 bg-sky-950/80 border border-sky-400/60 text-sky-200 text-[8.5px] font-mono px-2 py-0.5 rounded backdrop-blur-xs z-10">
                      MGU-01 Accel: {liveMicroG}
                    </div>
                    <div className="absolute top-10 right-3 bg-pink-950/80 border border-pink-400/60 text-pink-200 text-[8.5px] font-mono px-2 py-0.5 rounded backdrop-blur-xs z-10">
                      RAD-09 Dosimeter: 14.2 µSv/h
                    </div>
                  </>
                )}

                {/* Subtitle / Closed Caption from astronaut audio */}
                <div className="absolute bottom-11 left-4 max-w-[85%] text-white text-xs sm:text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded border border-white/10 z-10">
                  With the help of the astronauts on board.
                </div>

                {/* Bottom camera telemetry bar */}
                <div className="absolute bottom-2.5 left-4 right-4 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded text-[10px] font-mono text-white flex items-center justify-between z-20 border border-slate-700/60">
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-400">Action:</span>
                    <strong>{currentStep.action}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>VERIFIED</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 font-mono">
                {activeFeed.telemetry}
              </div>
              <Link
                to="/monitor"
                className="text-xs font-bold text-[#002244] hover:underline flex items-center gap-1 font-mono"
              >
                <span>OPEN LIVE MONITOR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>


          {/* SECTION 07 — DEVIATION DETECTION (5 Cols) */}
          <section className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                    Procedural Verification
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Anomaly & sequence deviation testing
                  </p>
                </div>
                <button
                  onClick={() => setSimulateDeviation(!simulateDeviation)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border transition-colors ${
                    simulateDeviation
                      ? 'bg-rose-600 text-white border-rose-700'
                      : 'bg-slate-100 text-[#002244] border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {simulateDeviation ? 'RESET DEMO' : 'SIMULATE DEVIATION'}
                </button>
              </div>

              {/* Status Display */}
              {simulateDeviation ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-md space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-rose-800 font-bold">
                    <span>DEMO DEVIATION ACTIVE</span>
                    <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded text-[10px]">
                      ⚠ OUT OF SEQUENCE
                    </span>
                  </div>

                  <div className="space-y-1.5 text-gray-700 border-t border-rose-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">EXPECTED STEP:</span>
                      <span className="font-bold">07 — Position Imaging Unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">OBSERVED ACTION:</span>
                      <span className="font-bold text-rose-700">Stow Experiment Module</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded border border-rose-200 text-rose-900 font-sans text-xs">
                    <strong>MESSAGE:</strong> Please complete the observation step before stowing the experiment module.
                  </div>

                  <div className="text-[11px] text-gray-600 italic">
                    VOICE CUE: "Warning. This action is out of sequence. Please complete the observation step."
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-md text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-emerald-900">
                    ✓ No deviation detected
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    All experiment actions match the required procedural order.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 font-mono mt-4">
              Click 'SIMULATE DEVIATION' above to test ALTRON's out-of-sequence detection engine.
            </p>
          </section>

        </div>


        {/* ════════════════════════════════════════════════════════════
           SECTION — WORKSTATION MULTI-SENSOR TELEMETRY SUITE
           ════════════════════════════════════════════════════════════ */}
        <WorkstationSensorSuite />


        {/* ════════════════════════════════════════════════════════════
           SECTION 08 — ALTRON AI PIPELINE
           ════════════════════════════════════════════════════════════ */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-3 mb-5">
            <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
              ALTRON AI Pipeline
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              End-to-end procedural intelligence flow architecture
            </p>
          </div>

          {/* Flow Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 text-center font-mono text-[10px]">
            {CANONICAL_EXPERIMENT.pipelineStages.map((item, idx) => (
              <div key={item.stage} className="p-2.5 bg-slate-50 border border-gray-200 rounded-md">
                <div className="text-[9px] text-gray-400 font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="font-bold text-[#002244] mt-0.5 leading-tight">{item.stage}</div>
                <div className="text-[8px] text-gray-500 font-sans mt-1 leading-tight">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>


        {/* ════════════════════════════════════════════════════════════
           ROW 5: SECTION 09 (VOICE GUIDANCE) & SECTION 10 (EXPERIMENT EVIDENCE)
           ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SECTION 09 — VOICE GUIDANCE (5 Cols) */}
          <section className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#002244]" /> Voice Guidance
                </h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                  ● Enabled
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-gray-200 rounded-md mb-4">
                <div className="text-[10px] font-mono text-gray-400 font-bold uppercase mb-1">CURRENT DIRECTIVE</div>
                <p className="text-xs text-gray-800 font-medium italic leading-relaxed">
                  "{simulateDeviation
                    ? 'Warning. This action is out of sequence. Please complete the observation step before stowing the module.'
                    : `Step ${currentStep.stepNumber} active. ${currentStep.description}`}"
                </p>
              </div>
            </div>

            <button
              onClick={handleTestVoice}
              disabled={isSpeaking}
              className="w-full py-2 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isSpeaking ? 'Speaking Speech Directive...' : 'TEST VOICE DIRECTIVE'}</span>
            </button>
          </section>


          {/* SECTION 10 — EXPERIMENT EVIDENCE (7 Cols) */}
          <section className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                  Experiment Evidence
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Latest verified procedural record logs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/reports"
                  className="px-2.5 py-1 bg-slate-100 hover:bg-gray-200 text-[#002244] text-[11px] font-bold rounded border border-gray-300 font-mono"
                >
                  VIEW FULL REPORT →
                </Link>
              </div>
            </div>

            {/* Evidence Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase">
                    <th className="py-2">STEP</th>
                    <th className="py-2">ACTION</th>
                    <th className="py-2">RESULT</th>
                    <th className="py-2 text-right">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {steps.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-gray-800">{s.stepNumber}</td>
                      <td className="py-2.5 text-gray-700">{s.title}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          s.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : s.status === 'active'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-500">{s.timestamp || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>


        {/* ════════════════════════════════════════════════════════════
           SECTION 11 — SYSTEM READINESS
           ════════════════════════════════════════════════════════════ */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#002244] uppercase tracking-wider font-mono">
              ALTRON SYSTEM STATUS
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              Processing: <strong className="text-gray-800">Local / Edge</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono text-xs">
            {[
              { label: 'Camera',           status: 'Ready' },
              { label: 'Vision Service',    status: 'Ready' },
              { label: 'Procedure Engine', status: 'Ready' },
              { label: 'Voice Guidance',   status: 'Ready' },
              { label: 'Audit Logger',     status: 'Ready' },
            ].map((sys) => (
              <div key={sys.label} className="p-3 bg-slate-50 border border-gray-200 rounded-md flex items-center justify-between">
                <span className="text-gray-700 font-sans text-xs">{sys.label}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;
