// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Feature Extraction Layer
// Extracts normalized, scale-invariant spatial-temporal features from a rolling window
// ─────────────────────────────────────────────────────────────────────────────

import type { PerFrameObservation, ExtractedTemporalFeatures } from '@/types/temporalHAR';

export class TemporalFeatureExtractor {
  /**
   * Extract high-level temporal features from an observation window
   */
  extract(observations: readonly PerFrameObservation[]): ExtractedTemporalFeatures {
    if (observations.length === 0) {
      return this.getEmptyFeatures();
    }

    const first = observations[0];
    const last = observations[observations.length - 1];

    const durationSec = Math.max(0.001, (last.timestampMs - first.timestampMs) / 1000);
    const observedFps = Math.round(((observations.length - 1) / durationSec) * 10) / 10;

    // 1. Pose & Wrist Displacement (relative to primary person bbox)
    let wristDisplacementL = 0;
    let wristDisplacementR = 0;
    let armMovementMagnitude = 0;

    const firstPose = first.pose;
    const lastPose = last.pose;

    if (firstPose && lastPose && firstPose.landmarks && lastPose.landmarks) {
      const getPt = (p: typeof firstPose, name: string) =>
        p.landmarks.find((l) => l.name === name);

      const fLw = getPt(firstPose, 'left_wrist');
      const lLw = getPt(lastPose, 'left_wrist');
      if (fLw && lLw) {
        wristDisplacementL = Math.hypot(lLw.x - fLw.x, lLw.y - fLw.y);
      }

      const fRw = getPt(firstPose, 'right_wrist');
      const lRw = getPt(lastPose, 'right_wrist');
      if (fRw && lRw) {
        wristDisplacementR = Math.hypot(lRw.x - fRw.x, lRw.y - fRw.y);
      }

      const fLe = getPt(firstPose, 'left_elbow');
      const lLe = getPt(lastPose, 'left_elbow');
      const fRe = getPt(firstPose, 'right_elbow');
      const lRe = getPt(lastPose, 'right_elbow');
      const elDisp = (fLe && lLe ? Math.hypot(lLe.x - fLe.x, lLe.y - fLe.y) : 0) +
                     (fRe && lRe ? Math.hypot(lRe.x - fRe.x, lRe.y - fRe.y) : 0);
      armMovementMagnitude = (wristDisplacementL + wristDisplacementR + elDisp) / 3;
    }

    // 2. Motion Levels
    const bodyMovementLevel = last.motion?.overallLevel ?? 'LOW_MOVEMENT';

    // 3. Hand-Object Interaction Sequence Analysis
    let contactCount = 0;
    let holdingCount = 0;
    let movingCount = 0;
    let primaryObjectLabel: string | null = null;
    let minDistance = 9999;

    const interactionStateCounts: Record<string, number> = {};

    for (const obs of observations) {
      if (obs.interactions.length > 0) {
        const topInt = obs.interactions[0];
        if (!primaryObjectLabel && topInt.objectLabel) {
          primaryObjectLabel = topInt.objectLabel;
        }
        if (topInt.spatialDistance < minDistance) {
          minDistance = topInt.spatialDistance;
        }

        const state = topInt.interactionState || topInt.type;
        interactionStateCounts[state] = (interactionStateCounts[state] || 0) + 1;

        if (state === 'CONTACT' || state === 'TOUCHING') contactCount++;
        if (state === 'HOLDING' || state === 'GRABBING') holdingCount++;
        if (state === 'MOVING' || state === 'POSITIONING') movingCount++;
      }
    }

    let dominantInteractionState = 'NO_INTERACTION';
    let maxCount = 0;
    for (const [st, cnt] of Object.entries(interactionStateCounts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        dominantInteractionState = st;
      }
    }

    // 4. Object Displacement across window
    let objectDisplacement = 0;
    const objVelocity = { dx: 0, dy: 0 };

    if (primaryObjectLabel) {
      const fObj = first.objects.find((o) => o.label === primaryObjectLabel);
      const lObj = last.objects.find((o) => o.label === primaryObjectLabel);
      if (fObj && lObj) {
        const dx = (lObj.box.x + lObj.box.width / 2) - (fObj.box.x + fObj.box.width / 2);
        const dy = (lObj.box.y + lObj.box.height / 2) - (fObj.box.y + fObj.box.height / 2);
        objectDisplacement = Math.hypot(dx, dy);
        objVelocity.dx = Math.round((dx / durationSec) * 10) / 10;
        objVelocity.dy = Math.round((dy / durationSec) * 10) / 10;
      }
    }

    // 5. Normalized Scale-Invariant Coordinates
    const primaryPerson = last.primaryPerson || last.persons[0];
    let handObjectDistanceNorm = minDistance === 9999 ? 1.0 : Math.min(1.0, minDistance / 400);
    let handRelativePersonY = 0.5;

    if (primaryPerson?.box && primaryPerson.box.height > 0) {
      const rightHand = last.hands?.find((h) => h.hand === 'RIGHT') || last.hands?.[0];
      if (rightHand?.box && primaryPerson.box) {
        handRelativePersonY = (rightHand.box.y - primaryPerson.box.y) / primaryPerson.box.height;
      }
    }

    return {
      windowDurationSec: Math.round(durationSec * 100) / 100,
      observedFps,
      frameCount: observations.length,
      wristDisplacementL: Math.round(wristDisplacementL * 1000) / 1000,
      wristDisplacementR: Math.round(wristDisplacementR * 1000) / 1000,
      armMovementMagnitude: Math.round(armMovementMagnitude * 1000) / 1000,
      bodyMovementLevel,
      dominantInteractionState,
      interactionPersistenceFrames: maxCount,
      contactDetected: contactCount > 3,
      holdingDetected: holdingCount > 5,
      movingDetected: movingCount > 4,
      primaryObjectLabel,
      objectDisplacement: Math.round(objectDisplacement * 10) / 10,
      objectVelocity: objVelocity,
      handObjectDistanceNorm: Math.round(handObjectDistanceNorm * 100) / 100,
      handRelativePersonY: Math.round(handRelativePersonY * 100) / 100,
    };
  }

  private getEmptyFeatures(): ExtractedTemporalFeatures {
    return {
      windowDurationSec: 0,
      observedFps: 0,
      frameCount: 0,
      wristDisplacementL: 0,
      wristDisplacementR: 0,
      armMovementMagnitude: 0,
      bodyMovementLevel: 'NO_MOVEMENT',
      dominantInteractionState: 'NO_INTERACTION',
      interactionPersistenceFrames: 0,
      contactDetected: false,
      holdingDetected: false,
      movingDetected: false,
      primaryObjectLabel: null,
      objectDisplacement: 0,
      objectVelocity: { dx: 0, dy: 0 },
      handObjectDistanceNorm: 1.0,
      handRelativePersonY: 0.5,
    };
  }
}

export const temporalFeatureExtractor = new TemporalFeatureExtractor();
