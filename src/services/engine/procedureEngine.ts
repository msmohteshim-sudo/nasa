// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Procedure Engine
// Evaluates ObservationPackets against the expected procedure step.
// Returns a VerificationOutcome + updated LiveStep state.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ObservationPacket,
  LiveStep,
  AuditEntry,
  VerificationOutcome,
} from '@/types/session';

/** Confidence threshold above which a detection is accepted as VERIFIED */
const VERIFY_THRESHOLD = 0.80;

/** Confidence threshold below which an action is flagged as WRONG */
const WRONG_THRESHOLD = 0.60;

export interface EngineResult {
  outcome: VerificationOutcome;
  updatedStep: LiveStep;
  auditEntry: AuditEntry;
}

/**
 * Evaluates a single ObservationPacket against the currently active LiveStep.
 * Returns the engine result (outcome, updated step, audit log entry).
 */
export function evaluateObservation(
  activeStep: LiveStep,
  observation: ObservationPacket
): EngineResult {
  const { dominantAction, confidence, timestamp } = observation;
  const expected = activeStep.expectedAction;

  let outcome: VerificationOutcome;

  if (confidence >= VERIFY_THRESHOLD && dominantAction === expected) {
    outcome = 'VERIFIED';
  } else if (confidence < WRONG_THRESHOLD || (dominantAction !== expected && confidence > VERIFY_THRESHOLD)) {
    outcome = 'WRONG_STEP';
  } else {
    outcome = 'PENDING';
  }

  const updatedStep: LiveStep = {
    ...activeStep,
    observedAction: dominantAction,
    confidence: Math.round(confidence * 100),
    timestamp,
    status:
      outcome === 'VERIFIED'
        ? 'completed'
        : outcome === 'WRONG_STEP'
        ? 'wrong'
        : 'active',
  };

  const auditEntry: AuditEntry = {
    id: `audit-${Date.now()}-${activeStep.code}`,
    timestamp,
    stepCode: activeStep.code,
    stepTitle: activeStep.title,
    outcome,
    confidence: Math.round(confidence * 100),
    observedAction: dominantAction,
    message:
      outcome === 'VERIFIED'
        ? `Step ${activeStep.stepNumber} verified: "${dominantAction}" matched expected action.`
        : outcome === 'WRONG_STEP'
        ? `DEVIATION: Observed "${dominantAction}" but expected "${expected}" (Step ${activeStep.stepNumber}).`
        : `Observing… waiting for clear match on "${expected}".`,
  };

  return { outcome, updatedStep, auditEntry };
}
