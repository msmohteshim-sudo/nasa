// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Procedure Engine
// Evaluates Temporal HAR actions against the expected mission procedure step.
// Distinguishes Temporal Recognition ("What is happening?") from Procedural Validation ("Is it expected?").
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ObservationPacket,
  LiveStep,
  AuditEntry,
  VerificationOutcome,
} from '@/types/session';

/** Confidence threshold above which a stable detection is accepted as VERIFIED */
const VERIFY_THRESHOLD = 0.70;

/** Step code / title / action canonical mapping dictionary */
const CANONICAL_STEP_MAP: Record<string, string[]> = {
  INITIALIZE: ['INITIALIZE', 'INITIALIZE WORKSTATION', 'PROC_01_INIT', 'POWER ON', 'INIT'],
  RETRIEVE: ['RETRIEVE', 'RETRIEVE EXPERIMENT MODULE', 'PROC_02_FETCH', 'FETCH', 'EXTRACT'],
  VERIFY: ['VERIFY', 'VERIFY MODULE IDENTIFICATION', 'PROC_03_VERIFY_ID', 'SCAN', 'BARCODE'],
  SECURE: ['SECURE', 'SECURE MODULE IN FIXTURE', 'PROC_04_SECURE', 'LATCH', 'CLAMP'],
  PREPARE: ['PREPARE', 'PREPARE OBSERVATION CHAMBER', 'PROC_05_PREP_CHAMBER', 'SLIDE BARRIER'],
  TRANSFER: ['TRANSFER', 'TRANSFER SAMPLE MODULE', 'PROC_06_TRANSFER', 'INSERT SLIDE'],
  ALIGN: ['ALIGN', 'POSITION', 'POSITION IMAGING UNIT', 'PROC_07_ALIGN_IMAGER', 'ALIGN IMAGER', 'MACROSCOPE'],
  POSITION: ['POSITION', 'ALIGN', 'POSITION IMAGING UNIT', 'PROC_07_ALIGN_IMAGER'],
  OBSERVE: ['OBSERVE', 'CAPTURE OBSERVATION', 'PROC_08_CAPTURE', 'CAPTURE', 'MULTISPECTRAL'],
  RECORD: ['RECORD', 'RECORD OBSERVATION', 'PROC_09_LOG', 'LOG', 'COMMIT CHECKSUM'],
  STOW: ['STOW', 'STOW EXPERIMENT MODULE', 'PROC_10_STOW', 'STORE', 'RACK'],
};

/**
 * Matches an observed action string (canonical or descriptive) to a procedure step's expectations
 */
export function actionsMatch(observed: string, expected: string): boolean {
  if (!observed || !expected) return false;
  const o = observed.trim().toUpperCase();
  const e = expected.trim().toUpperCase();

  if (o === e) return true;

  // Check canonical aliases
  for (const [canonicalKey, aliases] of Object.entries(CANONICAL_STEP_MAP)) {
    const matchesObserved = o === canonicalKey || aliases.some((a) => o.includes(a) || a.includes(o));
    const matchesExpected = e === canonicalKey || aliases.some((a) => e.includes(a) || a.includes(e));

    if (matchesObserved && matchesExpected) {
      return true;
    }
  }

  return false;
}

/**
 * Check if the observed action belongs to any of the subsequent procedure steps
 */
export function findLaterStepMatch(
  observedAction: string,
  allSteps: LiveStep[],
  currentIndex: number
): number | null {
  for (let i = currentIndex + 1; i < allSteps.length; i++) {
    if (actionsMatch(observedAction, allSteps[i].expectedAction)) {
      return i;
    }
  }
  return null;
}

export interface EngineResult {
  outcome: VerificationOutcome;
  updatedStep: LiveStep;
  auditEntry: AuditEntry;
}

/**
 * Evaluates an ObservationPacket against the currently active LiveStep.
 * Supports all procedure scenarios: VERIFIED, WRONG_STEP (DEVIATION), OUT_OF_ORDER, AMBIGUOUS, PENDING.
 */
export function evaluateObservation(
  activeStep: LiveStep,
  observation: ObservationPacket,
  allSteps?: LiveStep[],
  currentIndex?: number
): EngineResult {
  const { dominantAction, confidence, timestamp, temporalStability, temporalPrediction } = observation;
  const expected = activeStep.expectedAction;

  let outcome: VerificationOutcome;
  let auditMessage = '';

  // 1. Check for Ambiguous Temporal HAR state
  if (temporalStability === 'AMBIGUOUS' || dominantAction.toUpperCase() === 'AMBIGUOUS') {
    outcome = 'AMBIGUOUS';
    auditMessage = `TEMPORAL ACTION AMBIGUOUS: Model observing competing action evidence. Waiting for stabilization before verifying step ${activeStep.stepNumber}.`;
  }
  // 2. Check for Low Confidence
  else if (temporalStability === 'LOW_CONFIDENCE' || (confidence < VERIFY_THRESHOLD && confidence > 0 && dominantAction === expected)) {
    outcome = 'PENDING';
    auditMessage = `LOW CONFIDENCE (${Math.round(confidence * 100)}%): Temporal pattern emerging for "${expected}". Collecting additional frames.`;
  }
  // 3. Check for Candidate action waiting for temporal stability
  else if (temporalStability === 'CANDIDATE') {
    outcome = 'PENDING';
    auditMessage = `CANDIDATE ACTION: "${dominantAction}" pattern emerging. Awaiting temporal confirmation across window before verifying.`;
  }
  // 4. Check for Verified Match
  else if (actionsMatch(dominantAction, expected) && confidence >= VERIFY_THRESHOLD) {
    outcome = 'VERIFIED';
    auditMessage = `Step ${activeStep.stepNumber} VERIFIED: Temporal action "${dominantAction}" (${Math.round(confidence * 100)}%) matches expected protocol.`;
  }
  // 4. Check for Out-of-Order / Future Step Action
  else if (
    allSteps &&
    findLaterStepMatch(
      dominantAction,
      allSteps,
      currentIndex ?? allSteps.findIndex((s) => s.id === activeStep.id || s.stepNumber === activeStep.stepNumber)
    ) !== null
  ) {
    const targetIdx = findLaterStepMatch(
      dominantAction,
      allSteps,
      currentIndex ?? allSteps.findIndex((s) => s.id === activeStep.id || s.stepNumber === activeStep.stepNumber)
    )!;
    const targetStep = allSteps[targetIdx];
    outcome = 'OUT_OF_ORDER';
    auditMessage = `OUT-OF-ORDER ACTION: Observed "${dominantAction}" belongs to future Step ${targetStep.stepNumber} ("${targetStep.title}"). Step ${activeStep.stepNumber} skipped or incomplete.`;
  }
  // 5. Wrong Action / Procedure Deviation
  else if (confidence >= VERIFY_THRESHOLD && !actionsMatch(dominantAction, expected)) {
    outcome = 'WRONG_STEP';
    auditMessage = `PROCEDURE DEVIATION: Observed "${dominantAction}" but expected "${expected}" (Step ${activeStep.stepNumber}).`;
  }
  // 6. Observing / Warming Up
  else {
    outcome = 'PENDING';
    auditMessage = `Observing workstation… awaiting temporal activity confirmation for "${expected}".`;
  }

  // Determine updated step status based on outcome
  const updatedStatus =
    outcome === 'VERIFIED'
      ? 'completed'
      : outcome === 'WRONG_STEP'
      ? 'wrong'
      : outcome === 'OUT_OF_ORDER'
      ? 'wrong'
      : outcome === 'AMBIGUOUS'
      ? 'active'
      : activeStep.status;

  const updatedStep: LiveStep = {
    ...activeStep,
    observedAction: dominantAction,
    confidence: Math.round(confidence * 100),
    timestamp,
    status: updatedStatus,
  };

  const auditEntry: AuditEntry = {
    id: `audit-${Date.now()}-${activeStep.code}`,
    timestamp,
    stepCode: activeStep.code,
    stepTitle: activeStep.title,
    outcome,
    confidence: Math.round(confidence * 100),
    observedAction: dominantAction,
    message: auditMessage,
    windowInfo: temporalPrediction
      ? `${temporalPrediction.frameCount} frames (~${temporalPrediction.windowDurationSec}s)`
      : undefined,
    stability: temporalStability,
  };

  return { outcome, updatedStep, auditEntry };
}
