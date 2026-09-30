// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Demo Scenario Simulation Engine
// Generates realistic synthetic frame telemetry for 7 pre-configured space mission scenarios
// allowing full end-to-end simulation of mission tasks, microgravity floating objects,
// zone breaches, and interaction state progression without physical camera input.
// ─────────────────────────────────────────────────────────────────────────────

import type { VisionResult, BoundingBox } from '@/types/vision';
import { zoneEngine } from '@/services/vision/zoneEngine';
import { taskEngine } from './taskEngine';
import { anomalyEngine } from './anomalyEngine';
import { eventLogService } from './eventLog';

export interface DemoScenario {
  id: string;
  title: string;
  category: 'EXPERIMENT' | 'SAFETY' | 'MAINTENANCE' | 'ANOMALY' | 'MULTI_CREW';
  description: string;
  taskId?: string;
  durationSec: number;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'SCENARIO_EXP_RUN',
    title: 'Biological Sample Inoculation Procedure',
    category: 'EXPERIMENT',
    description: 'Complete 4-step experiment procedure execution with sample container handling and chamber insertion.',
    taskId: 'TASK-EXP-01',
    durationSec: 25,
  },
  {
    id: 'SCENARIO_FLOATING_OBJECT',
    title: 'Microgravity Floating Object Anomaly',
    category: 'ANOMALY',
    description: 'Simulates an unsecured Fluidic Controller floating across the cabin in microgravity.',
    durationSec: 15,
  },
  {
    id: 'SCENARIO_AIRLOCK_SAFETY',
    title: 'Airlock Safety Zone Breach',
    category: 'SAFETY',
    description: 'Operator strays into restricted Airlock Safety Boundary without EVA clearance.',
    taskId: 'TASK-SAFETY-03',
    durationSec: 20,
  },
  {
    id: 'SCENARIO_FLUIDIC_CALIBRATION',
    title: 'Fluidic Controller Maintenance',
    category: 'MAINTENANCE',
    description: 'Grasping maintenance tool and executing calibration injection at Workstation Alpha.',
    taskId: 'TASK-MAINT-02',
    durationSec: 20,
  },
  {
    id: 'SCENARIO_MULTI_CREW',
    title: 'Multi-Crew Cooperative Operations',
    category: 'MULTI_CREW',
    description: 'Simultaneous tracking of Person #01 at Workstation and Person #02 at Payload Bench.',
    durationSec: 20,
  },
  {
    id: 'SCENARIO_SAMPLE_HANDLING',
    title: 'Precision Microgravity Sample Transfer',
    category: 'EXPERIMENT',
    description: 'Hand-object interaction state machine progression: APPROACHING -> CONTACT -> GRABBING -> HOLDING -> MOVING -> RELEASED.',
    durationSec: 18,
  },
  {
    id: 'SCENARIO_INACTIVITY',
    title: 'Operator Inactivity & Vigilance Alert',
    category: 'ANOMALY',
    description: 'Operator stops moving during active procedure, triggering system vigilance warning.',
    durationSec: 15,
  },
];

export class DemoScenarioService {
  private activeScenarioId: string | null = null;
  private scenarioStartMs: number = 0;

  isDemoActive(): boolean {
    return this.activeScenarioId !== null;
  }

  getActiveScenario(): DemoScenario | null {
    if (!this.activeScenarioId) return null;
    return DEMO_SCENARIOS.find((s) => s.id === this.activeScenarioId) || null;
  }

  startScenario(scenarioId: string): void {
    const found = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!found) return;

    this.activeScenarioId = scenarioId;
    this.scenarioStartMs = Date.now();

    if (found.taskId) {
      taskEngine.selectTask(found.taskId);
      taskEngine.startTask();
    }

    eventLogService.addEvent({
      type: 'SYSTEM',
      severity: 'INFO',
      summary: `Started Demo Scenario: ${found.title}`,
      details: found.description,
    });
  }

  stopScenario(): void {
    if (this.activeScenarioId) {
      eventLogService.addEvent({
        type: 'SYSTEM',
        severity: 'INFO',
        summary: 'Demo Scenario Stopped — Returned to Live Video Pipeline',
      });
    }
    this.activeScenarioId = null;
  }

  /**
   * Generate synthetic frame packet matching active scenario phase
   */
  generateScenarioFrame(frameId: number, frameW = 640, frameH = 480): VisionResult {
    const elapsedSec = (Date.now() - this.scenarioStartMs) / 1000;
    const nowHHMMSS = new Date().toLocaleTimeString('en-GB', { hour12: false });

    let personX = 0.25;
    let personY = 0.35;
    let handX = 0.32;
    let handY = 0.50;
    let objX = 0.55;
    let objY = 0.60;
    let objVx = 0;
    let objVy = 0;
    let secondaryPerson = false;
    let handState: any = 'APPROACHING';

    const scenarioId = this.activeScenarioId;

    if (scenarioId === 'SCENARIO_EXP_RUN') {
      if (elapsedSec < 6) {
        personX = 0.55; personY = 0.40; // Payload bench
        handX = 0.52; handY = 0.65;
        objX = 0.58; objY = 0.68;
        handState = 'APPROACHING';
      } else if (elapsedSec < 12) {
        personX = 0.55; personY = 0.40;
        handX = 0.58; handY = 0.68;
        objX = 0.58; objY = 0.68;
        handState = 'GRABBING';
      } else if (elapsedSec < 18) {
        personX = 0.55; personY = 0.40;
        handX = 0.62; handY = 0.55;
        objX = 0.62; objY = 0.55;
        handState = 'MOVING';
      } else {
        personX = 0.55; personY = 0.40;
        handX = 0.65; handY = 0.52;
        objX = 0.65; objY = 0.52;
        handState = 'RELEASED';
      }
    } else if (scenarioId === 'SCENARIO_FLOATING_OBJECT') {
      personX = 0.20; personY = 0.40;
      handX = 0.25; handY = 0.50;
      // Object drifting diagonally across frame
      objX = 0.40 + (elapsedSec * 0.03) % 0.45;
      objY = 0.20 + (elapsedSec * 0.02) % 0.40;
      objVx = 4.2;
      objVy = 2.8;
      handState = 'NO_INTERACTION';
    } else if (scenarioId === 'SCENARIO_AIRLOCK_SAFETY') {
      // Person walks into airlock zone
      personX = 0.70; personY = 0.15;
      handX = 0.75; handY = 0.25;
      objX = 0.50; objY = 0.60;
      handState = 'NO_INTERACTION';
    } else if (scenarioId === 'SCENARIO_MULTI_CREW') {
      personX = 0.20; personY = 0.40;
      secondaryPerson = true;
    }

    const pBox: BoundingBox = {
      x: Math.round(personX * frameW),
      y: Math.round(personY * frameH),
      width: Math.round(0.25 * frameW),
      height: Math.round(0.55 * frameH),
    };

    const oBox: BoundingBox = {
      x: Math.round(objX * frameW),
      y: Math.round(objY * frameH),
      width: Math.round(0.12 * frameW),
      height: Math.round(0.15 * frameH),
    };

    const hBox: BoundingBox = {
      x: Math.round(handX * frameW),
      y: Math.round(handY * frameH),
      width: Math.round(0.08 * frameW),
      height: Math.round(0.08 * frameH),
    };

    const persons = [
      {
        id: 'Person #01',
        trackingId: 1,
        box: pBox,
        confidence: 96,
        isPrimary: true,
        trackingState: 'ACTIVE' as const,
        trackState: 'ACTIVE' as const,
        trajectory: [{ x: pBox.x + pBox.width / 2, y: pBox.y + pBox.height / 2, timestamp: Date.now() }],
        velocity: { dx: 0.5, dy: 0 },
      },
    ];

    if (secondaryPerson) {
      persons.push({
        id: 'Person #02',
        trackingId: 2,
        box: { x: Math.round(0.60 * frameW), y: Math.round(0.35 * frameH), width: Math.round(0.22 * frameW), height: Math.round(0.50 * frameH) },
        confidence: 93,
        isPrimary: false,
        trackingState: 'ACTIVE' as const,
        trackState: 'ACTIVE' as const,
        trajectory: [],
        velocity: { dx: 0, dy: 0 },
      });
    }

    const objects = [
      {
        id: 'obj-sim-1',
        label: scenarioId === 'SCENARIO_FLOATING_OBJECT' ? 'FLUIDIC CONTROLLER' : 'SAMPLE CONTAINER',
        confidence: 94,
        box: oBox,
        trackingId: 'OBJ-01',
        trackState: 'ACTIVE' as const,
        velocity: { dx: objVx, dy: objVy },
        isSimulated: true,
      },
    ];

    const hands = [
      {
        hand: 'RIGHT' as const,
        personId: 'Person #01',
        confidence: 92,
        box: hBox,
        landmarks: [],
        isDetected: true,
        wristPosition: { x: hBox.x, y: hBox.y },
      },
    ];

    const motions = [
      {
        personId: 'Person #01',
        overallLevel: 'MODERATE_MOVEMENT' as const,
        confidence: 88,
        displacementVelocity: 2.1,
        regions: [],
      },
    ];

    const interactions = handState !== 'NO_INTERACTION'
      ? [
          {
            personId: 'Person #01',
            hand: 'RIGHT' as const,
            objectId: 'obj-sim-1',
            objectLabel: objects[0].label,
            type: handState === 'MOVING' ? ('MOVING' as const) : handState === 'GRABBING' || handState === 'HOLDING' ? ('HOLDING' as const) : ('NEAR' as const),
            interactionState: handState,
            confidence: 90,
            spatialDistance: Math.round(Math.hypot(hBox.x - oBox.x, hBox.y - oBox.y)),
          },
        ]
      : [];

    const actions = [
      {
        action: handState === 'MOVING' ? 'TRANSFER_CONTAINER' : 'ASEPTIC_PREPARE',
        activityType: 'CONDUCTING_EXPERIMENT' as const,
        confidence: 89,
        timestamp: nowHHMMSS,
        personId: 'Person #01',
        relatedObject: objects[0].label,
        frameSequenceLength: 20,
      },
    ];

    const zoneResult = zoneEngine.processZones(persons, objects, frameW, frameH);
    const taskEval = taskEngine.evaluateFrame(persons, objects, interactions, actions, zoneResult.zoneOccupancies);

    const anomalies = anomalyEngine.evaluateAnomalies(
      persons,
      objects,
      interactions,
      zoneResult.zoneOccupancies,
      zoneEngine.getZones(),
      taskEval.updatedTask
    );

    return {
      timestamp: Date.now(),
      formattedTime: nowHHMMSS,
      frameId,
      persons: zoneResult.updatedPersons,
      poses: [],
      hands,
      faces: [],
      objects: zoneResult.updatedObjects,
      motions,
      interactions,
      actions,
      zones: zoneResult.zoneOccupancies,
      activeTask: taskEval.updatedTask,
      anomalies,
      camera: null,
      performance: {
        cameraFPS: 30,
        inferenceFPS: 24,
        latencyMs: 18,
        frameProcessingMs: 14,
        activeMode: 'MAXIMUM',
        modelStatus: {
          personDetector: 'ACTIVE',
          poseEstimator: 'ACTIVE',
          handDetector: 'ACTIVE',
          objectDetector: 'ACTIVE',
          tracker: 'ACTIVE',
          motionAnalyzer: 'ACTIVE',
          interactionAnalyzer: 'ACTIVE',
          actionRecognizer: 'ACTIVE',
        },
      },
      secondaryPersonPresent: secondaryPerson,
    };
  }
}

export const demoScenarioService = new DemoScenarioService();
