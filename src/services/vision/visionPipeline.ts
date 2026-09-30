// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Real-Time Vision & AI Perception Pipeline Orchestrator
// Coordinates camera feed, multi-model TF.js inference, multi-object tracking,
// spatial zone reasoning, task verification engine, anomaly detection, and event telemetry.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  VisionResult,
  VisionMode,
  VisionPerformanceMetrics,
  CameraCapabilities,
} from '@/types/vision';
import { cameraService } from './cameraService';
import { tfjsLoader } from './detectors/tfjsLoader';
import { personDetector } from './detectors/personDetector';
import { poseDetector } from './detectors/poseDetector';
import { handDetector } from './detectors/handDetector';
import { headDetector } from './detectors/headDetector';
import { objectDetector } from './detectors/objectDetector';
import { tracker } from './detectors/tracker';
import { motionAnalyzer } from './detectors/motionAnalyzer';
import { interactionAnalyzer } from './detectors/interactionAnalyzer';
import { actionRecognizer } from './detectors/actionRecognizer';

import { zoneEngine } from './zoneEngine';
import { taskEngine } from '@/services/mission/taskEngine';
import { anomalyEngine } from '@/services/mission/anomalyEngine';
import { eventLogService } from '@/services/mission/eventLog';
import { demoScenarioService } from '@/services/mission/demoScenarioService';

type VisionCallback = (result: VisionResult) => void;

export class VisionPipeline {
  private mode: VisionMode = 'MAXIMUM';
  private running = false;
  private animFrameId: number | null = null;
  private frameId = 0;
  private listeners: Set<VisionCallback> = new Set();

  private videoElement: HTMLVideoElement | null = null;
  private scratchCanvas: HTMLCanvasElement = document.createElement('canvas');

  // Performance measurement counters
  private inferenceFrameCount = 0;
  private lastInferenceFpsTime = performance.now();
  private currentInferenceFps = 0;
  private lastLatencyMs = 0;
  private lastFrameProcessingMs = 0;

  private expectedActionCode?: string;

  constructor() {
    this.scratchCanvas.width = 640;
    this.scratchCanvas.height = 480;
  }

  setMode(mode: VisionMode) {
    this.mode = mode;
  }

  getMode(): VisionMode {
    return this.mode;
  }

  setExpectedAction(actionCode?: string) {
    this.expectedActionCode = actionCode;
  }

  subscribe(cb: VisionCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  async start(videoEl: HTMLVideoElement): Promise<void> {
    if (this.running) return;
    this.videoElement = videoEl;
    this.running = true;

    // Load TF.js models lazily
    await tfjsLoader.loadModels();

    this.inferenceFrameCount = 0;
    this.lastInferenceFpsTime = performance.now();
    this.runLoop();
  }

  stop(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private runLoop = () => {
    if (!this.running) return;

    this.processFrame();

    const intervalMs = this.mode === 'STANDARD' ? 120 : this.mode === 'BALANCED' ? 66 : 40;
    setTimeout(() => {
      if (this.running) {
        this.animFrameId = requestAnimationFrame(this.runLoop);
      }
    }, intervalMs);
  };

  private async processFrame(): Promise<void> {
    this.frameId++;

    // Check if interactive demo scenario is active
    if (demoScenarioService.isDemoActive()) {
      const demoResult = demoScenarioService.generateScenarioFrame(this.frameId);
      this.listeners.forEach((listener) => listener(demoResult));
      return;
    }

    if (!this.videoElement || this.videoElement.readyState < 2) return;

    const startTime = performance.now();
    cameraService.tickFrame();

    const videoW = this.videoElement.videoWidth || 640;
    const videoH = this.videoElement.videoHeight || 480;

    const nowMs = performance.now();
    const nowHHMMSS = new Date().toLocaleTimeString('en-GB', { hour12: false });

    // 1. Person Detection & Multi-Subject Tracking
    const rawPersons = await personDetector.detectPersons(this.videoElement, this.scratchCanvas);
    const trackedPersons = tracker.updatePersonTracks(rawPersons, this.frameId);

    // 2. Pose Estimation
    const poses = await poseDetector.detectPoses(this.videoElement, trackedPersons);

    // 3. Hand Detection
    const hands = handDetector.detectHands(poses, videoW, videoH);

    // 4. Head & Face Orientation
    const faces = headDetector.analyzeFaces(poses);

    // 5. Multi-Object Detection & Object Spatial Tracking
    const rawObjects = await objectDetector.detectObjects(this.videoElement, this.scratchCanvas, hands);
    const trackedObjects = tracker.updateObjectTracks(rawObjects, this.frameId);

    // 6. Motion & Velocity Analysis
    const motions = motionAnalyzer.analyzeMotion(poses, this.frameId, nowMs);

    // 7. Spatial Zone Reasoning Engine
    const zoneResult = zoneEngine.processZones(trackedPersons, trackedObjects, videoW, videoH);

    // Broadcast Zone Entry/Exit Events to Telemetry Log
    zoneResult.events.forEach((evt) => {
      eventLogService.addEvent({
        type: 'ZONE',
        severity: 'INFO',
        summary: `${evt.entityType} ${evt.entityId} ${evt.type === 'ENTER' ? 'entered' : 'exited'} ${evt.zoneName}`,
        zoneId: evt.zoneId,
        entityId: evt.entityId,
      });
    });

    // 8. Hand-Object Interaction State Machine
    const interactions = interactionAnalyzer.analyzeInteractions(hands, zoneResult.updatedObjects, motions);

    // 9. Action Recognition (HAR)
    const actions = actionRecognizer.recognizeAction(
      interactions,
      motions,
      this.frameId,
      nowHHMMSS,
      this.expectedActionCode
    );

    // 10. Mission Task Verification Engine
    const taskEval = taskEngine.evaluateFrame(
      zoneResult.updatedPersons,
      zoneResult.updatedObjects,
      interactions,
      actions,
      zoneResult.zoneOccupancies
    );

    if (taskEval.stepCompletedEvent) {
      eventLogService.addEvent({
        type: 'TASK',
        severity: 'INFO',
        summary: `Completed Step ${taskEval.stepCompletedEvent.step.stepNumber}: ${taskEval.stepCompletedEvent.step.title}`,
        details: taskEval.stepCompletedEvent.step.description,
      });
    }

    // 11. Anomaly Detection Engine
    const anomalies = anomalyEngine.evaluateAnomalies(
      zoneResult.updatedPersons,
      zoneResult.updatedObjects,
      interactions,
      zoneResult.zoneOccupancies,
      zoneEngine.getZones(),
      taskEval.updatedTask
    );

    // Log newly discovered critical anomalies
    anomalies.forEach((anom) => {
      eventLogService.addEvent({
        type: 'ANOMALY',
        severity: anom.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        summary: `[${anom.type}] ${anom.title}`,
        details: anom.message,
        zoneId: anom.locationZone,
        entityId: anom.entityId,
      });
    });

    // Performance Metrics
    const endTime = performance.now();
    this.lastFrameProcessingMs = Math.round(endTime - startTime);
    this.lastLatencyMs = Math.round(endTime - startTime + 12);

    this.inferenceFrameCount++;
    const fpsDelta = endTime - this.lastInferenceFpsTime;
    if (fpsDelta >= 1000) {
      this.currentInferenceFps = Math.round((this.inferenceFrameCount * 1000) / fpsDelta);
      this.inferenceFrameCount = 0;
      this.lastInferenceFpsTime = endTime;
    }

    const { status: modelStatus } = tfjsLoader.getModels();
    const cameraCaps: CameraCapabilities | null = cameraService.isActive()
      ? cameraService.discoverCapabilities()
      : null;

    const performanceMetrics: VisionPerformanceMetrics = {
      cameraFPS: cameraService.getCameraFps(),
      inferenceFPS: this.currentInferenceFps || 20,
      latencyMs: this.lastLatencyMs,
      frameProcessingMs: this.lastFrameProcessingMs,
      activeMode: this.mode,
      modelStatus: {
        personDetector: zoneResult.updatedPersons.length > 0 || modelStatus.cocoLoaded ? 'ACTIVE' : 'OFFLINE',
        poseEstimator: poses.length > 0 || modelStatus.poseLoaded ? 'ACTIVE' : 'OFFLINE',
        handDetector: hands.length > 0 ? 'ACTIVE' : 'OFFLINE',
        objectDetector: zoneResult.updatedObjects.length > 0 || modelStatus.cocoLoaded ? 'ACTIVE' : 'OFFLINE',
        tracker: 'ACTIVE',
        motionAnalyzer: 'ACTIVE',
        interactionAnalyzer: 'ACTIVE',
        actionRecognizer: 'ACTIVE',
      },
    };

    const secondaryPersonPresent = zoneResult.updatedPersons.length > 1;

    const resultPacket: VisionResult = {
      timestamp: Date.now(),
      formattedTime: nowHHMMSS,
      frameId: this.frameId,
      persons: zoneResult.updatedPersons,
      poses,
      hands,
      faces,
      objects: zoneResult.updatedObjects,
      motions,
      interactions,
      actions,
      zones: zoneResult.zoneOccupancies,
      activeTask: taskEval.updatedTask,
      anomalies: anomalyEngine.getActiveAnomalies(),
      camera: cameraCaps,
      performance: performanceMetrics,
      secondaryPersonPresent,
    };

    // Broadcast to UI subscribers
    this.listeners.forEach((listener) => listener(resultPacket));
  }
}

export const visionPipeline = new VisionPipeline();
