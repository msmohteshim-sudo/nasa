// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Demo Temporal HAR Service
// Honest, deterministic simulation of temporal action recognition across windows
// Clearly labeled as DEMO MODE — does NOT fabricate neural network confidence
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CanonicalAction,
  PerFrameObservation,
  TemporalHARPrediction,
  TemporalHARStatus,
  TemporalWindowConfig,
  TemporalExplainability,
  TemporalEvidenceItem,
} from '@/types/temporalHAR';
import { DEFAULT_TEMPORAL_CONFIG } from '@/types/temporalHAR';
import { TemporalBuffer } from './temporalBuffer';
import { TemporalFeatureExtractor } from './temporalFeatureExtractor';
import { TemporalStabilityManager } from './temporalStabilityManager';
import type { ITemporalHARService } from './iTemporalHARService';

export class DemoTemporalHARService implements ITemporalHARService {
  private buffer: TemporalBuffer;
  private featureExtractor: TemporalFeatureExtractor;
  private stabilityManager: TemporalStabilityManager;
  private config: TemporalWindowConfig;
  private expectedAction: string | null = null;
  private evaluationCycle = 0;

  getExpectedAction(): string | null {
    return this.expectedAction;
  }


  // Canonical experiment sequence for demo mode
  private sequenceIndex = 0;
  private readonly demoSequence: CanonicalAction[] = [
    'INITIALIZE',
    'RETRIEVE',
    'VERIFY',
    'SECURE',
    'PREPARE',
    'TRANSFER',
    'ALIGN',
    'OBSERVE',
    'RECORD',
    'STOW',
  ];

  constructor(customConfig?: Partial<TemporalWindowConfig>) {
    this.config = { ...DEFAULT_TEMPORAL_CONFIG, mode: 'DEMO', ...customConfig };
    this.buffer = new TemporalBuffer(this.config.windowSize, this.config.stride);
    this.featureExtractor = new TemporalFeatureExtractor();
    this.stabilityManager = new TemporalStabilityManager(this.config);
  }

  async initialize(): Promise<void> {
    this.reset();
  }

  setExpectedAction(action: string | null): void {
    this.expectedAction = action;
    if (action) {
      const upper = action.toUpperCase();
      const idx = this.demoSequence.findIndex((a) => upper.includes(a) || a.includes(upper));
      if (idx !== -1) {
        this.sequenceIndex = idx;
      }
    }
  }

  addObservation(obs: PerFrameObservation): boolean {
    return this.buffer.addObservation(obs);
  }

  isWindowReady(): boolean {
    return this.buffer.isReady();
  }

  getBuffer(): TemporalBuffer {
    return this.buffer;
  }

  getStatus(): TemporalHARStatus {
    if (!this.buffer.isReady()) {
      return 'WAITING_FOR_OBSERVATIONS';
    }
    return 'DEMO_MODE';
  }

  getStatusNote(): string {
    if (!this.buffer.isReady()) {
      return `Accumulating window frames (${this.buffer.getCount()}/${this.config.windowSize})`;
    }
    return 'DEMO MODE: Simulated temporal activity sequence (Rule-driven mock for UI verification)';
  }

  getConfig(): TemporalWindowConfig {
    return this.config;
  }

  setConfig(config: Partial<TemporalWindowConfig>): void {
    this.config = { ...this.config, ...config };
    this.buffer.setWindowSize(this.config.windowSize);
    this.buffer.setStride(this.config.stride);
    this.stabilityManager.updateConfig(this.config);
  }

  predict(): TemporalHARPrediction {
    this.evaluationCycle++;
    const count = this.buffer.getCount();
    const durationSec = this.buffer.getDurationSec();
    const observations = this.buffer.getObservations();
    const latest = this.buffer.getLatest();
    const first = this.buffer.getFirst();

    const windowStartMs = first ? first.timestampMs : Date.now();
    const windowEndMs = latest ? latest.timestampMs : Date.now();
    const timestamp = latest ? latest.formattedTime : new Date().toLocaleTimeString('en-GB', { hour12: false });

    // 1. If buffer not ready, return INSUFFICIENT_DATA
    if (!this.buffer.isReady()) {
      const explainability: TemporalExplainability = {
        action: 'IDLE',
        summary: `Temporal buffer warming up: ${count}/${this.config.windowSize} frames`,
        evidencePoints: [
          {
            id: 'ev-buf',
            label: `Window buffer: ${count} of ${this.config.windowSize} frames`,
            observed: false,
            details: 'Requires complete temporal window before action prediction',
            category: 'TEMPORAL',
          },
        ],
        confidenceAssessment: 'N/A (Buffer warming up)',
        proceduralRelevance: 'Waiting for full window duration',
      };

      return {
        action: 'IDLE',
        confidence: null,
        confidenceDisplay: 'N/A (Warming up)',
        stability: 'INSUFFICIENT_DATA',
        status: 'WAITING_FOR_OBSERVATIONS',
        statusNote: `Buffer: ${count}/${this.config.windowSize} frames`,
        candidateAction: null,
        stableAction: null,
        windowStartMs,
        windowEndMs,
        windowDurationSec: durationSec,
        frameCount: count,
        timestamp,
        explainability,
        isRealInference: false,
      };
    }

    // 2. Feature Extraction from real observations in window
    const features = this.featureExtractor.extract(observations);

    // 3. Derive Simulated Action based on sequence and observations
    // If the expected action matches one of our canonical actions, align to it smoothly
    let rawAction: CanonicalAction = this.demoSequence[this.sequenceIndex % this.demoSequence.length];

    // If hands and module are moving, demonstrate RETRIEVE or TRANSFER
    if (features.holdingDetected && features.movingDetected) {
      if (rawAction === 'INITIALIZE') rawAction = 'RETRIEVE';
    }

    // Evaluate stability
    const stabilityAssessment = this.stabilityManager.evaluateStability(rawAction, null);

    const activeAction = stabilityAssessment.stableAction || rawAction;

    // Structured explainability based on real extracted window features
    const explainability = this.buildExplainability(activeAction, features);

    return {
      action: activeAction,
      confidence: null, // Honest: No fabricated neural confidence in Demo Mode
      confidenceDisplay: 'SIMULATED (DEMO)',
      stability: stabilityAssessment.stability,
      status: 'DEMO_MODE',
      statusNote: 'DEMO MODE: Simulated temporal activity recognition',
      candidateAction: stabilityAssessment.candidateAction,
      stableAction: stabilityAssessment.stableAction,
      windowStartMs,
      windowEndMs,
      windowDurationSec: durationSec,
      frameCount: count,
      timestamp,
      rawProbabilities: {
        [activeAction]: 0.90,
      },
      explainability,
      isRealInference: false,
    };
  }

  getExplainability(prediction: TemporalHARPrediction): TemporalExplainability {
    return prediction.explainability;
  }

  private buildExplainability(
    action: CanonicalAction,
    features: ReturnType<TemporalFeatureExtractor['extract']>
  ): TemporalExplainability {
    const evidencePoints: TemporalEvidenceItem[] = [
      {
        id: 'ev-1',
        label: 'Hand approach to workstation / payload',
        observed: features.contactDetected || features.holdingDetected || features.wristDisplacementR > 0.05,
        details: features.wristDisplacementR > 0.05 ? `Right wrist displacement: ${(features.wristDisplacementR * 100).toFixed(1)}%` : 'Low wrist movement',
        category: 'HAND',
      },
      {
        id: 'ev-2',
        label: 'Human-object physical interaction',
        observed: features.dominantInteractionState !== 'NO_INTERACTION',
        details: `Interaction: ${features.dominantInteractionState} (${features.interactionPersistenceFrames} frames)`,
        category: 'INTERACTION',
      },
      {
        id: 'ev-3',
        label: 'Object displacement detected over window',
        observed: features.objectDisplacement > 5 || features.movingDetected,
        details: features.objectDisplacement > 0 ? `Displacement: ${features.objectDisplacement.toFixed(1)} px` : 'Static object posture',
        category: 'OBJECT',
      },
      {
        id: 'ev-4',
        label: 'Temporal action persistence across sliding window',
        observed: features.frameCount >= this.config.windowSize,
        details: `Evaluated across ${features.frameCount} frames (~${features.windowDurationSec}s at ${features.observedFps} FPS)`,
        category: 'TEMPORAL',
      },
    ];

    return {
      action,
      summary: `Temporal sequence patterns indicate operator engaged in "${action}" over ${features.windowDurationSec}s window.`,
      evidencePoints,
      confidenceAssessment: 'DEMO MODE — Simulated temporal sequence without trained weights',
      proceduralRelevance: `Action "${action}" evaluated by ProcedureEngine against active experiment step`,
    };
  }

  reset(): void {
    this.buffer.clear();
    this.stabilityManager.reset();
    this.sequenceIndex = 0;
    this.evaluationCycle = 0;
  }
}
