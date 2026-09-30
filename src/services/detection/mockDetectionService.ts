// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Mock Detection Service
// Simulates the AI vision pipeline output frame-by-frame.
// In a real deployment, this would be replaced by a WASM / WebWorker
// running a YOLOv8 + HAR model against the live camera stream.
// ─────────────────────────────────────────────────────────────────────────────

import type { ObservationPacket, DetectionResult } from '@/types/session';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';

let frameCounter = 0;

function nowHHMMSS(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function jitter(base: number, range = 0.03): number {
  return Math.min(0.99, Math.max(0.80, base + (Math.random() - 0.5) * range));
}

const BASE_DETECTIONS: DetectionResult[] = CANONICAL_EXPERIMENT.objects.map((o) => ({
  label: o.label,
  confidence: o.confidence,
}));

/**
 * Given the code of the expected step, produce a plausible ObservationPacket
 * that (most of the time) matches the expected action.
 *
 * @param expectedAction  The current step's expectedAction string.
 * @param forceWrong      If true, return a deliberately wrong action label.
 */
export function sampleObservation(
  expectedAction: string,
  forceWrong = false
): ObservationPacket {
  frameCounter += 1;

  const detections: DetectionResult[] = BASE_DETECTIONS.map((d) => ({
    ...d,
    confidence: jitter(d.confidence),
  }));

  // Enrich with interaction on PERSON and HAND
  detections[0] = { ...detections[0], interaction: 'operator at workstation' };
  detections[1] = { ...detections[1], interaction: 'hand interacting with experiment module' };

  const dominantAction = forceWrong
    ? 'Stow Experiment Module' // deliberate wrong step
    : expectedAction;

  const confidence = forceWrong ? jitter(0.47, 0.1) : jitter(0.95, 0.04);

  return {
    frameId: frameCounter,
    timestamp: nowHHMMSS(),
    detections,
    dominantAction,
    confidence,
  };
}

/**
 * Returns the base detections array (useful for "idle" rendering without a session).
 */
export function getBaseDetections(): DetectionResult[] {
  return BASE_DETECTIONS.map((d) => ({ ...d, confidence: jitter(d.confidence) }));
}
