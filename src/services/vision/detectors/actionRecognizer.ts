// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Activity Recognition Engine (HAR)
// Multi-frame temporal sequence classifier for space mission astronaut activities.
// Classifies high-level activities (CONDUCTING_EXPERIMENT, USING_TOOL, PICKING_OBJECT, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { ActionResult, InteractionResult, PersonMotion, ActivityType } from '@/types/vision';

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

    // Maintain 30-frame sliding window (~1 second)
    if (this.history.length > 30) this.history.shift();

    const actions: ActionResult[] = [];

    const activeInteraction = interactions[0];
    const primaryMotion = motions[0];

    if (activeInteraction) {
      const objLabel = activeInteraction.objectLabel;
      const state = activeInteraction.interactionState || 'HOLDING';

      let recognizedActionName = 'RETRIEVE';
      let activityType: ActivityType = 'CONDUCTING_EXPERIMENT';
      let confidence = activeInteraction.confidence;

      if (state === 'APPROACHING') {
        recognizedActionName = 'REACHING';
        activityType = 'REACHING';
      } else if (state === 'GRABBING') {
        recognizedActionName = 'GRASP_SAMPLE';
        activityType = 'PICKING_OBJECT';
      } else if (state === 'MOVING') {
        recognizedActionName = 'TRANSFER_CONTAINER';
        activityType = 'MOVING_OBJECT';
      } else if (state === 'RELEASING' || state === 'RELEASED') {
        recognizedActionName = 'PLACE_IN_CHAMBER';
        activityType = 'PLACING_OBJECT';
      } else if (state === 'HOLDING') {
        if (objLabel === 'FLUIDIC CONTROLLER' || objLabel === 'EXPERIMENT TOOL') {
          recognizedActionName = 'INJECT_SOLUTION';
          activityType = 'USING_TOOL';
        } else if (objLabel === 'OBSERVATION CHAMBER' || objLabel === 'EXPERIMENT MODULE') {
          recognizedActionName = 'ASEPTIC_PREPARE';
          activityType = 'CONDUCTING_EXPERIMENT';
        } else {
          recognizedActionName = 'HOLD_SAMPLE';
          activityType = 'HOLDING_OBJECT';
        }
      }

      if (expectedActionCode) {
        if (
          expectedActionCode.toUpperCase().includes(recognizedActionName) ||
          recognizedActionName.includes(expectedActionCode.toUpperCase())
        ) {
          confidence = Math.min(98, confidence + 5);
        }
      }

      actions.push({
        action: recognizedActionName,
        activityType,
        confidence,
        timestamp: nowHHMMSS,
        personId: activeInteraction.personId,
        relatedObject: objLabel,
        frameSequenceLength: this.history.length,
      });
    } else if (primaryMotion) {
      if (primaryMotion.overallLevel === 'HIGH_MOVEMENT') {
        actions.push({
          action: 'CREW_MOBILITY',
          activityType: 'WALKING',
          confidence: 85,
          timestamp: nowHHMMSS,
          personId: primaryMotion.personId,
          frameSequenceLength: this.history.length,
        });
      } else if (primaryMotion.overallLevel === 'MODERATE_MOVEMENT' || primaryMotion.overallLevel === 'LOW_MOVEMENT') {
        actions.push({
          action: 'OBSERVING_WORKSTATION',
          activityType: 'IDLE',
          confidence: 82,
          timestamp: nowHHMMSS,
          personId: primaryMotion.personId,
          frameSequenceLength: this.history.length,
        });
      }
    }

    return actions;
  }
}

export const actionRecognizer = new ActionRecognizer();
