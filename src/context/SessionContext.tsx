// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Session Context (Global State)
// Single source of truth for experiment session lifecycle and Vision Pipeline.
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
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import { sampleObservation } from '@/services/detection/mockDetectionService';
import { evaluateObservation } from '@/services/engine/procedureEngine';
import { VoiceGuidanceService } from '@/services/voice/voiceGuidanceService';
import { visionPipeline } from '@/services/vision/visionPipeline';

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

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setVisionMode = useCallback((mode: VisionMode) => {
    setVisionModeState(mode);
    visionPipeline.setMode(mode);
  }, []);

  // ── Subscribe to real-time VisionPipeline ──────────────────────────────────
  useEffect(() => {
    const unsubscribe = visionPipeline.subscribe((result) => {
      setLatestVisionResult(result);

      // Convert VisionResult to ObservationPacket format for Session
      const activeStep = sessionRef.current.steps[sessionRef.current.currentStepIndex];
      const dominantAction = result.actions[0]?.action || activeStep?.expectedAction || 'OBSERVING_WORKSTATION';

      const detections = result.objects.map((obj) => ({
        label: obj.label,
        confidence: obj.confidence / 100,
        interaction: result.interactions.find((i) => i.objectId === obj.id)?.type,
        recognisedAction: dominantAction,
      }));

      // Add person & hand detections if objects list is small
      if (result.persons.length > 0) {
        detections.unshift({
          label: result.persons[0].id,
          confidence: result.persons[0].confidence / 100,
          interaction: undefined,
          recognisedAction: dominantAction,
        });
      }

      const realObservation: ObservationPacket = {
        frameId: result.frameId,
        timestamp: result.formattedTime,
        detections,
        dominantAction,
        confidence: (result.actions[0]?.confidence || result.persons[0]?.confidence || 90) / 100,
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

      // Update vision pipeline expected action code
      visionPipeline.setExpectedAction(activeStep.expectedAction);

      const observation: ObservationPacket = current.lastObservation || sampleObservation(activeStep.expectedAction);
      const { outcome, updatedStep, auditEntry } = evaluateObservation(activeStep, observation);

      setSession((prev) => {
        if (prev.status !== 'active') return prev;

        const newSteps = [...prev.steps];
        newSteps[prev.currentStepIndex] = updatedStep;

        let nextIndex = prev.currentStepIndex;
        let newStatus: SessionStatus = prev.status;

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
    }, 3500);
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
      const { updatedStep, auditEntry } = evaluateObservation(activeStep, { ...observation, confidence: 0.97, dominantAction: activeStep.expectedAction });
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
      const { updatedStep, auditEntry } = evaluateObservation(activeStep, observation);
      const newSteps = [...prev.steps];
      newSteps[prev.currentStepIndex] = { ...updatedStep, status: 'wrong' };
      VoiceGuidanceService.announceDeviation(activeStep.expectedAction, observation.dominantAction);
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
      return {
        ...prev,
        steps: newSteps,
        currentStepIndex: Math.min(nextIndex, prev.steps.length - 1),
        auditLog: [auditEntry, ...prev.auditLog].slice(0, 200),
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
