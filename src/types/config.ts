// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Canonical System Configuration Model (AltronSystemConfig)
// Comprehensive configuration structure for camera, vision AI, procedure engine,
// voice guidance, alerts, evidence logging, privacy, performance, and developer tools.
// ─────────────────────────────────────────────────────────────────────────────

export type ConfigCategoryKey =
  | 'overview'
  | 'camera'
  | 'vision'
  | 'pose'
  | 'objects'
  | 'motion'
  | 'procedure'
  | 'experiment'
  | 'voice'
  | 'alerts'
  | 'evidence'
  | 'reports'
  | 'performance'
  | 'privacy'
  | 'accessibility'
  | 'developer'
  | 'about';

export interface AltronSystemConfig {
  camera: {
    selectedDeviceId: string;
    resolution: '640x480' | '1280x720' | '1920x1080' | 'Auto';
    targetFPS: 15 | 24 | 30 | 60;
    orientation: 'Auto' | 'Landscape' | 'Portrait';
    advancedControls: {
      exposure: string;
      whiteBalance: string;
      focus: string;
      zoom: number;
    };
  };
  vision: {
    visionMode: 'STANDARD' | 'BALANCED' | 'MAXIMUM';
    enablePersonDetection: boolean;
    enableObjectDetection: boolean;
    enablePoseEstimation: boolean;
    enableHandDetection: boolean;
    enableTracking: boolean;
    enableMotionAnalysis: boolean;
    enableActionRecognition: boolean;
    enableInteractionAnalysis: boolean;
  };
  thresholds: {
    personConfidence: number;
    objectConfidence: number;
    poseConfidence: number;
    handConfidence: number;
    actionConfidence: number;
    interactionConfidence: number;
  };
  overlays: {
    showPersonBoxes: boolean;
    showObjectBoxes: boolean;
    showPoseSkeleton: boolean;
    showHands: boolean;
    showFingerLandmarks: boolean;
    showTrackingIDs: boolean;
    showConfidenceLabels: boolean;
    showMotionVectors: boolean;
    showInteractionLines: boolean;
    showActionLabels: boolean;
    showROI: boolean;
    overlayDensity: 'Minimal' | 'Standard' | 'Detailed';
  };
  humanPose: {
    poseSmoothing: 'Low' | 'Medium' | 'High';
    skeletonDisplay: boolean;
    bodyMovementAnalysis: boolean;
  };
  hands: {
    leftHand: boolean;
    rightHand: boolean;
    fingerLandmarks: boolean;
    handTracking: boolean;
    smoothing: 'Low' | 'Medium' | 'High';
  };
  multiPerson: {
    maxPeopleTracked: number;
    primarySelection: 'Largest' | 'Closest' | 'Workspace Priority';
    secondaryWarning: boolean;
    expectedOperators: number;
  };
  objects: {
    detectionMode: 'Experiment Objects' | 'General Objects' | 'Both';
    enabledClasses: Record<string, boolean>;
  };
  tracking: {
    enabled: boolean;
    persistence: 'Short' | 'Medium' | 'Long';
    lostObjectTimeoutMs: number;
    historyLength: number;
  };
  motion: {
    enabled: boolean;
    intensityThreshold: 'Low' | 'Moderate' | 'High';
    trackDirections: boolean;
  };
  actionRecognition: {
    confidenceThreshold: number;
    temporalWindow: 'Short' | 'Medium' | 'Long';
    confirmationMode: 'Immediate' | 'Temporal confirmation';
  };
  interaction: {
    enabled: boolean;
    types: {
      near: boolean;
      touching: boolean;
      holding: boolean;
      moving: boolean;
      positioning: boolean;
    };
  };
  workspace: {
    roiEnabled: boolean;
    bounds: { x: number; y: number; width: number; height: number };
  };
  procedure: {
    verificationEnabled: boolean;
    strictSequence: boolean;
    allowStepSkipping: boolean;
    wrongActionHandling: 'Warning' | 'Block step' | 'Require confirmation';
    outOfSequenceHandling: 'Warning' | 'Block' | 'Voice warning + block';
    stepConfirmation: 'Automatic' | 'Manual';
    stepTimeoutSeconds: number;
  };
  session: {
    autoStartCamera: boolean;
    autoOpenMonitor: boolean;
    autoStartProcedure: boolean;
    pauseOnDisconnect: boolean;
    pauseOnFailure: boolean;
  };
  experiment: {
    canonicalId: string;
    version: string;
    prototypeStatus: string;
  };
  voice: {
    enabled: boolean;
    voiceURI: string;
    language: string;
    speechRate: number;
    pitch: number;
    volume: number;
    triggers: {
      start: boolean;
      verify: boolean;
      next: boolean;
      wrong: boolean;
      outOfSeq: boolean;
      completed: boolean;
      warning: boolean;
    };
  };
  alerts: {
    cameraDisconnect: boolean;
    aiUnavailable: boolean;
    wrongAction: boolean;
    outOfSequence: boolean;
    multiplePeople: boolean;
    objectMissing: boolean;
    severityLevel: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL';
  };
  evidence: {
    recordEvents: boolean;
    detailLevel: 'Minimal' | 'Standard' | 'Detailed';
    videoRecordingEnabled: boolean;
  };
  reports: {
    includedSections: {
      summary: boolean;
      timeline: boolean;
      verification: boolean;
      deviations: boolean;
      voice: boolean;
      camera: boolean;
      performance: boolean;
    };
    defaultFormat: 'JSON' | 'CSV' | 'PDF';
  };
  performance: {
    processingMode: 'Performance' | 'Balanced' | 'Quality';
    inferenceResolution: 'Auto' | 'Low' | 'Medium' | 'High';
    frameProcessing: 'Every frame' | 'Every 2 frames' | 'Every 3 frames' | 'Adaptive';
    autoOptimize: boolean;
  };
  privacy: {
    cameraProcessingLocal: boolean;
    dataRetention: 'Session only' | 'Saved locally';
    faceRecognitionEnabled: boolean;
    externalUpload: boolean;
  };
  accessibility: {
    textSize: 'Small' | 'Default' | 'Large';
    highContrast: boolean;
    reducedMotion: boolean;
    keyboardNav: boolean;
  };
  developer: {
    mockDetection: boolean;
    mockProcedureEvents: boolean;
    visionDebugOverlay: boolean;
    detectionJsonViewer: boolean;
    procedureStateViewer: boolean;
  };
}

export const DEFAULT_ALTRON_CONFIG: AltronSystemConfig = {
  camera: {
    selectedDeviceId: 'default',
    resolution: '1280x720',
    targetFPS: 30,
    orientation: 'Auto',
    advancedControls: {
      exposure: 'Auto',
      whiteBalance: 'Auto',
      focus: 'Auto',
      zoom: 1.0,
    },
  },
  vision: {
    visionMode: 'MAXIMUM',
    enablePersonDetection: true,
    enableObjectDetection: true,
    enablePoseEstimation: true,
    enableHandDetection: true,
    enableTracking: true,
    enableMotionAnalysis: true,
    enableActionRecognition: true,
    enableInteractionAnalysis: true,
  },
  thresholds: {
    personConfidence: 50,
    objectConfidence: 45,
    poseConfidence: 35,
    handConfidence: 30,
    actionConfidence: 75,
    interactionConfidence: 70,
  },
  overlays: {
    showPersonBoxes: true,
    showObjectBoxes: true,
    showPoseSkeleton: true,
    showHands: true,
    showFingerLandmarks: true,
    showTrackingIDs: true,
    showConfidenceLabels: true,
    showMotionVectors: true,
    showInteractionLines: true,
    showActionLabels: true,
    showROI: true,
    overlayDensity: 'Standard',
  },
  humanPose: {
    poseSmoothing: 'Medium',
    skeletonDisplay: true,
    bodyMovementAnalysis: true,
  },
  hands: {
    leftHand: true,
    rightHand: true,
    fingerLandmarks: true,
    handTracking: true,
    smoothing: 'Medium',
  },
  multiPerson: {
    maxPeopleTracked: 3,
    primarySelection: 'Largest',
    secondaryWarning: true,
    expectedOperators: 1,
  },
  objects: {
    detectionMode: 'Experiment Objects',
    enabledClasses: {
      'EXPERIMENT MODULE': true,
      'SAMPLE CONTAINER': true,
      'OBSERVATION CHAMBER': true,
      'IMAGING UNIT': true,
      'WORKSTATION FIXTURE': true,
      'EXPERIMENT TOOL': true,
      'WORKSTATION': true,
    },
  },
  tracking: {
    enabled: true,
    persistence: 'Medium',
    lostObjectTimeoutMs: 1500,
    historyLength: 30,
  },
  motion: {
    enabled: true,
    intensityThreshold: 'Low',
    trackDirections: true,
  },
  actionRecognition: {
    confidenceThreshold: 75,
    temporalWindow: 'Medium',
    confirmationMode: 'Temporal confirmation',
  },
  interaction: {
    enabled: true,
    types: {
      near: true,
      touching: true,
      holding: true,
      moving: true,
      positioning: true,
    },
  },
  workspace: {
    roiEnabled: true,
    bounds: { x: 0.15, y: 0.35, width: 0.7, height: 0.6 },
  },
  procedure: {
    verificationEnabled: true,
    strictSequence: true,
    allowStepSkipping: false,
    wrongActionHandling: 'Warning',
    outOfSequenceHandling: 'Voice warning + block',
    stepConfirmation: 'Automatic',
    stepTimeoutSeconds: 300,
  },
  session: {
    autoStartCamera: false,
    autoOpenMonitor: false,
    autoStartProcedure: false,
    pauseOnDisconnect: true,
    pauseOnFailure: true,
  },
  experiment: {
    canonicalId: 'EXP-BIO-04',
    version: 'v2.4-PROTOTYPE',
    prototypeStatus: 'Research & Verification System',
  },
  voice: {
    enabled: false,
    voiceURI: 'default',
    language: 'en-US',
    speechRate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    triggers: {
      start: true,
      verify: true,
      next: true,
      wrong: true,
      outOfSeq: true,
      completed: true,
      warning: true,
    },
  },
  alerts: {
    cameraDisconnect: true,
    aiUnavailable: true,
    wrongAction: true,
    outOfSequence: true,
    multiplePeople: true,
    objectMissing: true,
    severityLevel: 'NOTICE',
  },
  evidence: {
    recordEvents: true,
    detailLevel: 'Standard',
    videoRecordingEnabled: false,
  },
  reports: {
    includedSections: {
      summary: true,
      timeline: true,
      verification: true,
      deviations: true,
      voice: true,
      camera: true,
      performance: true,
    },
    defaultFormat: 'JSON',
  },
  performance: {
    processingMode: 'Balanced',
    inferenceResolution: 'Medium',
    frameProcessing: 'Adaptive',
    autoOptimize: true,
  },
  privacy: {
    cameraProcessingLocal: true,
    dataRetention: 'Session only',
    faceRecognitionEnabled: false, // HARD RULE: Always false
    externalUpload: false, // HARD RULE: Always false
  },
  accessibility: {
    textSize: 'Default',
    highContrast: false,
    reducedMotion: false,
    keyboardNav: true,
  },
  developer: {
    mockDetection: false,
    mockProcedureEvents: true,
    visionDebugOverlay: false,
    detectionJsonViewer: true,
    procedureStateViewer: true,
  },
};
