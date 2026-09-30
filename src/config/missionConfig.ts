// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Mission & Spatial Zone Configuration
// Defines spatial zone boundaries, predefined mission task procedures,
// and default overlay visualization settings.
// ─────────────────────────────────────────────────────────────────────────────

import type { SpatialZone, MissionTask, VisionOverlaySettings } from '@/types/vision';

/**
 * Standard spatial zones defined in normalized relative coordinates (0..1)
 */
export const DEFAULT_SPATIAL_ZONES: SpatialZone[] = [
  {
    id: 'ZONE_WORKSTATION',
    name: 'Workstation Alpha',
    type: 'WORKSTATION',
    normalizedBox: { x: 0.05, y: 0.50, width: 0.40, height: 0.45 },
    color: '#3B82F6', // Blue
    description: 'Primary operator console for procedure execution & telemetry monitoring.',
    allowedEntities: ['Person #01', 'WORKSTATION FIXTURE', 'PROCEDURE LOG', 'IMAGING UNIT'],
  },
  {
    id: 'ZONE_EXPERIMENT',
    name: 'Payload Experiment Bench',
    type: 'EXPERIMENT_AREA',
    normalizedBox: { x: 0.48, y: 0.45, width: 0.48, height: 0.50 },
    color: '#10B981', // Emerald
    description: 'Microgravity biology and fluid physics experiment staging area.',
    allowedEntities: ['Person #01', 'SAMPLE CONTAINER', 'OBSERVATION CHAMBER', 'EXPERIMENT MODULE', 'EXPERIMENT TOOL'],
  },
  {
    id: 'ZONE_CREW',
    name: 'Crew Operator Corridor',
    type: 'CREW_AREA',
    normalizedBox: { x: 0.15, y: 0.05, width: 0.45, height: 0.42 },
    color: '#8B5CF6', // Purple
    description: 'Astronaut mobility and observation zone.',
    allowedEntities: ['Person #01', 'Person #02'],
  },
  {
    id: 'ZONE_AIRLOCK',
    name: 'Airlock Safety Boundary',
    type: 'AIRLOCK_SAFETY',
    normalizedBox: { x: 0.65, y: 0.05, width: 0.32, height: 0.38 },
    color: '#EF4444', // Red
    description: 'Restricted pressure boundary zone requiring authorization.',
    allowedEntities: ['Person #01'],
  },
];

/**
 * Pre-configured Space Mission Procedures (JSON Format)
 */
export const PREDEFINED_MISSION_TASKS: MissionTask[] = [
  {
    taskId: 'TASK-EXP-01',
    name: 'Biological Sample Inoculation Procedure',
    category: 'EXPERIMENT',
    currentStepIndex: 0,
    status: 'NOT_STARTED',
    overallProgress: 0,
    confidenceScore: 94,
    elapsedTimeSec: 0,
    steps: [
      {
        stepId: 'STEP-1',
        stepNumber: 1,
        title: 'Approach Experiment Bench',
        description: 'Position astronaut operator within Payload Experiment Bench zone.',
        targetZone: 'ZONE_EXPERIMENT',
        status: 'PENDING',
        progress: 0,
      },
      {
        stepId: 'STEP-2',
        stepNumber: 2,
        title: 'Retrieve Sample Container',
        description: 'Initiate hand contact and hold Sample Container vial.',
        targetObject: 'SAMPLE CONTAINER',
        requiredInteraction: 'HOLDING',
        status: 'PENDING',
        progress: 0,
      },
      {
        stepId: 'STEP-3',
        stepNumber: 3,
        title: 'Insert into Observation Chamber',
        description: 'Move sample container into the Observation Chamber aperture.',
        targetObject: 'OBSERVATION CHAMBER',
        requiredAction: 'ASEPTIC_PREPARE',
        requiredInteraction: 'MOVING',
        status: 'PENDING',
        progress: 0,
      },
      {
        stepId: 'STEP-4',
        stepNumber: 4,
        title: 'Secure & Lock Module',
        description: 'Release sample and confirm closure of experiment chamber.',
        targetObject: 'EXPERIMENT MODULE',
        requiredInteraction: 'RELEASED',
        status: 'PENDING',
        progress: 0,
      },
    ],
  },
  {
    taskId: 'TASK-MAINT-02',
    name: 'Fluidic Controller Inspection & Calibration',
    category: 'MAINTENANCE',
    currentStepIndex: 0,
    status: 'NOT_STARTED',
    overallProgress: 0,
    confidenceScore: 91,
    elapsedTimeSec: 0,
    steps: [
      {
        stepId: 'STEP-1',
        stepNumber: 1,
        title: 'Enter Workstation Alpha',
        description: 'Operator enters Workstation Alpha zone.',
        targetZone: 'ZONE_WORKSTATION',
        status: 'PENDING',
        progress: 0,
      },
      {
        stepId: 'STEP-2',
        stepNumber: 2,
        title: 'Grasp Calibration Tool',
        description: 'Grasp Fluidic Controller or Experiment Tool.',
        targetObject: 'FLUIDIC CONTROLLER',
        requiredInteraction: 'HOLDING',
        status: 'PENDING',
        progress: 0,
      },
      {
        stepId: 'STEP-3',
        stepNumber: 3,
        title: 'Execute Calibration Injection',
        description: 'Align tool with Workstation Fixture and hold for 3 seconds.',
        targetObject: 'WORKSTATION FIXTURE',
        requiredAction: 'INJECT_SOLUTION',
        minDurationSec: 3,
        status: 'PENDING',
        progress: 0,
      },
    ],
  },
  {
    taskId: 'TASK-SAFETY-03',
    name: 'Airlock Safety Protocol Verification',
    category: 'SAFETY',
    currentStepIndex: 0,
    status: 'NOT_STARTED',
    overallProgress: 0,
    confidenceScore: 98,
    elapsedTimeSec: 0,
    steps: [
      {
        stepId: 'STEP-1',
        stepNumber: 1,
        title: 'Inspect Airlock Boundary',
        description: 'Approach Airlock Safety Boundary zone to inspect hatch seals.',
        targetZone: 'ZONE_AIRLOCK',
        status: 'PENDING',
        progress: 0,
      },
      {
        stepId: 'STEP-2',
        stepNumber: 2,
        title: 'Verify Imaging Unit Diagnostics',
        description: 'Interact with Imaging Unit diagnostic sensor.',
        targetObject: 'IMAGING UNIT',
        requiredInteraction: 'CONTACT',
        status: 'PENDING',
        progress: 0,
      },
      {
        stepId: 'STEP-3',
        stepNumber: 3,
        title: 'Return to Operator Station',
        description: 'Vacate Airlock Zone and return to Workstation Alpha.',
        targetZone: 'ZONE_WORKSTATION',
        status: 'PENDING',
        progress: 0,
      },
    ],
  },
];

/**
 * Default visual overlay toggles
 */
export const DEFAULT_OVERLAY_SETTINGS: VisionOverlaySettings = {
  showPersonBoxes: true,
  showPoseSkeleton: true,
  showHands: true,
  showObjects: true,
  showTracking: true,
  showMotionVectors: false,
  showInteractions: true,
  showZones: true,
  showTrajectories: true,
  showTaskHUD: true,
  showAnomalies: true,
  showROI: false,
};
