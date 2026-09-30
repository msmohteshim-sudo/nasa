// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Human-Object Interaction Analyzer
// Analyzes spatial proximity, bounding box overlap, and motion vector correlation
// between operator hands and experiment workspace objects.
// ─────────────────────────────────────────────────────────────────────────────

import type { InteractionResult, HandDetection, ObjectDetection, PersonMotion } from '@/types/vision';

export class InteractionAnalyzer {
  analyzeInteractions(
    hands: HandDetection[],
    objects: ObjectDetection[],
    motions: PersonMotion[]
  ): InteractionResult[] {
    const results: InteractionResult[] = [];

    hands.forEach((hand) => {
      if (!hand.isDetected) return;

      const handCx = hand.box.x + hand.box.width / 2;
      const handCy = hand.box.y + hand.box.height / 2;

      objects.forEach((obj) => {
        const objCx = obj.box.x + obj.box.width / 2;
        const objCy = obj.box.y + obj.box.height / 2;

        const distance = Math.round(Math.hypot(handCx - objCx, handCy - objCy));

        // Spatial overlap check
        const isOverlapping =
          hand.box.x < obj.box.x + obj.box.width &&
          hand.box.x + hand.box.width > obj.box.x &&
          hand.box.y < obj.box.y + obj.box.height &&
          hand.box.y + hand.box.height > obj.box.y;

        let type: InteractionResult['type'] | null = null;
        let baseConfidence = 0;

        if (isOverlapping) {
          const personMotion = motions.find((m) => m.personId === hand.personId);
          const handMotionLevel = personMotion?.regions.find(
            (r) => r.partName === `${hand.hand === 'LEFT' ? 'Left' : 'Right'} Hand`
          )?.level;

          if (handMotionLevel === 'HIGH_MOVEMENT' || handMotionLevel === 'MODERATE_MOVEMENT') {
            type = 'MOVING';
            baseConfidence = 89;
          } else {
            type = 'HOLDING';
            baseConfidence = 87;
          }
        } else if (distance < 140) {
          type = 'TOUCHING';
          baseConfidence = 84;
        } else if (distance < 240) {
          type = 'NEAR';
          baseConfidence = 78;
        }

        if (type) {
          results.push({
            personId: hand.personId || 'Person #01',
            hand: hand.hand,
            objectId: obj.id,
            objectLabel: obj.label,
            type,
            confidence: Math.min(96, baseConfidence + Math.round((obj.confidence / 100) * 8)),
            spatialDistance: distance,
          });
        }
      });
    });

    // Sort by confidence descending
    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  }
}

export const interactionAnalyzer = new InteractionAnalyzer();
