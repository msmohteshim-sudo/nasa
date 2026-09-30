// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Real-Time Vision & Space Activity Intelligence Monitoring Dashboard
// Features session video recording with AI perception overlays & PC export button,
// light-themed UI, multi-object tracking, pose estimation, spatial zones, procedure verification engine.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Activity,
  Info,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  AlertTriangle,
  Users,
  Zap,
  Cpu,
  Boxes,
  Compass,
  CheckCircle2,
  ListOrdered,
  Flame,
  RotateCcw,
  Video,
  Download,
  Disc,
} from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import { cameraService } from '@/services/vision/cameraService';
import { visionPipeline } from '@/services/vision/visionPipeline';
import { overlayRenderer } from '@/services/vision/overlayRenderer';
import { demoScenarioService, DEMO_SCENARIOS } from '@/services/mission/demoScenarioService';
import { eventLogService } from '@/services/mission/eventLog';
import { anomalyEngine } from '@/services/mission/anomalyEngine';
import { recordingService } from '@/services/vision/recordingService';
import type { VisionMode, MissionEvent } from '@/types/vision';

function padTwo(n: number) {
  return String(n).padStart(2, '0');
}
function formatElapsed(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${padTwo(m)}:${padTwo(s)}`;
}

export const MonitorPage: React.FC = () => {
  const {
    session,
    latestVisionResult,
    visionMode,
    setVisionMode,
    overlaySettings,
    setOverlaySettings,
    startSession,
    pauseSession,
    resumeSession,
    abortSession,
    simulateVerified,
    simulateWrong,
    simulateSkipped,
    resetSession,
    toggleVoice,
    setCameraActive,
  } = useSession();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ZONES' | 'ANOMALIES' | 'TELEMETRY'>('OVERVIEW');
  const [eventLogs, setEventLogs] = useState<MissionEvent[]>([]);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSec, setRecordingSec] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to Telemetry Event Log feed
  useEffect(() => {
    setEventLogs(eventLogService.getEvents());
    const unsubscribe = eventLogService.subscribe(() => {
      setEventLogs(eventLogService.getEvents());
    });
    return () => unsubscribe();
  }, []);

  // ── Session Video Recording Handlers ──────────────────────────────────────

  const handleStartRecording = () => {
    if (!canvasRef.current) return;
    const success = recordingService.startRecording(canvasRef.current);
    if (success) {
      setIsRecording(true);
      setRecordingSec(0);
      setRecordedBlob(null);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSec((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const blob = await recordingService.stopRecording();
    setIsRecording(false);
    if (blob) {
      setRecordedBlob(blob);
    }
  };

  const handleDownloadRecording = () => {
    recordingService.downloadRecording(recordedBlob);
  };

  // ── Camera & Vision Pipeline Control ──────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null);
    demoScenarioService.stopScenario();
    setSelectedDemoId('');
    try {
      if (!videoRef.current) return;
      const { capabilities } = await cameraService.startCamera(videoRef.current);
      setCameraActive(true);
      await visionPipeline.start(videoRef.current);
      console.log('[MonitorPage] Camera and Vision Pipeline started. Caps:', capabilities);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied';
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [setCameraActive]);

  const stopCamera = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    }
    visionPipeline.stop();
    cameraService.stopCamera();
    setCameraActive(false);
  }, [setCameraActive, isRecording]);

  const handleSelectDemo = (scenarioId: string) => {
    if (scenarioId === '') {
      demoScenarioService.stopScenario();
      setSelectedDemoId('');
    } else {
      stopCamera();
      setSelectedDemoId(scenarioId);
      demoScenarioService.startScenario(scenarioId);
      visionPipeline.start(document.createElement('video'));
    }
  };

  useEffect(() => {
    if (session.status === 'completed' || session.status === 'aborted') {
      stopCamera();
    }
  }, [session.status, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      demoScenarioService.stopScenario();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [stopCamera]);

  // ── Canvas Overlay Rendering ──────────────────────────────────────────────
  useEffect(() => {
    if (!latestVisionResult || !canvasRef.current) return;

    const canvas = canvasRef.current;
    if (canvas.width !== 640 || canvas.height !== 480) {
      canvas.width = 640;
      canvas.height = 480;
    }

    overlayRenderer.render(canvas, latestVisionResult, overlaySettings, videoRef.current);
  }, [latestVisionResult, overlaySettings]);

  // Derived Vision Variables
  const persons = latestVisionResult?.persons ?? [];
  const poses = latestVisionResult?.poses ?? [];
  const primaryPose = poses[0];
  const objects = latestVisionResult?.objects ?? [];
  const motions = latestVisionResult?.motions ?? [];
  const primaryMotion = motions[0];
  const interactions = latestVisionResult?.interactions ?? [];
  const actions = latestVisionResult?.actions ?? [];
  const primaryAction = actions[0];
  const perf = latestVisionResult?.performance;
  const cameraCaps = latestVisionResult?.camera;
  const activeTask = latestVisionResult?.activeTask;
  const anomalies = latestVisionResult?.anomalies ?? [];
  const zones = latestVisionResult?.zones ?? [];

  const activeStep = session.steps[session.currentStepIndex] ?? session.steps[0];
  const activeDemo = demoScenarioService.getActiveScenario();

  const lastOutcome = session.auditLog[0]?.outcome;
  const verifyBg =
    lastOutcome === 'VERIFIED'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : lastOutcome === 'WRONG_STEP'
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : lastOutcome === 'SKIPPED'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-slate-100 text-slate-600 border-gray-200';

  const verifyLabel =
    lastOutcome === 'VERIFIED'
      ? '✓ VERIFIED MATCH'
      : lastOutcome === 'WRONG_STEP'
      ? '⚠ OUT-OF-SEQUENCE DEVIATION'
      : lastOutcome === 'SKIPPED'
      ? '— STEP SKIPPED'
      : 'MONITORING…';

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-900 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-5">

        {/* ── Page Title Header ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#002244] uppercase tracking-widest">
                <Camera className="w-4 h-4 text-[#002244]" />
                <span>REAL-TIME HUMAN VISION MONITOR</span>
              </div>
              <h1 className="text-2xl font-bold text-[#002244] tracking-tight mt-1">
                {CANONICAL_EXPERIMENT.title}
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {CANONICAL_EXPERIMENT.subtitle} • {CANONICAL_EXPERIMENT.category}
              </p>
            </div>

            {/* Session chips */}
            <div className="flex items-center gap-2.5 font-mono text-xs flex-wrap">
              {session.status === 'idle' && (
                <span className="px-3 py-1 bg-slate-100 border border-gray-300 rounded font-bold text-gray-600">
                  SESSION IDLE
                </span>
              )}
              {session.status === 'active' && (
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-300 rounded font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  LIVE — {formatElapsed(session.elapsedSeconds)}
                </span>
              )}
              {session.status === 'paused' && (
                <span className="px-3 py-1 bg-amber-50 border border-amber-300 rounded font-bold text-amber-800">
                  PAUSED — {formatElapsed(session.elapsedSeconds)}
                </span>
              )}
              {session.status === 'completed' && (
                <span className="px-3 py-1 bg-blue-50 border border-blue-300 rounded font-bold text-[#002244]">
                  SESSION COMPLETE
                </span>
              )}
              {session.status === 'aborted' && (
                <span className="px-3 py-1 bg-rose-50 border border-rose-300 rounded font-bold text-rose-800">
                  SESSION ABORTED
                </span>
              )}
              <span className="px-2.5 py-1 bg-slate-100 border border-gray-200 rounded font-semibold text-gray-700">
                MAXIMUM PRACTICAL DETECTION
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-600 flex items-center justify-between font-medium flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{CANONICAL_EXPERIMENT.disclaimer}</span>
            </div>
            
            {/* Demo Scenario Selector Dropdown */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-bold text-gray-700">SIMULATION DEMO:</span>
              <select
                value={selectedDemoId}
                onChange={(e) => handleSelectDemo(e.target.value)}
                className="bg-slate-50 border border-gray-300 rounded px-2 py-0.5 text-xs font-mono font-semibold text-gray-800 focus:outline-none focus:border-blue-600"
              >
                <option value="">-- Live Camera Mode --</option>
                {DEMO_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    [{sc.category}] {sc.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── SESSION CONTROLS TOP BAR ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#002244] uppercase tracking-wide">
              <Activity className="w-4 h-4" />
              <span>SESSION CONTROLS</span>
            </div>

            {/* Vision Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-gray-200 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-600 ml-1" />
              <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">VISION MODE:</span>
              {(['STANDARD', 'BALANCED', 'MAXIMUM'] as VisionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisionMode(mode)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    visionMode === mode
                      ? 'bg-[#002244] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Session Video Recording Controls */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={!session.cameraActive && !activeDemo}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Disc className="w-3.5 h-3.5 text-rose-600" />
                  <span>RECORD SESSION</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors animate-pulse shadow-xs"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>STOP REC ({formatElapsed(recordingSec)})</span>
                </button>
              )}

              {/* Download / Save Recording to PC Button */}
              {recordedBlob && (
                <button
                  onClick={handleDownloadRecording}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>💾 SAVE SESSION TO PC (.webm)</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!session.cameraActive && !activeDemo ? (
              <button
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-[#002244] hover:bg-[#003366] text-white text-[11px] font-mono font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>ENABLE WEBCAM</span>
              </button>
            ) : session.cameraActive ? (
              <button
                onClick={stopCamera}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-mono font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>STOP WEBCAM</span>
              </button>
            ) : null}

            {activeDemo && (
              <button
                onClick={() => handleSelectDemo('')}
                className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-mono font-bold rounded flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>EXIT DEMO</span>
              </button>
            )}

            {session.status === 'idle' || session.status === 'completed' || session.status === 'aborted' ? (
              <button
                onClick={() => { resetSession(); setTimeout(startSession, 100); }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-mono font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>START SESSION</span>
              </button>
            ) : session.status === 'active' ? (
              <>
                <button
                  onClick={pauseSession}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-mono font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE</span>
                </button>
                <button
                  onClick={abortSession}
                  className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-mono font-bold rounded border border-rose-300 flex items-center gap-1.5 transition-colors"
                >
                  <Square className="w-3 h-3" />
                  <span>ABORT</span>
                </button>
              </>
            ) : session.status === 'paused' ? (
              <button
                onClick={resumeSession}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-mono font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>RESUME</span>
              </button>
            ) : null}

            <button
              onClick={toggleVoice}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded flex items-center gap-1.5 border transition-colors ${
                session.voiceEnabled
                  ? 'bg-blue-50 text-[#002244] border-blue-300'
                  : 'bg-gray-100 text-gray-500 border-gray-300'
              }`}
            >
              {session.voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{session.voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}</span>
            </button>
          </div>
        </div>

        {/* ── Main Monitor Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Camera Stream & Procedure Verification Engine */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Live Feed Container */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${session.cameraActive || activeDemo ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#002244]">
                    {activeDemo ? `SIMULATED DEMO: ${activeDemo.title}` : session.cameraActive ? 'LIVE LAPTOP WEBCAM FEED' : 'CAMERA OFFLINE'}
                  </h2>
                </div>

                {/* Overlay Toggle Checkboxes */}
                <div className="flex items-center gap-2.5 font-mono text-[10px] text-gray-700">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showPersonBoxes}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showPersonBoxes: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Boxes</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showPoseSkeleton}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showPoseSkeleton: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Pose</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showHands}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showHands: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Hands</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showObjects}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showObjects: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Objects</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showMotionVectors}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showMotionVectors: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Motion</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showInteractions}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showInteractions: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Links</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showZones}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showZones: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Zones</span>
                  </label>
                </div>
              </div>

              {/* Video & Canvas Container */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${session.cameraActive && !activeDemo ? 'block' : 'hidden'}`}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full pointer-events-none ${session.cameraActive || activeDemo ? 'block' : 'hidden'}`}
                />

                {/* Active Recording Overlay Badge */}
                {isRecording && (
                  <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 animate-pulse shadow-md z-20">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>REC {formatElapsed(recordingSec)}</span>
                  </div>
                )}

                {!session.cameraActive && !activeDemo && (
                  <div className="text-center p-6 space-y-3">
                    <CameraOff className="w-12 h-12 text-gray-600 mx-auto" />
                    <div>
                      <p className="font-mono text-sm font-bold text-gray-300">CAMERA NOT ACTIVE</p>
                      <p className="text-xs text-gray-500 mt-1">Click "ENABLE WEBCAM" above to start real-time computer vision.</p>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-x-4 bottom-4 bg-rose-950/90 border border-rose-500 p-3 rounded text-rose-200 text-xs font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Vision Engine Info Footer */}
              <div className="mt-3 bg-slate-50 border border-gray-200 rounded p-2.5 flex items-center justify-between font-mono text-[11px] text-gray-600 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span>MODEL: <strong className="text-[#002244]">TF.js COCO + MoveNet HAR</strong></span>
                  <span>RES: <strong className="text-gray-900">{cameraCaps ? `${cameraCaps.resolutionWidth}x${cameraCaps.resolutionHeight}` : '1280x720'}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span>CAM FPS: <strong className="text-emerald-700">{perf?.cameraFPS || 30}</strong></span>
                  <span>INF FPS: <strong className="text-blue-700">{perf?.inferenceFPS || 18}</strong></span>
                  <span>LATENCY: <strong className="text-rose-700">{perf?.latencyMs || 42} ms</strong></span>
                </div>
              </div>
            </div>

            {/* Procedure Verification Engine Box */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                  PROCEDURE VERIFICATION ENGINE
                </span>
                <span className="text-xs font-mono font-bold text-[#002244]">
                  STEP {padTwo(session.currentStepIndex + 1)} / {padTwo(session.steps.length)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded border border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">EXPECTED ACTION:</span>
                  <p className="font-bold text-[#002244] mt-0.5 truncate">{activeStep?.title}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">OBSERVED ACTION:</span>
                  <p className="font-bold text-emerald-800 mt-0.5 truncate">
                    {primaryAction ? `${primaryAction.action} (${primaryAction.confidence}%)` : session.lastObservation?.dominantAction || 'OBSERVING_WORKSTATION'}
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded border text-center font-mono text-xs font-bold ${verifyBg}`}>
                {verifyLabel}
              </div>

              {/* Simulation Manual Overrides */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono flex-wrap gap-2">
                <span className="text-gray-400 font-bold">MANUAL OVERRIDES:</span>
                <div className="flex items-center gap-2">
                  <button onClick={simulateVerified} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold hover:bg-emerald-100">
                    ✓ VERIFY STEP
                  </button>
                  <button onClick={simulateWrong} className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded font-bold hover:bg-rose-100">
                    ⚠ WRONG STEP
                  </button>
                  <button onClick={simulateSkipped} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded font-bold hover:bg-amber-100">
                    — SKIP
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Real-Time AI Perception Panels */}
          <div className="lg:col-span-5 space-y-4">

            {/* Dashboard Tab Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 text-xs font-mono">
              {[
                { id: 'OVERVIEW', label: 'PERCEPTION', icon: Activity },
                { id: 'ZONES', label: 'ZONES', icon: Compass },
                { id: 'ANOMALIES', label: `ALERTS (${anomalies.length})`, icon: AlertTriangle },
                { id: 'TELEMETRY', label: 'LOGS', icon: ListOrdered },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-1 px-2 rounded font-bold flex items-center justify-center gap-1 transition-all ${
                      isActive
                        ? 'bg-[#002244] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'OVERVIEW' && (
              <>
                {/* 1. PEOPLE DETECTION */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#002244] uppercase">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>PEOPLE ({persons.length})</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold">
                      {persons.length === 0 ? 'NO SUBJECTS' : persons.length === 1 ? 'SINGLE OPERATOR' : 'MULTI-SUBJECT'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs font-mono">
                    {persons.length === 0 ? (
                      <p className="text-gray-400 italic text-[11px] py-1">No persons currently detected in frame.</p>
                    ) : (
                      persons.map((p) => (
                        <div key={p.id} className="p-2.5 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#002244]">{p.id}</span>
                            {p.isPrimary && <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">PRIMARY</span>}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-700">{p.confidence}% score</span>
                            <p className="text-[10px] text-gray-500">Tracking: {p.trackingState}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. POSE ANALYSIS */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#002244] uppercase">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>POSE ANALYSIS</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      {primaryPose ? `${primaryPose.visibleCount} / ${primaryPose.totalLandmarks} VISIBLE` : '6 / 17 VISIBLE'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    {[
                      { label: 'HEAD / EYES', count: primaryPose?.regions.head.length || 1 },
                      { label: 'SHOULDERS', count: primaryPose?.regions.shoulders.length || 1 },
                      { label: 'ARMS / ELBOWS', count: primaryPose?.regions.arms.length || 0 },
                      { label: 'WRISTS / HANDS', count: primaryPose?.regions.hands.length || 0 },
                      { label: 'TORSO / HIPS', count: primaryPose?.regions.torso.length || 1 },
                      { label: 'LEGS / KNEES', count: primaryPose?.regions.legs.length || 0 },
                    ].map((item) => {
                      const isDetected = item.count > 0;
                      return (
                        <div key={item.label} className={`p-2 rounded border flex items-center justify-between transition-colors ${
                          isDetected ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-gray-200'
                        }`}>
                          <span className="text-[11px] text-gray-700 font-semibold">{item.label}</span>
                          <span className={`text-[10px] font-bold ${isDetected ? 'text-emerald-700' : 'text-gray-400'}`}>
                            {isDetected ? '✓ DETECTED' : '- NOT VISIBLE'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. DETECTED WORKSPACE OBJECTS */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#002244] uppercase">
                      <Boxes className="w-4 h-4 text-amber-600" />
                      <span>DETECTED WORKSPACE OBJECTS</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{objects.length} OBJECTS</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
                    {objects.map((obj) => (
                      <div key={obj.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-gray-200">
                        <span className="font-semibold text-gray-800">{obj.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: `${obj.confidence}%` }} />
                          </div>
                          <span className="font-bold text-amber-700">{obj.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interaction Links */}
                  {interactions.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 font-mono text-xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">HUMAN-OBJECT INTERACTION:</span>
                      <div className="mt-1 p-2 bg-purple-50 border border-purple-200 text-purple-900 rounded font-semibold flex items-center justify-between">
                        <span>{interactions[0].hand} HAND ↔ {interactions[0].objectLabel}</span>
                        <span className="font-bold text-purple-700">{interactions[0].interactionState || interactions[0].type} ({interactions[0].confidence}%)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. MOTION ANALYSIS BY BODY REGION */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#002244] uppercase">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span>MOTION MAGNITUDE BREAKDOWN</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-700">
                      OVERALL: {primaryMotion?.overallLevel || 'LOW_MOVEMENT'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                    {primaryMotion?.regions.map((reg) => (
                      <div key={reg.partName} className="p-2 bg-slate-50 border border-gray-200 rounded flex items-center justify-between">
                        <span className="text-[11px] text-gray-700">{reg.partName}</span>
                        <span className={`text-[10px] font-bold ${
                          reg.level === 'HIGH_MOVEMENT' ? 'text-rose-600' : reg.level === 'MODERATE_MOVEMENT' ? 'text-amber-600' : 'text-gray-500'
                        }`}>
                          {reg.level.replace('_MOVEMENT', '')} ({reg.magnitude}%)
                        </span>
                      </div>
                    )) || <p className="text-gray-400 italic text-[11px] col-span-2">No motion data calculated.</p>}
                  </div>
                </div>
              </>
            )}

            {/* TAB: SPATIAL ZONES */}
            {activeTab === 'ZONES' && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="font-bold text-[#002244] uppercase">SPATIAL ZONES ({zones.length})</span>
                  <span className="text-gray-500">{persons.length} SUBJECTS</span>
                </div>
                <div className="space-y-2">
                  {zones.map((z) => (
                    <div key={z.zoneId} className="p-3 bg-slate-50 border border-gray-200 rounded-lg space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-[#002244]">{z.zoneName}</span>
                        <span className={z.occupantCount > 0 ? 'text-emerald-700' : 'text-gray-400'}>
                          {z.occupantCount > 0 ? `OCCUPIED (${z.occupantCount})` : 'EMPTY'}
                        </span>
                      </div>
                      {z.personIds.length > 0 && <p className="text-emerald-800 text-[11px]">Crew: {z.personIds.join(', ')}</p>}
                      {z.objectIds.length > 0 && <p className="text-blue-800 text-[11px]">Objects: {z.objectIds.join(', ')}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ANOMALY ALERTS */}
            {activeTab === 'ANOMALIES' && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="font-bold text-rose-800 uppercase">ACTIVE ANOMALIES ({anomalies.length})</span>
                  {anomalies.length > 0 && (
                    <button onClick={() => anomalyEngine.clearAllAnomalies()} className="text-gray-500 hover:underline">
                      Clear All
                    </button>
                  )}
                </div>
                {anomalies.length === 0 ? (
                  <p className="text-gray-400 italic py-2 text-center">No active anomalies detected.</p>
                ) : (
                  anomalies.map((a) => (
                    <div key={a.id} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{a.title}</span>
                        <span>{a.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-rose-800">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: TELEMETRY LOGS */}
            {activeTab === 'TELEMETRY' && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="font-bold text-[#002244] uppercase">TELEMETRY EVENT STREAM</span>
                  <span className="text-gray-500">{eventLogs.length} EVENTS</span>
                </div>
                <div className="space-y-1.5 max-h-80 overflow-y-auto text-[11px]">
                  {eventLogs.map((e) => (
                    <div key={e.id} className="p-2 bg-slate-50 border border-gray-200 rounded flex gap-2">
                      <span className="text-gray-400">{e.timestamp}</span>
                      <span className="font-semibold text-gray-800">[{e.type}] {e.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISION ENGINE STATUS CARD */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#002244] uppercase">
                  <Cpu className="w-4 h-4 text-[#002244]" />
                  <span>VISION ENGINE STATUS</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">● RUNNING</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Camera:</span>
                  <span className="font-bold text-emerald-600">{session.cameraActive ? 'ACTIVE' : 'OFFLINE'}</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Person Detect:</span>
                  <span className="font-bold text-emerald-600">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Pose Estimator:</span>
                  <span className="font-bold text-emerald-600">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Hand Detector:</span>
                  <span className="font-bold text-emerald-600">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Object Detect:</span>
                  <span className="font-bold text-emerald-600">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Tracker (IoU):</span>
                  <span className="font-bold text-emerald-600">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Motion Velocity:</span>
                  <span className="font-bold text-emerald-600">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Session Recorder:</span>
                  <span className="font-bold text-emerald-600">{isRecording ? 'RECORDING...' : recordedBlob ? 'READY TO SAVE' : 'STANDBY'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
