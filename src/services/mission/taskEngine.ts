// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Mission Task Engine
// Evaluates real-time vision state (person position, object tracking, interaction state,
// spatial zone occupancy, action classification) against structured procedure steps.
// Handles automatic step verification, procedure execution tracking, and status transitions.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MissionTask,
  MissionTaskStep,
  PersonDetection,
  ObjectDetection,
  InteractionResult,
  ActionResult,
  ZoneOccupancy,
} from '@/types/vision';
import { PREDEFINED_MISSION_TASKS } from '@/config/missionConfig';

export class TaskEngine {
  private activeTask: MissionTask = JSON.parse(JSON.stringify(PREDEFINED_MISSION_TASKS[0]));
  private availableTasks: MissionTask[] = JSON.parse(JSON.stringify(PREDEFINED_MISSION_TASKS));
  private stepStartMs: number = Date.now();
  private taskStartMs: number = Date.now();
  private isRunning: boolean = false;

  constructor() {
    this.resetTask();
  }

  getTasks(): MissionTask[] {
    return this.availableTasks;
  }

  getActiveTask(): MissionTask {
    return this.activeTask;
  }

  selectTask(taskId: string): MissionTask {
    const found = this.availableTasks.find((t) => t.taskId === taskId);
    if (found) {
      this.activeTask = JSON.parse(JSON.stringify(found));
      this.resetTask();
    }
    return this.activeTask;
  }

  startTask(): void {
    this.isRunning = true;
    this.activeTask.status = 'IN_PROGRESS';
    this.taskStartMs = Date.now();
    this.stepStartMs = Date.now();
    if (this.activeTask.steps.length > 0) {
      this.activeTask.steps[0].status = 'IN_PROGRESS';
    }
  }

  pauseTask(): void {
    this.isRunning = false;
    this.activeTask.status = 'PAUSED';
  }

  resetTask(): void {
    this.activeTask.currentStepIndex = 0;
    this.activeTask.status = 'NOT_STARTED';
    this.activeTask.overallProgress = 0;
    this.activeTask.elapsedTimeSec = 0;
    this.taskStartMs = Date.now();
    this.stepStartMs = Date.now();
    this.activeTask.steps.forEach((s, idx) => {
      s.status = idx === 0 ? 'PENDING' : 'PENDING';
      s.progress = 0;
      delete s.completedAt;
    });
  }

  /**
   * Evaluate vision pipeline packet and update procedure step verification state
   */
  evaluateFrame(
    persons: PersonDetection[],
    objects: ObjectDetection[],
    interactions: InteractionResult[],
    actions: ActionResult[],
    zones: ZoneOccupancy[]
  ): {
    updatedTask: MissionTask;
    stepCompletedEvent?: { step: MissionTaskStep; task: MissionTask };
  } {
    if (this.activeTask.status !== 'IN_PROGRESS') {
      return { updatedTask: this.activeTask };
    }

    const nowMs = Date.now();
    this.activeTask.elapsedTimeSec = Math.round((nowMs - this.taskStartMs) / 1000);

    const stepIndex = this.activeTask.currentStepIndex;
    if (stepIndex >= this.activeTask.steps.length) {
      this.activeTask.status = 'COMPLETED';
      this.activeTask.overallProgress = 100;
      return { updatedTask: this.activeTask };
    }

    const step = this.activeTask.steps[stepIndex];
    step.status = 'IN_PROGRESS';

    let criteriaMet = false;
    let incrementalProgress = step.progress;

    // 1. Target Zone Check
    if (step.targetZone) {
      const targetOcc = zones.find((z) => z.zoneId === step.targetZone || z.zoneName.includes(step.targetZone!));
      if (targetOcc && targetOcc.personIds.length > 0) {
        incrementalProgress = Math.max(incrementalProgress, 60);
        if (!step.targetObject && !step.requiredAction && !step.requiredInteraction) {
          criteriaMet = true;
        }
      }
    }

    // 2. Target Object & Interaction Check
    if (step.targetObject) {
      const matchingInter = interactions.find(
        (i) => i.objectLabel.toUpperCase().includes(step.targetObject!.toUpperCase())
      );

      if (matchingInter) {
        incrementalProgress = Math.max(incrementalProgress, 75);

        if (step.requiredInteraction) {
          if (matchingInter.interactionState === step.requiredInteraction || matchingInter.type === step.requiredInteraction as any) {
            criteriaMet = true;
          }
        } else if (matchingInter.type === 'HOLDING' || matchingInter.type === 'TOUCHING' || matchingInter.type === 'MOVING') {
          criteriaMet = true;
        }
      }
    }

    // 3. Required Action Check
    if (step.requiredAction) {
      const actionMatch = actions.find(
        (a) => a.action.toUpperCase().includes(step.requiredAction!.toUpperCase())
      );
      if (actionMatch) {
        incrementalProgress = Math.max(incrementalProgress, 85);
        criteriaMet = true;
      }
    }

    // 4. Minimum Duration Verification
    if (criteriaMet && step.minDurationSec) {
      const elapsedStepSec = (nowMs - this.stepStartMs) / 1000;
      if (elapsedStepSec < step.minDurationSec) {
        criteriaMet = false;
        incrementalProgress = Math.min(99, Math.round((elapsedStepSec / step.minDurationSec) * 100));
      }
    }

    step.progress = criteriaMet ? 100 : Math.max(step.progress, incrementalProgress);

    let stepCompletedEvent: { step: MissionTaskStep; task: MissionTask } | undefined;

    // Advance to next step if current step completed
    if (criteriaMet || step.progress >= 100) {
      step.status = 'COMPLETED';
      step.progress = 100;
      step.completedAt = new Date().toLocaleTimeString('en-GB', { hour12: false });

      stepCompletedEvent = { step: { ...step }, task: this.activeTask };

      this.activeTask.currentStepIndex++;
      this.stepStartMs = Date.now();

      if (this.activeTask.currentStepIndex >= this.activeTask.steps.length) {
        this.activeTask.status = 'COMPLETED';
        this.activeTask.overallProgress = 100;
      } else {
        this.activeTask.steps[this.activeTask.currentStepIndex].status = 'IN_PROGRESS';
      }
    }

    // Calculate overall procedure progress
    const totalSteps = this.activeTask.steps.length;
    const completedCount = this.activeTask.steps.filter((s) => s.status === 'COMPLETED').length;
    const currentPartial = this.activeTask.currentStepIndex < totalSteps ? (step.progress / 100) : 0;
    this.activeTask.overallProgress = Math.round(((completedCount + currentPartial) / totalSteps) * 100);

    return {
      updatedTask: this.activeTask,
      stepCompletedEvent,
    };
  }
}

export const taskEngine = new TaskEngine();
