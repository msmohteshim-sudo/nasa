// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Shared Session & Experiment Types
// AI Human Activity Recognition for On-board BAS Experiments
// ─────────────────────────────────────────────────────────────────────────────

export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped' | 'wrong';

export type SessionStatus = 'idle' | 'active' | 'paused' | 'completed' | 'aborted';

/** A single detection produced by the vision layer */
export interface DetectionResult {
  label: string;
  confidence: number;
  /** e.g. "hand -> experiment module" */
  interaction?: string;
  /** Recognised high-level action label */
  recognisedAction?: string;
}

/** A frame-level AI observation packet */
export interface ObservationPacket {
  frameId: number;
  timestamp: string; // HH:MM:SS
  detections: DetectionResult[];
  /** Best matched action label for current frame */
  dominantAction: string;
  /** Overall frame confidence (0-1) */
  confidence: number;
}

/** Verification outcome from the Procedure Engine */
export type VerificationOutcome = 'VERIFIED' | 'WRONG_STEP' | 'SKIPPED' | 'PENDING';

/** One entry in the session audit log */
export interface AuditEntry {
  id: string;
  timestamp: string;
  stepCode: string;
  stepTitle: string;
  outcome: VerificationOutcome;
  confidence: number;
  observedAction: string;
  message: string;
}

/** Live state of a single procedure step during a session */
export interface LiveStep {
  id: number;
  stepNumber: string;
  title: string;
  code: string;
  action: string;
  expectedAction: string;
  observedAction: string;
  description: string;
  status: StepStatus;
  confidence: number;
  timestamp?: string;
  duration?: string;
  expectedDuration: string;
}

/** The full live state of an experiment session */
export interface ExperimentSession {
  sessionId: string;
  experimentId: string;
  experimentTitle: string;
  status: SessionStatus;
  startTime: string | null;
  endTime: string | null;
  steps: LiveStep[];
  currentStepIndex: number;
  auditLog: AuditEntry[];
  lastObservation: ObservationPacket | null;
  /** Whether camera is active */
  cameraActive: boolean;
  /** Whether voice guidance is enabled */
  voiceEnabled: boolean;
  elapsedSeconds: number;
}
