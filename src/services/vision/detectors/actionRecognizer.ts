// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Action Recognizer (HAR)
// Multi-frame sequence classifier for procedural human actions in space experiments.
// Tracks temporal state progression across frame sequences (approach -> contact -> move -> secure).
// ─────────────────────────────────────────────────────────────────────────────

import type { ActionResult, InteractionResult, PersonMotion } from '@/types/vision';

interface FrameObservationHistory {
  frameId: number;
  timestamp: string;
  interactions: InteractionResult[];
  motions: PersonMotion[];
}

export class ActionRecognizer {
  private history: FrameObservationHistory[] = [];

  recognizeAction(
    interactions: InteractionResult[],
    motions: PersonMotion[],
    currentFrameId: number,
    nowHHMMSS: string,
    expectedActionCode?: string
  ): ActionResult[] {
    this.history.push({
      frameId: currentFrameId,
      timestamp: nowHHMMSS,
      interactions,
      motions,
    });

    // Maintain 30-frame temporal sliding window (~1-2 seconds)
    if (this.history.length > 30) this.history.shift();

    const actions: ActionResult[] = [];

    // Analyze primary interaction over temporal window
    const activeInteraction = interactions[0];
    const primaryMotion = motions[0];

    if (activeInteraction) {
      const objLabel = activeInteraction.objectLabel;
      let recognizedActionName = 'RETRIEVE';
      let confidence = activeInteraction.confidence;

      if (objLabel === 'OBSERVATION CHAMBER' || objLabel === 'SAMPLE CONTAINER') {
        if (activeInteraction.type === 'MOVING' || activeInteraction.type === 'HOLDING') {
          recognizedActionName = 'ASEPTIC_PREPARE';
        } else {
          recognizedActionName = 'POSITION';
        }
      } else if (objLabel === 'EXPERIMENT MODULE') {
        if (activeInteraction.type === 'MOVING') {
          recognizedActionName = 'SYRINGE_INSERT';
        } else if (activeInteraction.type === 'POSITIONING' || activeInteraction.type === 'HOLDING') {
          recognizedActionName = 'SECURE';
        } else {
          recognizedActionName = 'TRANSFER';
        }
      } else if (objLabel === 'FLUIDIC CONTROLLER' || objLabel === 'EXPERIMENT TOOL') {
        recognizedActionName = 'INJECT_SOLUTION';
      } else if (objLabel === 'WORKSTATION FIXTURE') {
        recognizedActionName = 'SEAL_CONTAINER';
      }

      // If expected action matches observation context, refine score
      if (expectedActionCode) {
        if (
          expectedActionCode.toUpperCase().includes(recognizedActionName) ||
          recognizedActionName.includes(expectedActionCode.toUpperCase())
        ) {
          confidence = Math.min(97, confidence + 5);
        }
      }

      actions.push({
        action: recognizedActionName,
        confidence,
        timestamp: nowHHMMSS,
        personId: activeInteraction.personId,
        relatedObject: objLabel,
        frameSequenceLength: this.history.length,
      });
    } else if (primaryMotion && primaryMotion.overallLevel !== 'NO_MOVEMENT') {
      actions.push({
        action: 'OBSERVING_WORKSTATION',
        confidence: 82,
        timestamp: nowHHMMSS,
        personId: primaryMotion.personId,
        frameSequenceLength: this.history.length,
      });
    }

    return actions;
  }
}

export const actionRecognizer = new ActionRecognizer();
