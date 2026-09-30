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

export interface PersonDetection {
  id: string; // e.g. "Person #01"
  trackingId: number;
  box: BoundingBox;
  confidence: number; // 0..100 actual inference score
  isPrimary: boolean;
  trackingState: 'ACTIVE' | 'LOST' | 'SEARCHING';
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
}

export interface InteractionResult {
  personId: string;
  hand?: 'LEFT' | 'RIGHT';
  objectId: string;
  objectLabel: string;
  type: 'NEAR' | 'TOUCHING' | 'HOLDING' | 'MOVING' | 'POSITIONING';
  confidence: number; // derived from spatial overlap & motion vector correlation
  spatialDistance: number;
}

export interface ActionResult {
  action: string;
  confidence: number;
  timestamp: string;
  personId: string;
  relatedObject?: string;
  frameSequenceLength: number;
}

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
  showROI: boolean;
}
