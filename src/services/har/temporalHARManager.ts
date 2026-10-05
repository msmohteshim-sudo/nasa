// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal HAR Manager (Singleton Orchestrator)
// Coordinates active ITemporalHARService implementation (Demo vs Real),
// metrics tracking, window configuration, and telemetry.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PerFrameObservation,
  TemporalHARPrediction,
  TemporalHARStatus,
  TemporalWindowConfig,
  TemporalHARMetrics,
} from '@/types/temporalHAR';
import { DEFAULT_TEMPORAL_CONFIG } from '@/types/temporalHAR';
import type { ITemporalHARService } from './iTemporalHARService';
import { DemoTemporalHARService } from './demoTemporalHARService';
import { RealTemporalHARService } from './realTemporalHARService';

export class TemporalHARManager {
  private activeMode: 'DEMO' | 'REAL' = 'DEMO';
  private demoService: DemoTemporalHARService;
  private realService: RealTemporalHARService;
  private currentService: ITemporalHARService;

  private totalFramesProcessed = 0;
  private lastPrediction: TemporalHARPrediction | null = null;

  constructor() {
    this.demoService = new DemoTemporalHARService(DEFAULT_TEMPORAL_CONFIG);
    this.realService = new RealTemporalHARService(DEFAULT_TEMPORAL_CONFIG);
    this.currentService = this.demoService;
  }

  setMode(mode: 'DEMO' | 'REAL'): void {
    this.activeMode = mode;
    this.currentService = mode === 'DEMO' ? this.demoService : this.realService;
  }

  getMode(): 'DEMO' | 'REAL' {
    return this.activeMode;
  }

  setRealModelUnavailable(): void {
    this.realService.setNeuralWeightsLoaded(false);
    this.realService.setAllowAnalyticalFallback(false);
  }

  setRealModelAnalytical(): void {
    this.realService.setNeuralWeightsLoaded(false);
    this.realService.setAllowAnalyticalFallback(true);
  }

  setWindowConfig(config: Partial<TemporalWindowConfig>): void {
    this.demoService.setConfig(config);
    this.realService.setConfig(config);
  }

  getConfig(): TemporalWindowConfig {
    return this.currentService.getConfig();
  }

  setExpectedAction(action: string | null): void {
    this.demoService.setExpectedAction(action);
    this.realService.setExpectedAction(action);
  }

  addObservation(obs: PerFrameObservation): boolean {
    this.totalFramesProcessed++;
    return this.currentService.addObservation(obs);
  }

  isWindowReady(): boolean {
    return this.currentService.isWindowReady();
  }

  predict(): TemporalHARPrediction {
    const pred = this.currentService.predict();
    this.lastPrediction = pred;
    return pred;
  }

  getLastPrediction(): TemporalHARPrediction | null {
    return this.lastPrediction;
  }

  getStatus(): TemporalHARStatus {
    return this.currentService.getStatus();
  }

  getStatusNote(): string {
    return this.currentService.getStatusNote();
  }

  getMetrics(cameraFps = 30): TemporalHARMetrics {
    const buffer = this.currentService.getBuffer();
    const durationSec = buffer.getDurationSec();
    const measuredFps = buffer.getMeasuredFps() || cameraFps;

    let latency: number | null = null;
    if (this.currentService instanceof RealTemporalHARService) {
      latency = this.currentService.getInferenceLatency();
    }

    return {
      inferenceLatencyMs: latency,
      cameraFps: Math.round(measuredFps * 10) / 10,
      windowDurationSec: durationSec,
      framesProcessed: this.totalFramesProcessed,
      bufferFillRatio: buffer.getFillRatio(),
      currentWindowSize: buffer.getCount(),
      isBufferReady: buffer.isReady(),
    };
  }

  reset(): void {
    this.demoService.reset();
    this.realService.reset();
    this.lastPrediction = null;
    this.totalFramesProcessed = 0;
  }
}

export const temporalHARManager = new TemporalHARManager();
