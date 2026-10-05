// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Session Context (Global State)
// Single source of truth for experiment session lifecycle, Vision Pipeline, and Temporal HAR.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import type { ExperimentSession, LiveStep, ObservationPacket, SessionStatus } from '@/types/session';
import type { VisionResult, VisionMode, VisionOverlaySettings } from '@/types/vision';
import type {
  TemporalTimelineEntry,
  TemporalWindowConfig,
  CanonicalAction,
} from '@/types/temporalHAR';
import { DEFAULT_TEMPORAL_CONFIG } from '@/types/temporalHAR';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import { sampleObservation } from '@/services/detection/mockDetectionService';
import { evaluateObservation } from '@/services/engine/procedureEngine';
import { VoiceGuidanceService } from '@/services/voice/voiceGuidanceService';
import { visionPipeline } from '@/services/vision/visionPipeline';
import { temporalHARManager } from '@/services/har/temporalHARManager';

// ── Helpers ──────────────────────────────────────────────────────────────────

function nowHHMMSS(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
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

function makeSessionId(): string {
  return `SES-${Date.now().toString(36).toUpperCase()}`;
}

const INITIAL_OVERLAY_SETTINGS: VisionOverlaySettings = {
  showPersonBoxes: true,
  showPoseSkeleton: true,
  showHands: true,
  showObjects: true,
  showTracking: true,
  showMotionVectors: true,
  showInteractions: true,
  showZones: true,
  showTrajectories: true,
  showTaskHUD: true,
  showAnomalies: true,
  showROI: true,
};

// ── Initial (Idle) State ──────────────────────────────────────────────────────

const INITIAL_SESSION: ExperimentSession = {
  sessionId: '',
  experimentId: CANONICAL_EXPERIMENT.id,
  experimentTitle: CANONICAL_EXPERIMENT.title,
  status: 'idle',
  startTime: null,
  endTime: null,
  steps: buildInitialSteps(),
  currentStepIndex: 0,
  auditLog: [],
  lastObservation: null,
  cameraActive: false,
  voiceEnabled: false,
  elapsedSeconds: 0,
};

// ── Context Shape ─────────────────────────────────────────────────────────────

interface SessionContextValue {
  session: ExperimentSession;
  latestVisionResult: VisionResult | null;
  visionMode: VisionMode;
  setVisionMode: (mode: VisionMode) => void;
  overlaySettings: VisionOverlaySettings;
  setOverlaySettings: React.Dispatch<React.SetStateAction<VisionOverlaySettings>>;

  // Temporal HAR state & controls
  temporalTimeline: TemporalTimelineEntry[];
  addTimelineEntry: (entry: TemporalTimelineEntry) => void;
  clearTimeline: () => void;
  temporalMode: 'DEMO' | 'REAL';
  setTemporalMode: (mode: 'DEMO' | 'REAL') => void;
  temporalWindowConfig: TemporalWindowConfig;
  setTemporalWindowConfig: (config: Partial<TemporalWindowConfig>) => void;
  triggerModelUnavailableTest: () => void;
  triggerModelAnalyticalTest: () => void;
  triggerAmbiguousTest: () => void;
  triggerOutOfOrderTest: () => void;

  /** Start a fresh experiment session */
  startSession: () => void;
  /** Pause the running session */
  pauseSession: () => void;
  /** Resume a paused session */
  resumeSession: () => void;
  /** Abort / end session early */
  abortSession: () => void;
  /** Mark current step verified manually (simulation control) */
  simulateVerified: () => void;
  /** Mark current step as wrong manually */
  simulateWrong: () => void;
  /** Mark current step as skipped manually */
  simulateSkipped: () => void;
  /** Reset to clean idle state */
  resetSession: () => void;
  /** Toggle voice guidance */
  toggleVoice: () => void;
  /** Set camera active flag */
  setCameraActive: (active: boolean) => void;
}

// ── Context Creation ──────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ExperimentSession>(INITIAL_SESSION);
  const [latestVisionResult, setLatestVisionResult] = useState<VisionResult | null>(null);
  const [visionMode, setVisionModeState] = useState<VisionMode>('MAXIMUM');
  const [overlaySettings, setOverlaySettings] = useState<VisionOverlaySettings>(INITIAL_OVERLAY_SETTINGS);

  // Temporal HAR state
  const [temporalTimeline, setTemporalTimeline] = useState<TemporalTimelineEntry[]>([]);
  const [temporalMode, setTemporalModeState] = useState<'DEMO' | 'REAL'>('DEMO');
  const [temporalWindowConfig, setTemporalWindowConfigState] = useState<TemporalWindowConfig>(DEFAULT_TEMPORAL_CONFIG);

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setVisionMode = useCallback((mode: VisionMode) => {
    setVisionModeState(mode);
    visionPipeline.setMode(mode);
  }, []);

  const setTemporalMode = useCallback((mode: 'DEMO' | 'REAL') => {
    setTemporalModeState(mode);
    temporalHARManager.setMode(mode);
  }, []);

  const setTemporalWindowConfig = useCallback((cfg: Partial<TemporalWindowConfig>) => {
    setTemporalWindowConfigState((prev) => {
      const updated = { ...prev, ...cfg };
      temporalHARManager.setWindowConfig(updated);
      return updated;
    });
  }, []);

  const triggerModelUnavailableTest = useCallback(() => {
    setTemporalModeState('REAL');
    temporalHARManager.setMode('REAL');
    temporalHARManager.setRealModelUnavailable();
  }, []);

  const triggerModelAnalyticalTest = useCallback(() => {
    setTemporalModeState('REAL');
    temporalHARManager.setMode('REAL');
    temporalHARManager.setRealModelAnalytical();
  }, []);

  const addTimelineEntry = useCallback((entry: TemporalTimelineEntry) => {
    setTemporalTimeline((prev) => [entry, ...prev].slice(0, 50));
  }, []);

  const clearTimeline = useCallback(() => {
    setTemporalTimeline([]);
  }, []);

  // ── Subscribe to real-time VisionPipeline ──────────────────────────────────
  useEffect(() => {
    const unsubscribe = visionPipeline.subscribe((result) => {
      setLatestVisionResult(result);

      // Extract Temporal HAR prediction metadata
      const temporalPred = result.temporalHAR;
      const activeStep = sessionRef.current.steps[sessionRef.current.currentStepIndex];

      const dominantAction =
        temporalPred?.action ||
        result.actions[0]?.action ||
        activeStep?.expectedAction ||
        'OBSERVING_WORKSTATION';

      const detections = result.objects.map((obj) => ({
        label: obj.label,
        confidence: obj.confidence / 100,
        interaction: result.interactions.find((i) => i.objectId === obj.id)?.type,
        recognisedAction: dominantAction,
      }));

      if (result.persons.length > 0) {
        detections.unshift({
          label: result.persons[0].id,
          confidence: result.persons[0].confidence / 100,
          interaction: undefined,
          recognisedAction: dominantAction,
        });
      }

      // Real or simulated confidence score
      let confValue = 0.90;
      if (temporalPred?.confidence !== null && temporalPred?.confidence !== undefined) {
        confValue = temporalPred.confidence;
      } else if (result.actions[0]?.confidence) {
        confValue = result.actions[0].confidence / 100;
      }

      const realObservation: ObservationPacket = {
        frameId: result.frameId,
        timestamp: result.formattedTime,
        detections,
        dominantAction,
        confidence: confValue,
        temporalPrediction: temporalPred,
        temporalStability: temporalPred?.stability,
      };

      setSession((prev) => ({
        ...prev,
        lastObservation: realObservation,
      }));
    });

    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, []);

  // ── Elapsed timer ─────────────────────────────────────────────────────────
  const startElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setSession((prev) => {
        if (prev.status !== 'active') return prev;
        return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
      });
    }, 1000);
  }, []);

  const stopElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, []);

  // ── Detection evaluation loop ─────────────────────────────────────────────
  const startDetectionLoop = useCallback(() => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = setInterval(() => {
      const current = sessionRef.current;
      if (current.status !== 'active') return;

      const activeStep = current.steps[current.currentStepIndex];
      if (!activeStep || activeStep.status === 'completed') return;

      // Update vision pipeline and HAR manager with expected action
      visionPipeline.setExpectedAction(activeStep.expectedAction);

      const observation: ObservationPacket =
        current.lastObservation || sampleObservation(activeStep.expectedAction);

      // Evaluate through ProcedureEngine with full steps array for out-of-order check
      const { outcome, updatedStep, auditEntry } = evaluateObservation(
        activeStep,
        observation,
        current.steps,
        current.currentStepIndex
      );

      // If action is AMBIGUOUS or LOW_CONFIDENCE, do not transition step
      if (outcome === 'AMBIGUOUS' || outcome === 'PENDING') {
        setSession((prev) => ({
          ...prev,
          lastObservation: observation,
          auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
        }));
        return;
      }

      setSession((prev) => {
        if (prev.status !== 'active') return prev;

        const newSteps = [...prev.steps];
        newSteps[prev.currentStepIndex] = updatedStep;

        let nextIndex = prev.currentStepIndex;
        let newStatus: SessionStatus = prev.status;

        // Record to dynamic Temporal Activity Timeline
        const timelineItem: TemporalTimelineEntry = {
          id: `tl-${Date.now()}-${observation.dominantAction}`,
          timestamp: observation.timestamp,
          windowFrames: observation.temporalPrediction?.frameCount || 60,
          windowDurationSec: observation.temporalPrediction?.windowDurationSec || 2.0,
          action: (observation.temporalPrediction?.action as CanonicalAction) || (observation.dominantAction as CanonicalAction),
          confidence: observation.temporalPrediction?.confidence ?? null,
          confidenceDisplay: observation.temporalPrediction?.confidenceDisplay ?? `${Math.round(observation.confidence * 100)}%`,
          stability: observation.temporalStability || 'STABLE',
          procedureOutcome: outcome,
          expectedAction: activeStep.expectedAction,
          isRealInference: observation.temporalPrediction?.isRealInference ?? false,
        };
        setTemporalTimeline((tPrev) => [timelineItem, ...tPrev].slice(0, 50));

        if (outcome === 'VERIFIED') {
          VoiceGuidanceService.announceVerified(activeStep.stepNumber);
          const next = prev.currentStepIndex + 1;
          if (next < newSteps.length) {
            newSteps[next] = { ...newSteps[next], status: 'active' };
            nextIndex = next;
            setTimeout(() => {
              const nextStep = newSteps[next];
              VoiceGuidanceService.announceStep(nextStep.stepNumber, nextStep.title, nextStep.description);
            }, 1200);
          } else {
            newStatus = 'completed';
            stopElapsedTimer();
            if (detectionIntervalRef.current) {
              clearInterval(detectionIntervalRef.current);
              detectionIntervalRef.current = null;
            }
            VoiceGuidanceService.announceSessionComplete();
          }
        }

        if (outcome === 'WRONG_STEP') {
          VoiceGuidanceService.announceDeviation(activeStep.expectedAction, observation.dominantAction);
        }

        if (outcome === 'OUT_OF_ORDER') {
          VoiceGuidanceService.announceOutOfOrder(activeStep.stepNumber, observation.dominantAction);
        }

        return {
          ...prev,
          steps: newSteps,
          currentStepIndex: nextIndex,
          status: newStatus,
          endTime: newStatus === 'completed' ? nowHHMMSS() : prev.endTime,
          lastObservation: observation,
          auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
        };
      });
    }, 3200);
  }, [stopElapsedTimer]);

  const stopDetectionLoop = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const startSession = useCallback(() => {
    const freshSteps = buildInitialSteps();
    const newSession: ExperimentSession = {
      sessionId: makeSessionId(),
      experimentId: CANONICAL_EXPERIMENT.id,
      experimentTitle: CANONICAL_EXPERIMENT.title,
      status: 'active',
      startTime: nowHHMMSS(),
      endTime: null,
      steps: freshSteps,
      currentStepIndex: 0,
      auditLog: [],
      lastObservation: null,
      cameraActive: sessionRef.current.cameraActive,
      voiceEnabled: sessionRef.current.voiceEnabled,
      elapsedSeconds: 0,
    };
    setSession(newSession);
    setTemporalTimeline([]);
    temporalHARManager.reset();
    startElapsedTimer();
    startDetectionLoop();

    VoiceGuidanceService.announceSessionStart(CANONICAL_EXPERIMENT.title);
    setTimeout(() => {
      VoiceGuidanceService.announceStep(
        freshSteps[0].stepNumber,
        freshSteps[0].title,
        freshSteps[0].description
      );
    }, 2500);
  }, [startElapsedTimer, startDetectionLoop]);

  const pauseSession = useCallback(() => {
    stopDetectionLoop();
    stopElapsedTimer();
    setSession((prev) => ({ ...prev, status: 'paused' }));
  }, [stopDetectionLoop, stopElapsedTimer]);

  const resumeSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: 'active' }));
    startElapsedTimer();
    startDetectionLoop();
  }, [startElapsedTimer, startDetectionLoop]);

  const abortSession = useCallback(() => {
    stopDetectionLoop();
    stopElapsedTimer();
    setSession((prev) => ({
      ...prev,
      status: 'aborted',
      endTime: nowHHMMSS(),
    }));
  }, [stopDetectionLoop, stopElapsedTimer]);

  const resetSession = useCallback(() => {
    stopDetectionLoop();
    stopElapsedTimer();
    temporalHARManager.reset();
    setTemporalTimeline([]);
    setSession({
      ...INITIAL_SESSION,
      cameraActive: sessionRef.current.cameraActive,
      voiceEnabled: sessionRef.current.voiceEnabled,
    });
  }, [stopDetectionLoop, stopElapsedTimer]);

  const simulateVerified = useCallback(() => {
    setSession((prev) => {
      if (prev.status !== 'active' && prev.status !== 'paused') return prev;
      const activeStep = prev.steps[prev.currentStepIndex];
      if (!activeStep) return prev;
      const observation = sampleObservation(activeStep.expectedAction);
      const { updatedStep, auditEntry } = evaluateObservation(activeStep, {
        ...observation,
        confidence: 0.97,
        dominantAction: activeStep.expectedAction,
        temporalStability: 'STABLE',
      });
      const newSteps = [...prev.steps];
      newSteps[prev.currentStepIndex] = { ...updatedStep, status: 'completed' };
      const nextIndex = prev.currentStepIndex + 1;
      let newStatus: SessionStatus = prev.status;
      if (nextIndex < newSteps.length) {
        newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'active' };
      } else {
        newStatus = 'completed';
        stopDetectionLoop();
        stopElapsedTimer();
        VoiceGuidanceService.announceSessionComplete();
      }

      // Add to timeline
      const timelineItem: TemporalTimelineEntry = {
        id: `tl-${Date.now()}-${activeStep.expectedAction}`,
        timestamp: observation.timestamp,
        windowFrames: 60,
        windowDurationSec: 2.0,
        action: activeStep.expectedAction as CanonicalAction,
        confidence: 0.97,
        confidenceDisplay: '97%',
        stability: 'STABLE',
        procedureOutcome: 'VERIFIED',
        expectedAction: activeStep.expectedAction,
        isRealInference: false,
      };
      setTemporalTimeline((tPrev) => [timelineItem, ...tPrev].slice(0, 50));

      VoiceGuidanceService.announceVerified(activeStep.stepNumber);
      return {
        ...prev,
        steps: newSteps,
        currentStepIndex: Math.min(nextIndex, prev.steps.length - 1),
        status: newStatus,
        endTime: newStatus === 'completed' ? nowHHMMSS() : prev.endTime,
        auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
        lastObservation: observation,
      };
    });
  }, [stopDetectionLoop, stopElapsedTimer]);

  const simulateWrong = useCallback(() => {
    setSession((prev) => {
      if (prev.status !== 'active' && prev.status !== 'paused') return prev;
      const activeStep = prev.steps[prev.currentStepIndex];
      if (!activeStep) return prev;
      const observation = sampleObservation(activeStep.expectedAction, true);
      const { updatedStep, auditEntry } = evaluateObservation(activeStep, {
        ...observation,
        confidence: 0.88,
        dominantAction: 'STOW',
        temporalStability: 'STABLE',
      });
      const newSteps = [...prev.steps];
      newSteps[prev.currentStepIndex] = { ...updatedStep, status: 'wrong' };

      const timelineItem: TemporalTimelineEntry = {
        id: `tl-${Date.now()}-STOW`,
        timestamp: observation.timestamp,
        windowFrames: 60,
        windowDurationSec: 2.0,
        action: 'STOW',
        confidence: 0.88,
        confidenceDisplay: '88%',
        stability: 'STABLE',
        procedureOutcome: 'WRONG_STEP',
        expectedAction: activeStep.expectedAction,
        isRealInference: false,
      };
      setTemporalTimeline((tPrev) => [timelineItem, ...tPrev].slice(0, 50));

      VoiceGuidanceService.announceDeviation(activeStep.expectedAction, 'STOW');
      return {
        ...prev,
        steps: newSteps,
        auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
        lastObservation: observation,
      };
    });
  }, []);

  const simulateSkipped = useCallback(() => {
    setSession((prev) => {
      if (prev.status !== 'active' && prev.status !== 'paused') return prev;
      const activeStep = prev.steps[prev.currentStepIndex];
      if (!activeStep) return prev;
      const newSteps = [...prev.steps];
      newSteps[prev.currentStepIndex] = { ...activeStep, status: 'skipped', observedAction: 'SKIPPED' };
      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex < newSteps.length) {
        newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'active' };
      }
      VoiceGuidanceService.announceSkipped(activeStep.stepNumber);
      const auditEntry = {
        id: `audit-${Date.now()}-skip`,
        timestamp: nowHHMMSS(),
        stepCode: activeStep.code,
        stepTitle: activeStep.title,
        outcome: 'SKIPPED' as const,
        confidence: 0,
        observedAction: 'SKIPPED',
        message: `Step ${activeStep.stepNumber} was manually skipped.`,
      };

      const timelineItem: TemporalTimelineEntry = {
        id: `tl-${Date.now()}-skip`,
        timestamp: nowHHMMSS(),
        windowFrames: 60,
        windowDurationSec: 2.0,
        action: 'UNKNOWN',
        confidence: null,
        confidenceDisplay: 'SKIPPED',
        stability: 'STABLE',
        procedureOutcome: 'SKIPPED',
        expectedAction: activeStep.expectedAction,
        isRealInference: false,
      };
      setTemporalTimeline((tPrev) => [timelineItem, ...tPrev].slice(0, 50));

      return {
        ...prev,
        steps: newSteps,
        currentStepIndex: Math.min(nextIndex, prev.steps.length - 1),
        auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
      };
    });
  }, []);

  const triggerAmbiguousTest = useCallback(() => {
    setSession((prev) => {
      const activeStep = prev.steps[prev.currentStepIndex];
      if (!activeStep) return prev;
      const observation: ObservationPacket = {
        frameId: Date.now() % 10000,
        timestamp: nowHHMMSS(),
        detections: [],
        dominantAction: 'AMBIGUOUS',
        confidence: 0.52,
        temporalStability: 'AMBIGUOUS',
      };
      const { updatedStep, auditEntry } = evaluateObservation(activeStep, observation, prev.steps);
      const newSteps = [...prev.steps];
      newSteps[prev.currentStepIndex] = updatedStep;

      const timelineItem: TemporalTimelineEntry = {
        id: `tl-${Date.now()}-ambiguous`,
        timestamp: observation.timestamp,
        windowFrames: 60,
        windowDurationSec: 2.0,
        action: 'AMBIGUOUS',
        confidence: 0.52,
        confidenceDisplay: '52% (Ambiguous)',
        stability: 'AMBIGUOUS',
        procedureOutcome: 'AMBIGUOUS',
        expectedAction: activeStep.expectedAction,
        isRealInference: false,
      };
      setTemporalTimeline((tPrev) => [timelineItem, ...tPrev].slice(0, 50));

      return {
        ...prev,
        steps: newSteps,
        auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
        lastObservation: observation,
      };
    });
  }, []);

  const triggerOutOfOrderTest = useCallback(() => {
    setSession((prev) => {
      const activeStep = prev.steps[prev.currentStepIndex];
      if (!activeStep) return prev;
      const outOfOrderAction = activeStep.expectedAction === 'SECURE' ? 'RECORD' : 'SECURE';
      const observation: ObservationPacket = {
        frameId: Date.now() % 10000,
        timestamp: nowHHMMSS(),
        detections: [],
        dominantAction: outOfOrderAction,
        confidence: 0.89,
        temporalStability: 'STABLE',
      };
      const { updatedStep, auditEntry } = evaluateObservation(activeStep, observation, prev.steps);
      const newSteps = [...prev.steps];
      newSteps[prev.currentStepIndex] = updatedStep;

      const timelineItem: TemporalTimelineEntry = {
        id: `tl-${Date.now()}-${outOfOrderAction}`,
        timestamp: observation.timestamp,
        windowFrames: 60,
        windowDurationSec: 2.0,
        action: outOfOrderAction as CanonicalAction,
        confidence: 0.89,
        confidenceDisplay: '89%',
        stability: 'STABLE',
        procedureOutcome: 'OUT_OF_ORDER',
        expectedAction: activeStep.expectedAction,
        isRealInference: false,
      };
      setTemporalTimeline((tPrev) => [timelineItem, ...tPrev].slice(0, 50));
      VoiceGuidanceService.announceOutOfOrder(activeStep.expectedAction, outOfOrderAction);

      return {
        ...prev,
        steps: newSteps,
        auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
        lastObservation: observation,
      };
    });
  }, []);

  const toggleVoice = useCallback(() => {
    setSession((prev) => {
      const newEnabled = !prev.voiceEnabled;
      VoiceGuidanceService.setEnabled(newEnabled);
      return { ...prev, voiceEnabled: newEnabled };
    });
  }, []);

  const setCameraActive = useCallback((active: boolean) => {
    setSession((prev) => ({ ...prev, cameraActive: active }));
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        latestVisionResult,
        visionMode,
        setVisionMode,
        overlaySettings,
        setOverlaySettings,
        temporalTimeline,
        addTimelineEntry,
        clearTimeline,
        temporalMode,
        setTemporalMode,
        temporalWindowConfig,
        setTemporalWindowConfig,
        triggerModelUnavailableTest,
        triggerModelAnalyticalTest,
        triggerAmbiguousTest,
        triggerOutOfOrderTest,
        startSession,
        pauseSession,
        resumeSession,
        abortSession,
        simulateVerified,
        simulateWrong,
        simulateSkipped,
        resetSession,
        toggleVoice,
        setCameraActive,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return ctx;
}
