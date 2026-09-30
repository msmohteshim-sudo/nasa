// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Real-Time Vision & AI Perception Pipeline Orchestrator
// Coordinates frame capture, multi-model inference, performance adaptation,
// and result broadcasting to ALTRON UI & Procedure Engine.
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

  /**
   * Set target vision mode: STANDARD, BALANCED, MAXIMUM
   */
  setMode(mode: VisionMode) {
    this.mode = mode;
    console.log(`[VisionPipeline] Vision Mode set to: ${mode}`);
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

  /**
   * Start processing loop against live video element stream
   */
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

  /**
   * Stop processing loop
   */
  stop(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private runLoop = () => {
    if (!this.running || !this.videoElement) return;

    this.processFrame();

    // Schedule next frame loop based on performance mode
    const intervalMs = this.mode === 'STANDARD' ? 120 : this.mode === 'BALANCED' ? 66 : 40;
    setTimeout(() => {
      if (this.running) {
        this.animFrameId = requestAnimationFrame(this.runLoop);
      }
    }, intervalMs);
  };

  private async processFrame(): Promise<void> {
    if (!this.videoElement || this.videoElement.readyState < 2) return;

    const startTime = performance.now();
    this.frameId++;
    cameraService.tickFrame();

    const videoW = this.videoElement.videoWidth || 640;
    const videoH = this.videoElement.videoHeight || 480;

    const nowMs = performance.now();
    const nowHHMMSS = new Date().toLocaleTimeString('en-GB', { hour12: false });

    // 1. Person Detection & Tracking
    const rawPersons = await personDetector.detectPersons(this.videoElement, this.scratchCanvas);
    const trackedPersons = tracker.updateTracks(rawPersons, this.frameId);

    // 2. Pose Estimation
    const poses = await poseDetector.detectPoses(this.videoElement, trackedPersons);

    // 3. Hand Detection
    const hands = handDetector.detectHands(poses, videoW, videoH);

    // 4. Head & Face Orientation
    const faces = headDetector.analyzeFaces(poses);

    // 5. Object Detection
    const objects = await objectDetector.detectObjects(this.videoElement, this.scratchCanvas, hands);

    // 6. Motion & Velocity Analysis
    const motions = motionAnalyzer.analyzeMotion(poses, this.frameId, nowMs);

    // 7. Human-Object Interaction
    const interactions = interactionAnalyzer.analyzeInteractions(hands, objects, motions);

    // 8. Action Recognition (HAR)
    const actions = actionRecognizer.recognizeAction(
      interactions,
      motions,
      this.frameId,
      nowHHMMSS,
      this.expectedActionCode
    );

    // Measure Inference FPS & Latency
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
      inferenceFPS: this.currentInferenceFps || 18,
      latencyMs: this.lastLatencyMs,
      frameProcessingMs: this.lastFrameProcessingMs,
      activeMode: this.mode,
      modelStatus: {
        personDetector: trackedPersons.length > 0 || modelStatus.cocoLoaded ? 'ACTIVE' : 'OFFLINE',
        poseEstimator: poses.length > 0 || modelStatus.poseLoaded ? 'ACTIVE' : 'OFFLINE',
        handDetector: hands.length > 0 ? 'ACTIVE' : 'OFFLINE',
        objectDetector: objects.length > 0 || modelStatus.cocoLoaded ? 'ACTIVE' : 'OFFLINE',
        tracker: 'ACTIVE',
        motionAnalyzer: 'ACTIVE',
        interactionAnalyzer: 'ACTIVE',
        actionRecognizer: 'ACTIVE',
      },
    };

    const secondaryPersonPresent = trackedPersons.length > 1;

    const resultPacket: VisionResult = {
      timestamp: Date.now(),
      formattedTime: nowHHMMSS,
      frameId: this.frameId,
      persons: trackedPersons,
      poses,
      hands,
      faces,
      objects,
      motions,
      interactions,
      actions,
      camera: cameraCaps,
      performance: performanceMetrics,
      secondaryPersonPresent,
    };

    // Broadcast to UI subscribers
    this.listeners.forEach((listener) => listener(resultPacket));
  }
}

export const visionPipeline = new VisionPipeline();
