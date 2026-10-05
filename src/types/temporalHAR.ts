// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Human Activity Recognition (HAR) Data Types
// SIH26174 — AI Human Activity Recognition for On-Board BAS Experiments
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PersonDetection,
  PoseLandmarks,
  HandDetection,
  ObjectDetection,
  InteractionResult,
  PersonMotion,
} from './vision';
import type { VerificationOutcome } from './session';

/**
 * Canonical Action Classes for ALTRON Experiments
 * Representative: Microgravity Biological Observation (10 Steps)
 * Consistent across: dataset labels, Temporal HAR, ProcedureEngine, UI, logs, reports.
 */
export type CanonicalAction =
  | 'INITIALIZE'
  | 'RETRIEVE'
  | 'VERIFY'
  | 'POSITION'
  | 'SECURE'
  | 'PREPARE'
  | 'TRANSFER'
  | 'ALIGN'
  | 'OBSERVE'
  | 'RECORD'
  | 'STOW'
  | 'IDLE'
  | 'AMBIGUOUS'
  | 'UNKNOWN';

export const CANONICAL_ACTIONS: readonly CanonicalAction[] = [
  'INITIALIZE',
  'RETRIEVE',
  'VERIFY',
  'POSITION',
  'SECURE',
  'PREPARE',
  'TRANSFER',
  'ALIGN',
  'OBSERVE',
  'RECORD',
  'STOW',
] as const;

/**
 * Operational Model Status
 * Clearly communicated in UI — no fake active models!
 */
export type TemporalHARStatus =
  | 'MODEL_ACTIVE'
  | 'MODEL_INITIALIZING'
  | 'MODEL_UNAVAILABLE'
  | 'DEMO_MODE'
  | 'WAITING_FOR_OBSERVATIONS'
  | 'ERROR';

/**
 * Prediction Stability States
 */
export type PredictionStability =
  | 'STABLE'
  | 'CANDIDATE'
  | 'AMBIGUOUS'
  | 'LOW_CONFIDENCE'
  | 'INSUFFICIENT_DATA';

/**
 * Single-frame perception observation consumed by Temporal Buffer
 */
export interface PerFrameObservation {
  frameIndex: number;
  timestampMs: number;
  formattedTime: string;
  fps?: number;
  persons: PersonDetection[];
  primaryPerson?: PersonDetection;
  pose?: PoseLandmarks;
  hands: HandDetection[];
  objects: ObjectDetection[];
  interactions: InteractionResult[];
  motion?: PersonMotion;
}

/**
 * Configuration for sliding temporal window
 */
export interface TemporalWindowConfig {
  /** Target window size in frames (e.g. 60 frames = ~2s at 30fps) */
  windowSize: number;
  /** Stride between temporal predictions (e.g. every 5 frames) */
  stride: number;
  /** Number of consecutive candidate predictions required for STABLE status */
  stabilityThreshold: number;
  /** Minimum confidence threshold (0..1) below which action is LOW_CONFIDENCE */
  minConfidenceThreshold: number;
  /** Ambiguity margin: if top 2 predictions have difference < margin, mark AMBIGUOUS */
  ambiguityMargin: number;
  /** Mode: DEMO or REAL */
  mode: 'DEMO' | 'REAL';
}

export const DEFAULT_TEMPORAL_CONFIG: TemporalWindowConfig = {
  windowSize: 60,
  stride: 5,
  stabilityThreshold: 3,
  minConfidenceThreshold: 0.70,
  ambiguityMargin: 0.12,
  mode: 'DEMO', // honest default until real trained weights are loaded
};

/**
 * Normalized feature vector extracted from a temporal window
 */
export interface ExtractedTemporalFeatures {
  windowDurationSec: number;
  observedFps: number;
  frameCount: number;
  
  // Pose features
  wristDisplacementL: number;
  wristDisplacementR: number;
  armMovementMagnitude: number;
  bodyMovementLevel: string;

  // Hand-Object interaction features
  dominantInteractionState: string;
  interactionPersistenceFrames: number;
  contactDetected: boolean;
  holdingDetected: boolean;
  movingDetected: boolean;

  // Object features
  primaryObjectLabel: string | null;
  objectDisplacement: number;
  objectVelocity: { dx: number; dy: number };

  // Relative spatial features (scale-invariant)
  handObjectDistanceNorm: number;
  handRelativePersonY: number;
}

/**
 * Structured evidence item for explainability ("Why this action?")
 */
export interface TemporalEvidenceItem {
  id: string;
  label: string;
  observed: boolean;
  details?: string;
  category: 'POSE' | 'HAND' | 'OBJECT' | 'INTERACTION' | 'TEMPORAL';
}

/**
 * Explainability breakdown
 */
export interface TemporalExplainability {
  action: CanonicalAction;
  summary: string;
  evidencePoints: TemporalEvidenceItem[];
  confidenceAssessment: string;
  proceduralRelevance: string;
}

/**
 * Structured prediction result output by ITemporalHARService
 */
export interface TemporalHARPrediction {
  action: CanonicalAction;
  /** Model-produced confidence 0..1, or null if demo/unavailable (NEVER fabricated) */
  confidence: number | null;
  /** Human-readable percentage or N/A */
  confidenceDisplay: string;
  stability: PredictionStability;
  status: TemporalHARStatus;
  statusNote: string;
  candidateAction: CanonicalAction | null;
  stableAction: CanonicalAction | null;
  windowStartMs: number;
  windowEndMs: number;
  windowDurationSec: number;
  frameCount: number;
  timestamp: string;
  rawProbabilities?: Partial<Record<CanonicalAction, number>>;
  explainability: TemporalExplainability;
  isRealInference: boolean;
}

/**
 * Timeline entry for Temporal Activity Timeline
 */
export interface TemporalTimelineEntry {
  id: string;
  timestamp: string;
  windowFrames: number;
  windowDurationSec: number;
  action: CanonicalAction;
  confidence: number | null;
  confidenceDisplay: string;
  stability: PredictionStability;
  procedureOutcome: VerificationOutcome;
  expectedAction?: string;
  isRealInference: boolean;
}

/**
 * Measured performance telemetry for Temporal HAR
 */
export interface TemporalHARMetrics {
  inferenceLatencyMs: number | null;
  cameraFps: number;
  windowDurationSec: number;
  framesProcessed: number;
  bufferFillRatio: number;
  currentWindowSize: number;
  isBufferReady: boolean;
}
