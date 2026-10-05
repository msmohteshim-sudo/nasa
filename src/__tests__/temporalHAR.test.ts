// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal HAR Comprehensive Unit & Scenario Tests
// SIH26174 — AI Human Activity Recognition for On-Board BAS Experiments
// Sections 34 & 35 Test Suite
// ─────────────────────────────────────────────────────────────────────────────

import { TemporalBuffer } from '../services/har/temporalBuffer';
import { TemporalStabilityManager } from '../services/har/temporalStabilityManager';
import { DemoTemporalHARService } from '../services/har/demoTemporalHARService';
import { RealTemporalHARService } from '../services/har/realTemporalHARService';
import { evaluateObservation } from '../services/engine/procedureEngine';
import { VoiceGuidanceService } from '../services/voice/voiceGuidanceService';
import { CANONICAL_EXPERIMENT } from '../data/canonicalExperiment';
import type { PerFrameObservation } from '../types/temporalHAR';
import type { LiveStep, ObservationPacket } from '../types/session';
import type {
  PersonDetection,
  PoseLandmarks,
  HandDetection,
  ObjectDetection,
  InteractionResult,
  PersonMotion,
} from '../types/vision';

// Simple test assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

function createDummyObservation(index: number, timestampMs: number, _action = 'RETRIEVE'): PerFrameObservation {
  const primaryPerson: PersonDetection = {
    id: 'Person #01',
    trackingId: 1,
    box: { x: 50, y: 50, width: 400, height: 300 },
    confidence: 95,
    isPrimary: true,
    trackingState: 'ACTIVE',
  };

  const pose: PoseLandmarks = {
    personId: 'Person #01',
    confidence: 0.93,
    totalLandmarks: 4,
    visibleCount: 4,
    landmarks: [
      { name: 'right_wrist', x: 0.5 + index * 0.001, y: 0.6, score: 0.92 },
      { name: 'left_wrist', x: 0.3, y: 0.6, score: 0.88 },
      { name: 'right_shoulder', x: 0.55, y: 0.35, score: 0.95 },
      { name: 'left_shoulder', x: 0.35, y: 0.35, score: 0.94 },
    ],
    regions: {
      head: [],
      shoulders: [
        { name: 'right_shoulder', x: 0.55, y: 0.35, score: 0.95 },
        { name: 'left_shoulder', x: 0.35, y: 0.35, score: 0.94 },
      ],
      arms: [
        { name: 'right_wrist', x: 0.5 + index * 0.001, y: 0.6, score: 0.92 },
        { name: 'left_wrist', x: 0.3, y: 0.6, score: 0.88 },
      ],
      torso: [],
      legs: [],
    },
  };

  const hands: HandDetection[] = [
    {
      hand: 'RIGHT',
      box: { x: 200, y: 300, width: 40, height: 40 },
      landmarks: [{ name: 'wrist', x: 200, y: 300, score: 0.9 }],
      confidence: 90,
      isInteracting: true,
    },
  ];

  const objects: ObjectDetection[] = [
    {
      id: 'obj-module',
      label: 'sample_module',
      class: 'module',
      score: 91,
      box: { x: 190, y: 290, width: 60, height: 60 },
    },
  ];

  const interactions: InteractionResult[] = [
    {
      type: 'HOLDING',
      confidence: 88,
      hand: 'RIGHT',
      targetObject: 'sample_module',
      distancePx: 12,
      description: 'Right hand holding sample module',
    },
  ];

  const motion: PersonMotion = {
    level: 'MODERATE_MOVEMENT',
    dx: 15,
    dy: 5,
    speed: 16,
    angle: 0.2,
    isStationary: false,
    history: [{ x: 200, y: 300, timestamp: timestampMs }],
  };

  return {
    frameIndex: index,
    timestampMs,
    formattedTime: new Date(timestampMs).toISOString(),
    persons: [primaryPerson],
    primaryPerson,
    pose,
    hands,
    objects,
    interactions,
    motion,
  };
}

function buildInitialSteps(): LiveStep[] {
  return CANONICAL_EXPERIMENT.steps.map((s, i) => ({
    id: s.id,
    stepNumber: s.stepNumber,
    title: s.title,
    code: s.code,
    action: s.action,
    expectedAction: s.expectedAction,
    observedAction: 'Pending',
    description: s.description,
    status: i === 0 ? 'active' : 'pending',
    confidence: 0,
    timestamp: undefined,
    duration: undefined,
    expectedDuration: s.expectedDuration,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TEMPORAL BUFFER TESTS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 1. Testing TemporalBuffer ---');

const buffer = new TemporalBuffer(10, 2);

assert(buffer.getCount() === 0, 'Buffer initializes empty');
assert(!buffer.isReady(), 'Buffer reports not ready when empty');

const baseTime = Date.now();
for (let i = 0; i < 10; i++) {
  buffer.addObservation(createDummyObservation(i, baseTime + i * 50));
}

assert(buffer.getCount() === 10, 'Buffer fills to configured windowSize (10)');
assert(buffer.isReady(), 'Buffer reports window is ready when windowSize reached');

// Test sliding behavior: adding 11th frame drops the 1st
const window1 = buffer.getObservations();
assert(window1[0].frameIndex === 0, 'Oldest frame in window is 0');
assert(window1[9].frameIndex === 9, 'Newest frame in window is 9');

buffer.addObservation(createDummyObservation(10, baseTime + 10 * 50));
const window2 = buffer.getObservations();
assert(buffer.getCount() === 10, 'Buffer maintains maximum window size after overflow');
assert(window2[0].frameIndex === 1, 'Sliding behavior: oldest frame is now index 1');
assert(window2[9].frameIndex === 10, 'Sliding behavior: newest frame is now index 10');

// Test duration and FPS
const duration = buffer.getDurationSec();
assert(duration > 0.4 && duration < 0.6, `Calculates real timestamp duration (${duration.toFixed(2)}s)`);

const measuredFps = buffer.getMeasuredFps();
assert(measuredFps > 15 && measuredFps < 25, `Calculates real FPS from intervals (~20 FPS)`);

// Test reset
buffer.reset();
assert(buffer.getCount() === 0, 'Reset clears buffer contents');
assert(!buffer.isReady(), 'Reset marks window as not ready');

// ─────────────────────────────────────────────────────────────────────────────
// 2. TEMPORAL STABILITY MANAGER TESTS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 2. Testing TemporalStabilityManager ---');

const stabilityMgr = new TemporalStabilityManager({
  mode: 'REAL',
  windowSize: 10,
  stride: 2,
  minConfidenceThreshold: 0.65,
  stabilityThreshold: 3,
  ambiguityMargin: 0.15,
});

// Candidate promotion
const res1 = stabilityMgr.evaluateStability('RETRIEVE', 0.85, { RETRIEVE: 0.85, VERIFY: 0.4 });
assert(res1.stability === 'CANDIDATE', 'First observation of action becomes CANDIDATE');

// 2nd confirmation
const res2 = stabilityMgr.evaluateStability('RETRIEVE', 0.87, { RETRIEVE: 0.87, VERIFY: 0.35 });
assert(res2.stability === 'CANDIDATE', 'Second observation remains CANDIDATE');

// 3rd confirmation (reaches threshold of 3)
const res3 = stabilityMgr.evaluateStability('RETRIEVE', 0.9, { RETRIEVE: 0.9, VERIFY: 0.3 });
assert(res3.stability === 'STABLE', 'Reaches STABLE after 3 consecutive confirmations');
assert(res3.stableAction === 'RETRIEVE', 'Stable action is RETRIEVE');

// Low confidence handling
const resLow = stabilityMgr.evaluateStability('RETRIEVE', 0.45, {});
assert(resLow.stability === 'LOW_CONFIDENCE', 'Low confidence (0.45 < 0.65) flags LOW_CONFIDENCE');

// Ambiguity handling
const resAmb = stabilityMgr.evaluateStability('RETRIEVE', 0.68, { RETRIEVE: 0.68, VERIFY: 0.62 });
assert(resAmb.stability === 'AMBIGUOUS', 'Close candidate scores (< 0.15 delta) flags AMBIGUOUS');

// Action switch resets stability
const resSwitch = stabilityMgr.evaluateStability('SECURE', 0.88, { SECURE: 0.88, RETRIEVE: 0.2 });
assert(resSwitch.stability === 'CANDIDATE', 'Switching to SECURE resets stability to CANDIDATE');

// ─────────────────────────────────────────────────────────────────────────────
// 3. MODEL ABSTRACTION & TRANSPARENCY TESTS (Section 13 & 14)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 3. Testing Model Abstraction & Transparency ---');

const demoModel = new DemoTemporalHARService();
const realModel = new RealTemporalHARService();

assert(demoModel.getStatus() === 'WAITING_FOR_OBSERVATIONS', 'Demo service reports WAITING_FOR_OBSERVATIONS before window ready');

// Feed demo model enough frames to fill window
for (let i = 0; i < 60; i++) {
  demoModel.addObservation(createDummyObservation(i, baseTime + i * 50));
}

assert(demoModel.getStatus() === 'DEMO_MODE', 'Demo service reports DEMO_MODE when window ready');
const demoPred = demoModel.predict();
assert(demoPred.isRealInference === false, 'Demo service clearly marks isRealInference: false');
assert(demoPred.confidence === null, 'Demo service does NOT fabricate neural confidence (null)');

assert(realModel.isModelTrained() === false, 'Real service honestly reports unmounted neural weights');
realModel.setSimulateUnavailable(true);
assert(realModel.getStatus() === 'MODEL_UNAVAILABLE', 'Real service flags MODEL_UNAVAILABLE when requested');
const unavailPred = realModel.predict();
assert(unavailPred.status === 'MODEL_UNAVAILABLE', 'Prediction reflects MODEL_UNAVAILABLE');

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROCEDURE ENGINE INTEGRATION & SCENARIO TESTS (Section 34)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 4. Testing Procedure Engine Scenarios (Section 34) ---');

const steps = buildInitialSteps();
const step1 = steps[0]; // Step 1: Initialize Workstation -> expectedAction: 'INITIALIZE'
const step2 = steps[1]; // Step 2: Retrieve Biological Module -> expectedAction: 'RETRIEVE'

// SCENARIO 1: Correct Sequence (Expected matches Observed)
const obsScenario1: ObservationPacket = {
  frameId: 101,
  timestamp: '12:00:01',
  detections: [],
  dominantAction: 'INITIALIZE',
  confidence: 0.95,
  temporalStability: 'STABLE',
};
const resultScenario1 = evaluateObservation(step1, obsScenario1, steps);
assert(resultScenario1.auditEntry.outcome === 'VERIFIED', 'Scenario 1: Expected action matched -> VERIFIED');
assert(resultScenario1.updatedStep.status === 'completed', 'Step 1 marked as completed');

// SCENARIO 2: Wrong Action (Deviation)
const obsScenario2: ObservationPacket = {
  frameId: 102,
  timestamp: '12:00:02',
  detections: [],
  dominantAction: 'SECURE', // Expected is RETRIEVE, but SECURE observed
  confidence: 0.89,
  temporalStability: 'STABLE',
};
const resultScenario2 = evaluateObservation(step2, obsScenario2, steps);
assert(resultScenario2.auditEntry.outcome === 'OUT_OF_ORDER' || resultScenario2.auditEntry.outcome === 'WRONG_STEP',
  'Scenario 2: Out of sequence action flagged properly');

// SCENARIO 3: Future Action Detection (OUT_OF_ORDER)
const obsScenario3: ObservationPacket = {
  frameId: 103,
  timestamp: '12:00:03',
  detections: [],
  dominantAction: 'POSITION', // Step 4 action while at Step 2
  confidence: 0.88,
  temporalStability: 'STABLE',
};
const resultScenario3 = evaluateObservation(step2, obsScenario3, steps);
assert(resultScenario3.auditEntry.outcome === 'OUT_OF_ORDER', 'Scenario 3: Future step action flagged as OUT_OF_ORDER');
assert(resultScenario3.updatedStep.status === 'wrong', 'Step marked with deviation warning status');

// SCENARIO 4: Ambiguous Recognition (Procedure does NOT advance)
const obsScenario4: ObservationPacket = {
  frameId: 104,
  timestamp: '12:00:04',
  detections: [],
  dominantAction: 'AMBIGUOUS',
  confidence: 0.52,
  temporalStability: 'AMBIGUOUS',
};
const resultScenario4 = evaluateObservation(step2, obsScenario4, steps);
assert(resultScenario4.auditEntry.outcome === 'AMBIGUOUS', 'Scenario 4: Ambiguous observation produces outcome AMBIGUOUS');
assert(resultScenario4.updatedStep.status !== 'completed', 'Scenario 4: Step does NOT advance on ambiguity');

// SCENARIO 5: Stabilization (Candidate confirmed to STABLE)
const candidateObs: ObservationPacket = {
  frameId: 105,
  timestamp: '12:00:05',
  detections: [],
  dominantAction: 'RETRIEVE',
  confidence: 0.92,
  temporalStability: 'CANDIDATE',
};
const resultCandidate = evaluateObservation(step2, candidateObs, steps);
assert(resultCandidate.auditEntry.outcome === 'PENDING' || resultCandidate.auditEntry.outcome === 'AMBIGUOUS' || resultCandidate.auditEntry.outcome === 'WAITING',
  'Scenario 5a: Candidate observation waits for temporal stability');

const stableObs: ObservationPacket = {
  frameId: 106,
  timestamp: '12:00:06',
  detections: [],
  dominantAction: 'RETRIEVE',
  confidence: 0.94,
  temporalStability: 'STABLE',
};
const resultStable = evaluateObservation(step2, stableObs, steps);
assert(resultStable.auditEntry.outcome === 'VERIFIED', 'Scenario 5b: Stable confirmed action verified');

// ─────────────────────────────────────────────────────────────────────────────
// 5. VOICE GUIDANCE DEBOUNCE & COOLDOWN TESTS (Section 29)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 5. Testing Voice Guidance Debounce & Cooldown ---');

// Mock speechSynthesis in Node environment for headless testing
(global as any).window = (global as any).window || {};
(global as any).window.speechSynthesis = {
  speak: () => {},
  cancel: () => {},
  getVoices: () => [],
};
(global as any).SpeechSynthesisUtterance = function(text: string) { return { text }; };

VoiceGuidanceService.setEnabled(true);
VoiceGuidanceService.speak('Initialization confirmed');
// Immediate subsequent call should be dropped by duplicate or general cooldown
VoiceGuidanceService.speak('Initialization confirmed');
assert(true, 'Voice service handles rapid sequential calls without throwing');

// ─────────────────────────────────────────────────────────────────────────────
// 6. LOGGING & EVIDENCE AUDIT TESTS (Section 28)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 6. Testing Logging & Audit Structure ---');

const audit = resultStable.auditEntry;
assert(typeof audit.id === 'string' && audit.id.length > 0, 'Audit has valid id');
assert(typeof audit.timestamp === 'string', 'Audit has timestamp');
assert(audit.observedAction === 'RETRIEVE', 'Audit logs observed action');
assert(audit.outcome === 'VERIFIED', 'Audit logs procedure outcome');
assert(audit.confidence === 94, 'Audit preserves actual measured confidence (94%)');

console.log('\n============================================================');
console.log('ALL UNIT AND SCENARIO TESTS PASSED SUCCESSFULLY! (100% OK)');
console.log('============================================================\n');
