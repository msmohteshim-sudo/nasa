// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Hand-Object Interaction State Machine Analyzer
// Analyzes spatial proximity, dual-hand bounding box overlap, velocity correlation,
// and state progression (APPROACHING -> CONTACT -> GRABBING -> HOLDING -> MOVING -> RELEASING).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  InteractionResult,
  DetailedInteractionState,
  HandDetection,
  ObjectDetection,
  PersonMotion,
} from '@/types/vision';

interface InteractionHistoryEntry {
  key: string; // `${personId}-${hand}-${objectId}`
  state: DetailedInteractionState;
  firstStateMs: number;
  lastDistance: number;
  frameCount: number;
}

export class InteractionAnalyzer {
  private history: Map<string, InteractionHistoryEntry> = new Map();

  analyzeInteractions(
    hands: HandDetection[],
    objects: ObjectDetection[],
    motions: PersonMotion[]
  ): InteractionResult[] {
    const results: InteractionResult[] = [];
    const nowMs = Date.now();

    hands.forEach((hand) => {
      if (!hand.isDetected) return;

      const handCx = hand.box.x + hand.box.width / 2;
      const handCy = hand.box.y + hand.box.height / 2;
      const personId = hand.personId || 'Person #01';

      objects.forEach((obj) => {
        const objCx = obj.box.x + obj.box.width / 2;
        const objCy = obj.box.y + obj.box.height / 2;
        const distance = Math.round(Math.hypot(handCx - objCx, handCy - objCy));

        // Bounding box spatial overlap
        const isOverlapping =
          hand.box.x < obj.box.x + obj.box.width &&
          hand.box.x + hand.box.width > obj.box.x &&
          hand.box.y < obj.box.y + obj.box.height &&
          hand.box.y + hand.box.height > obj.box.y;

        const histKey = `${personId}-${hand.hand}-${obj.id}`;
        const prevHistory = this.history.get(histKey);

        let detailedState: DetailedInteractionState = 'NO_INTERACTION';
        let compatType: InteractionResult['type'] = 'NEAR';
        let baseConfidence = 70;

        const personMotion = motions.find((m) => m.personId === personId);
        const handMotionLevel = personMotion?.regions.find(
          (r) => r.partName === `${hand.hand === 'LEFT' ? 'Left' : 'Right'} Hand`
        )?.level;

        const isMoving = handMotionLevel === 'HIGH_MOVEMENT' || handMotionLevel === 'MODERATE_MOVEMENT';

        if (isOverlapping) {
          if (isMoving) {
            detailedState = 'MOVING';
            compatType = 'MOVING';
            baseConfidence = 91;
          } else if (prevHistory && (prevHistory.state === 'GRABBING' || prevHistory.state === 'HOLDING')) {
            detailedState = 'HOLDING';
            compatType = 'HOLDING';
            baseConfidence = 88;
          } else {
            detailedState = 'GRABBING';
            compatType = 'HOLDING';
            baseConfidence = 85;
          }
        } else if (distance < 140) {
          if (prevHistory && (prevHistory.state === 'HOLDING' || prevHistory.state === 'MOVING')) {
            detailedState = 'RELEASING';
            compatType = 'POSITIONING';
            baseConfidence = 86;
          } else {
            detailedState = 'CONTACT';
            compatType = 'TOUCHING';
            baseConfidence = 82;
          }
        } else if (distance < 260) {
          if (prevHistory && prevHistory.lastDistance > distance) {
            detailedState = 'APPROACHING';
            compatType = 'NEAR';
            baseConfidence = 78;
          } else if (prevHistory && prevHistory.state === 'RELEASING') {
            detailedState = 'RELEASED';
            compatType = 'NEAR';
            baseConfidence = 80;
          } else {
            detailedState = 'NO_INTERACTION';
            compatType = 'NEAR';
            baseConfidence = 65;
          }
        }

        // Maintain state duration history
        let durationMs = 0;
        if (detailedState !== 'NO_INTERACTION') {
          if (prevHistory && prevHistory.state === detailedState) {
            durationMs = nowMs - prevHistory.firstStateMs;
            this.history.set(histKey, {
              ...prevHistory,
              lastDistance: distance,
              frameCount: prevHistory.frameCount + 1,
            });
          } else {
            this.history.set(histKey, {
              key: histKey,
              state: detailedState,
              firstStateMs: nowMs,
              lastDistance: distance,
              frameCount: 1,
            });
          }

          results.push({
            personId,
            hand: hand.hand,
            objectId: obj.id,
            objectLabel: obj.label,
            type: compatType,
            interactionState: detailedState,
            confidence: Math.min(98, baseConfidence + Math.round((obj.confidence / 100) * 8)),
            spatialDistance: distance,
            durationMs,
          });
        }
      });
    });

    // Cleanup stale history older than 5 seconds
    this.history.forEach((hist, key) => {
      if (nowMs - hist.firstStateMs > 5000 && hist.state === 'RELEASED') {
        this.history.delete(key);
      }
    });

    // Sort by confidence descending
    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  }
}

export const interactionAnalyzer = new InteractionAnalyzer();
