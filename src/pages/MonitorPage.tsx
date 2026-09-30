// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Control Vision & Activity Intelligence Dashboard
// Features real-time TF.js multi-object perception, spatial zone reasoning,
// hand-object interaction state machine, mission procedure verification,
// microgravity anomaly detection, telemetry event feeds, and 7 demo simulation scenarios.
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
  Radio,
  XCircle,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import { cameraService } from '@/services/vision/cameraService';
import { visionPipeline } from '@/services/vision/visionPipeline';
import { overlayRenderer } from '@/services/vision/overlayRenderer';
import { demoScenarioService, DEMO_SCENARIOS } from '@/services/mission/demoScenarioService';
import { eventLogService } from '@/services/mission/eventLog';
import { anomalyEngine } from '@/services/mission/anomalyEngine';
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
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'TASKS' | 'ANOMALIES' | 'ZONES'>('TASKS');
  const [eventLogs, setEventLogs] = useState<MissionEvent[]>([]);
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');

  // Subscribe to Event Log feed
  useEffect(() => {
    setEventLogs(eventLogService.getEvents());
    const unsubscribe = eventLogService.subscribe(() => {
      setEventLogs(eventLogService.getEvents());
    });
    return () => unsubscribe();
  }, []);

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
    visionPipeline.stop();
    cameraService.stopCamera();
    setCameraActive(false);
  }, [setCameraActive]);

  const handleSelectDemo = (scenarioId: string) => {
    if (scenarioId === '') {
      demoScenarioService.stopScenario();
      setSelectedDemoId('');
    } else {
      stopCamera();
      setSelectedDemoId(scenarioId);
      demoScenarioService.startScenario(scenarioId);
      if (!session.cameraActive) {
        // Start pipeline loop without video element requirement for demo
        visionPipeline.start(document.createElement('video'));
      }
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

    overlayRenderer.render(canvas, latestVisionResult, overlaySettings);
  }, [latestVisionResult, overlaySettings]);

  // Derived Vision Variables
  const persons = latestVisionResult?.persons ?? [];
  const poses = latestVisionResult?.poses ?? [];
  const primaryPose = poses[0];
  const objects = latestVisionResult?.objects ?? [];
  const motions = latestVisionResult?.motions ?? [];
  const primaryMotion = motions[0];
  const interactions = latestVisionResult?.interactions ?? [];
  const primaryInteraction = interactions[0];
  const actions = latestVisionResult?.actions ?? [];
  const primaryAction = actions[0];
  const perf = latestVisionResult?.performance;
  const cameraCaps = latestVisionResult?.camera;
  const activeTask = latestVisionResult?.activeTask;
  const anomalies = latestVisionResult?.anomalies ?? [];
  const zones = latestVisionResult?.zones ?? [];

  const activeDemo = demoScenarioService.getActiveScenario();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-5">

        {/* ── Page Header (Space Mission Control Style) ── */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>ALTRON SPACE MISSION CONTROL & VISION INTELLIGENCE</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                {activeTask?.name || CANONICAL_EXPERIMENT.title}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Astrobee / ISRO Ground Operations Perception Architecture • {activeTask?.category || 'EXPERIMENT'}
              </p>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-2.5 font-mono text-xs flex-wrap">
              {activeDemo ? (
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded font-bold text-amber-300 flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                  SIMULATION DEMO: {activeDemo.title}
                </span>
              ) : session.cameraActive ? (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE CAMERA — {formatElapsed(session.elapsedSeconds)}
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded font-bold text-slate-400">
                  PIPELINE STANDBY
                </span>
              )}

              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded font-semibold text-slate-300">
                MODE: {visionMode}
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Multi-object spatial tracking, 2D zone reasoning, interaction state machine & automatic task verification.</span>
          </div>
        </div>

        {/* ── Control Bar & Scenario Selector ── */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-sky-400 uppercase tracking-wide">
              <Activity className="w-4 h-4" />
              <span>Vision Controls</span>
            </div>

            {/* Vision Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400 ml-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">MODE:</span>
              {(['STANDARD', 'BALANCED', 'MAXIMUM'] as VisionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisionMode(mode)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    visionMode === mode
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Predefined Demo Scenario Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700 text-xs font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">DEMO SCENARIO:</span>
              <select
                value={selectedDemoId}
                onChange={(e) => handleSelectDemo(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-sky-500"
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

          <div className="flex items-center gap-2 flex-wrap">
            {!session.cameraActive && !activeDemo ? (
              <button
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-mono font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>ENABLE WEBCAM</span>
              </button>
            ) : session.cameraActive ? (
              <button
                onClick={stopCamera}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>STOP WEBCAM</span>
              </button>
            ) : null}

            {activeDemo && (
              <button
                onClick={() => handleSelectDemo('')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>EXIT DEMO</span>
              </button>
            )}

            <button
              onClick={toggleVoice}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-lg flex items-center gap-1.5 border transition-colors ${
                session.voiceEnabled
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {session.voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{session.voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}</span>
            </button>
          </div>
        </div>

        {/* ── Main Monitor Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Live Camera Feed & Canvas Overlay */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${session.cameraActive || activeDemo ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                    {activeDemo ? `SIMULATED FEED: ${activeDemo.title}` : session.cameraActive ? 'LIVE WEBCAM PERCEPTION STREAM' : 'CAMERA OFFLINE'}
                  </h2>
                </div>

                {/* Overlay Toggles */}
                <div className="flex items-center gap-2.5 font-mono text-[10px] text-slate-300">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showZones}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showZones: e.target.checked }))}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <span>Zones</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showObjects}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showObjects: e.target.checked }))}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <span>Objects</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showPoseSkeleton}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showPoseSkeleton: e.target.checked }))}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <span>Pose</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showInteractions}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showInteractions: e.target.checked }))}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <span>Links</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlaySettings.showTrajectories}
                      onChange={(e) => setOverlaySettings((prev) => ({ ...prev, showTrajectories: e.target.checked }))}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <span>Trails</span>
                  </label>
                </div>
              </div>

              {/* Video & Canvas Container */}
              <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${session.cameraActive && !activeDemo ? 'block' : 'hidden'}`}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full ${session.cameraActive || activeDemo ? 'block' : 'hidden'}`}
                />

                {!session.cameraActive && !activeDemo && (
                  <div className="text-center p-6 space-y-3">
                    <CameraOff className="w-12 h-12 text-slate-600 mx-auto" />
                    <div>
                      <p className="font-mono text-sm font-bold text-slate-300">VISION PIPELINE STANDBY</p>
                      <p className="text-xs text-slate-500 mt-1">Enable Webcam or select a Demo Scenario above to start perception.</p>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-x-4 bottom-4 bg-rose-950/90 border border-rose-500 p-3 rounded-lg text-rose-200 text-xs font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Engine Metrics Footer */}
              <div className="mt-3 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between font-mono text-[11px] text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span>MODEL: <strong className="text-sky-300">TF.js MoveNet + ByteTrack</strong></span>
                  <span>RES: <strong className="text-slate-200">{cameraCaps ? `${cameraCaps.resolutionWidth}x${cameraCaps.resolutionHeight}` : '640x480'}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span>CAM FPS: <strong className="text-emerald-400">{perf?.cameraFPS || 30}</strong></span>
                  <span>INF FPS: <strong className="text-sky-400">{perf?.inferenceFPS || 24}</strong></span>
                  <span>LATENCY: <strong className="text-amber-400">{perf?.latencyMs || 18} ms</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Simulation Override Box */}
            <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  PROCEDURE VERIFICATION ENGINE OVERRIDES
                </span>
                <span className="text-xs font-mono font-bold text-sky-400">
                  PROGRESS: {activeTask?.overallProgress || 0}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                <span className="text-slate-400">MANUAL STEP OVERRIDES:</span>
                <div className="flex items-center gap-2">
                  <button onClick={simulateVerified} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-md font-bold hover:bg-emerald-500/30">
                    ✓ VERIFY STEP
                  </button>
                  <button onClick={simulateWrong} className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded-md font-bold hover:bg-rose-500/30">
                    ⚠ WRONG STEP
                  </button>
                  <button onClick={simulateSkipped} className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-md font-bold hover:bg-amber-500/30">
                    — SKIP STEP
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Control Multi-Tab Dashboard */}
          <div className="lg:col-span-5 space-y-4">

            {/* Tab Navigation Header */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 text-xs font-mono">
              {[
                { id: 'TASKS', label: 'PROCEDURES', icon: ListOrdered },
                { id: 'ZONES', label: 'CREW & ZONES', icon: Compass },
                { id: 'ANOMALIES', label: `ALERTS (${anomalies.length})`, icon: AlertTriangle },
                { id: 'TELEMETRY', label: 'EVENT LOG', icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: PROCEDURES & MISSION TASKS */}
            {activeTab === 'TASKS' && activeTask && (
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">{activeTask.category} TASK</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{activeTask.name}</h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/50 rounded font-bold">
                    {activeTask.status}
                  </span>
                </div>

                {/* Overall Task Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>OVERALL STEP PROGRESS</span>
                    <span className="text-sky-400 font-bold">{activeTask.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${activeTask.overallProgress}%` }} />
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {activeTask.steps.map((step, idx) => {
                    const isCurrent = idx === activeTask.currentStepIndex;
                    const isCompleted = step.status === 'COMPLETED';

                    return (
                      <div
                        key={step.stepId}
                        className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                          isCurrent
                            ? 'bg-sky-950/40 border-sky-500/80 shadow-md'
                            : isCompleted
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-600 text-[10px] flex items-center justify-center text-slate-500">
                                {step.stepNumber}
                              </span>
                            )}
                            <span className={`font-bold ${isCurrent ? 'text-sky-200' : isCompleted ? 'text-emerald-200' : 'text-slate-300'}`}>
                              STEP {step.stepNumber}: {step.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold">
                            {step.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">{step.description}</p>

                        {/* Step Requirements Badges */}
                        <div className="mt-2 pl-6 flex items-center gap-1.5 flex-wrap text-[10px]">
                          {step.targetZone && (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">
                              ZONE: {step.targetZone}
                            </span>
                          )}
                          {step.targetObject && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                              OBJ: {step.targetObject}
                            </span>
                          )}
                          {step.requiredInteraction && (
                            <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded">
                              STATE: {step.requiredInteraction}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CREW & SPATIAL ZONES */}
            {activeTab === 'ZONES' && (
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase">SPATIAL ZONES ({zones.length})</span>
                  <span className="text-xs font-mono text-slate-400">{persons.length} CREW DETECTED</span>
                </div>

                {/* Zone Occupancy Cards */}
                <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto">
                  {zones.map((z) => (
                    <div key={z.zoneId} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{z.zoneName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          z.occupantCount > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {z.occupantCount > 0 ? `OCCUPIED (${z.occupantCount})` : 'EMPTY'}
                        </span>
                      </div>

                      {z.personIds.length > 0 && (
                        <p className="text-[11px] text-emerald-400">Crew: {z.personIds.join(', ')}</p>
                      )}
                      {z.objectIds.length > 0 && (
                        <p className="text-[11px] text-sky-400">Objects: {z.objectIds.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ANOMALY ALERTS */}
            {activeTab === 'ANOMALIES' && (
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase">ACTIVE ANOMALIES ({anomalies.length})</span>
                  {anomalies.length > 0 && (
                    <button
                      onClick={() => anomalyEngine.clearAllAnomalies()}
                      className="text-[10px] font-mono text-slate-400 hover:text-white underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto">
                  {anomalies.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 italic">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                      <span>No active mission anomalies detected. Systems nominal.</span>
                    </div>
                  ) : (
                    anomalies.map((anom) => (
                      <div
                        key={anom.id}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          anom.severity === 'CRITICAL'
                            ? 'bg-rose-950/40 border-rose-500/80 text-rose-200'
                            : 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {anom.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-900">
                            {anom.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed">{anom.message}</p>

                        <div className="pt-1.5 flex items-center justify-between text-[10px]">
                          <span>ZONE: {anom.locationZone || 'CABIN'}</span>
                          <button
                            onClick={() => anomalyEngine.clearAnomaly(anom.id)}
                            className="text-slate-400 hover:text-white underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: TELEMETRY & EVENT LOG */}
            {activeTab === 'TELEMETRY' && (
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase">TELEMETRY EVENT STREAM</span>
                  <span className="text-xs font-mono text-slate-500">{eventLogs.length} EVENTS</span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] max-h-80 overflow-y-auto">
                  {eventLogs.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2 bg-slate-900/80 border border-slate-800 rounded flex items-start gap-2"
                    >
                      <span className="text-slate-500 shrink-0">{evt.timestamp}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`font-bold ${
                          evt.severity === 'CRITICAL' ? 'text-rose-400' : evt.severity === 'WARNING' ? 'text-amber-400' : 'text-sky-300'
                        }`}>
                          [{evt.type}] {evt.summary}
                        </span>
                        {evt.details && <p className="text-slate-400 text-[10px] truncate mt-0.5">{evt.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Engine Capabilities Overview */}
            <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <span className="font-bold text-slate-300">ACTIVE PERCEPTION ENGINES</span>
                <span className="text-emerald-400 font-bold">● ONLINE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">ByteTrack Multi-Obj:</span>
                  <span className="font-bold text-emerald-400">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Spatial Zone Engine:</span>
                  <span className="font-bold text-emerald-400">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Hand Interaction:</span>
                  <span className="font-bold text-emerald-400">ACTIVE</span>
                </div>
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Anomaly Engine:</span>
                  <span className="font-bold text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
