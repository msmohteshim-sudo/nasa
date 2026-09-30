// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Real-Time Vision & AI Perception Data Types
// AI Human Activity Recognition for On-board BAS Experiments
// ─────────────────────────────────────────────────────────────────────────────

export type VisionMode = 'STANDARD' | 'BALANCED' | 'MAXIMUM';

export interface BoundingBox {
  x: number; // pixel or 0..1 relative
  y: number;
  width: number;
  height: number;
}

export interface Landmark {
  name: string;
  x: number; // 0..1 or pixel relative
  y: number;
  z?: number;
  score: number; // actual model confidence
}

export type MovementLevel = 'NO_MOVEMENT' | 'LOW_MOVEMENT' | 'MODERATE_MOVEMENT' | 'HIGH_MOVEMENT';

export type HeadOrientation = 'LOOKING_FORWARD' | 'LOOKING_LEFT' | 'LOOKING_RIGHT' | 'LOOKING_UP' | 'LOOKING_DOWN';

export type TrackState = 'NEW' | 'ACTIVE' | 'OCCLUDED' | 'RECOVERED' | 'LOST';

export interface TrackHistoryPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface PersonDetection {
  id: string; // e.g. "Person #01"
  trackingId: number;
  box: BoundingBox;
  confidence: number; // 0..100 actual inference score
  isPrimary: boolean;
  trackingState: 'ACTIVE' | 'LOST' | 'SEARCHING';
  trackState?: TrackState;
  trajectory?: TrackHistoryPoint[];
  velocity?: { dx: number; dy: number };
  currentZone?: string;
}

export interface PoseLandmarks {
  personId: string;
  confidence: number;
  landmarks: Landmark[];
  totalLandmarks: number;
  visibleCount: number;
  regions: {
    head: Landmark[];
    shoulders: Landmark[];
    arms: Landmark[];
    hands: Landmark[];
    torso: Landmark[];
    legs: Landmark[];
  };
}

export interface HandDetection {
  hand: 'LEFT' | 'RIGHT';
  personId?: string;
  confidence: number;
  box: BoundingBox;
  landmarks: Landmark[];
  isDetected: boolean;
  wristPosition?: { x: number; y: number };
}

export interface FaceAnalysis {
  personId: string;
  box?: BoundingBox;
  confidence: number;
  orientation: HeadOrientation;
  landmarksCount: number;
}

export interface BodyPartMotion {
  partName: string; // "Head", "Left Arm", "Right Arm", "Left Hand", "Right Hand", "Torso", "Left Leg", "Right Leg"
  magnitude: number; // 0..100 normalized displacement metric
  level: MovementLevel;
}

export interface PersonMotion {
  personId: string;
  overallLevel: MovementLevel;
  confidence: number; // motion estimation confidence score
  displacementVelocity: number;
  regions: BodyPartMotion[];
}

export interface ObjectDetection {
  id: string;
  label: string; // "EXPERIMENT MODULE", "SAMPLE CONTAINER", "OBSERVATION CHAMBER", "IMAGING UNIT", "WORKSTATION FIXTURE", "EXPERIMENT TOOL", "WORKSTATION"
  confidence: number; // actual score 0..100
  box: BoundingBox;
  trackingId?: string;
  trackState?: TrackState;
  trajectory?: TrackHistoryPoint[];
  velocity?: { dx: number; dy: number };
  isSimulated?: boolean;
  currentZone?: string;
  firstSeenMs?: number;
  lastSeenMs?: number;
}

export type DetailedInteractionState =
  | 'NO_INTERACTION'
  | 'APPROACHING'
  | 'CONTACT'
  | 'GRABBING'
  | 'HOLDING'
  | 'MOVING'
  | 'RELEASING'
  | 'RELEASED';

export interface InteractionResult {
  personId: string;
  hand?: 'LEFT' | 'RIGHT';
  objectId: string;
  objectLabel: string;
  type: 'NEAR' | 'TOUCHING' | 'HOLDING' | 'MOVING' | 'POSITIONING';
  interactionState?: DetailedInteractionState;
  confidence: number; // derived from spatial overlap & motion vector correlation
  spatialDistance: number;
  durationMs?: number;
}

export type ActivityType =
  | 'WALKING'
  | 'REACHING'
  | 'PICKING_OBJECT'
  | 'HOLDING_OBJECT'
  | 'PLACING_OBJECT'
  | 'MOVING_OBJECT'
  | 'USING_TOOL'
  | 'CONDUCTING_EXPERIMENT'
  | 'IDLE'
  | 'UNKNOWN';

export interface ActionResult {
  action: string;
  activityType?: ActivityType;
  confidence: number;
  timestamp: string;
  personId: string;
  relatedObject?: string;
  frameSequenceLength: number;
}

// ───────────── SPATIAL ZONE REASONING ─────────────

export type SpatialZoneType = 'CREW_AREA' | 'EXPERIMENT_AREA' | 'WORKSTATION' | 'STORAGE' | 'AIRLOCK_SAFETY';

export interface SpatialZone {
  id: string;
  name: string;
  type: SpatialZoneType;
  normalizedBox: BoundingBox; // 0..1 coordinate system relative to video
  color: string; // Hex color code for rendering
  description: string;
  allowedEntities?: string[];
}

export interface ZoneOccupancy {
  zoneId: string;
  zoneName: string;
  personIds: string[];
  objectIds: string[];
  occupantCount: number;
  lastChangedMs: number;
}

// ───────────── MISSION TASK & ANOMALY ENGINE ─────────────

export type TaskStepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
export type MissionTaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'ABORTED';

export interface MissionTaskStep {
  stepId: string;
  stepNumber: number;
  title: string;
  description: string;
  targetZone?: string;
  targetObject?: string;
  requiredAction?: string;
  requiredInteraction?: DetailedInteractionState;
  minDurationSec?: number;
  status: TaskStepStatus;
  progress: number; // 0..100
  completedAt?: string;
}

export interface MissionTask {
  taskId: string;
  name: string;
  category: 'EXPERIMENT' | 'MAINTENANCE' | 'LOGISTICS' | 'SAFETY' | 'COMMUNICATION';
  steps: MissionTaskStep[];
  currentStepIndex: number;
  status: MissionTaskStatus;
  overallProgress: number; // 0..100
  confidenceScore: number;
  startedAt?: string;
  elapsedTimeSec: number;
}

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyType =
  | 'FLOATING_OBJECT'
  | 'ZONE_VIOLATION'
  | 'TASK_DEVIATION'
  | 'INACTIVITY_ALERT'
  | 'UNEXPECTED_MOVEMENT';

export interface AnomalyEvent {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  title: string;
  message: string;
  timestamp: string;
  timestampMs: number;
  locationZone?: string;
  entityId?: string;
  resolved: boolean;
}

export type MissionEventType = 'ZONE' | 'INTERACTION' | 'TASK' | 'ANOMALY' | 'SYSTEM';

export interface MissionEvent {
  id: string;
  type: MissionEventType;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  summary: string;
  timestamp: string;
  timestampMs: number;
  details?: string;
  zoneId?: string;
  entityId?: string;
}

// ───────────── PIPELINE PERFORMANCE & OVERLAY ─────────────

export interface CameraCapabilities {
  resolutionWidth: number;
  resolutionHeight: number;
  frameRate: number;
  facingMode: string;
  aspectRatio: number;
  deviceId?: string;
  label?: string;
}

export interface VisionPerformanceMetrics {
  cameraFPS: number;
  inferenceFPS: number;
  latencyMs: number;
  frameProcessingMs: number;
  activeMode: VisionMode;
  modelStatus: {
    personDetector: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
    poseEstimator: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
    handDetector: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
    objectDetector: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
    tracker: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
    motionAnalyzer: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
    interactionAnalyzer: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
    actionRecognizer: 'ACTIVE' | 'OFFLINE' | 'UNAVAILABLE';
  };
}

export interface VisionResult {
  timestamp: number;
  formattedTime: string;
  frameId: number;
  persons: PersonDetection[];
  poses: PoseLandmarks[];
  hands: HandDetection[];
  faces: FaceAnalysis[];
  objects: ObjectDetection[];
  motions: PersonMotion[];
  interactions: InteractionResult[];
  actions: ActionResult[];
  zones?: ZoneOccupancy[];
  activeTask?: MissionTask;
  anomalies?: AnomalyEvent[];
  camera: CameraCapabilities | null;
  performance: VisionPerformanceMetrics;
  secondaryPersonPresent: boolean;
}

export interface VisionOverlaySettings {
  showPersonBoxes: boolean;
  showPoseSkeleton: boolean;
  showHands: boolean;
  showObjects: boolean;
  showTracking: boolean;
  showMotionVectors: boolean;
  showInteractions: boolean;
  showZones: boolean;
  showTrajectories: boolean;
  showTaskHUD: boolean;
  showAnomalies: boolean;
  showROI: boolean;
}

