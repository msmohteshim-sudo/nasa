// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Action Stability & Debouncing Engine
// Implements candidate confirmation, temporal debouncing, ambiguity & low-confidence filtering
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CanonicalAction,
  PredictionStability,
  TemporalWindowConfig,
} from '@/types/temporalHAR';

export interface StabilityAssessment {
  stability: PredictionStability;
  stableAction: CanonicalAction | null;
  candidateAction: CanonicalAction | null;
  consecutiveCandidateCount: number;
  isAmbiguous: boolean;
  isLowConfidence: boolean;
  reason: string;
}

export class TemporalStabilityManager {
  private currentStableAction: CanonicalAction | null = null;
  private currentCandidateAction: CanonicalAction | null = null;
  private consecutiveCandidateCount = 0;
  private config: TemporalWindowConfig;

  constructor(config: TemporalWindowConfig) {
    this.config = config;
  }

  updateConfig(config: Partial<TemporalWindowConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Evaluate a raw prediction against temporal stability thresholds
   */
  evaluateStability(
    rawAction: CanonicalAction,
    confidence: number | null,
    rawProbabilities?: Partial<Record<CanonicalAction, number>>
  ): StabilityAssessment {
    // 1. Check for Ambiguity among top probabilities if provided
    let isAmbiguous = false;
    let ambiguityNote = '';

    if (rawProbabilities) {
      const sorted = Object.entries(rawProbabilities)
        .filter(([, score]) => typeof score === 'number' && !isNaN(score))
        .sort(([, a], [, b]) => (b as number) - (a as number));

      if (sorted.length >= 2) {
        const top1 = sorted[0][1] as number;
        const top2 = sorted[1][1] as number;
        const diff = top1 - top2;

        if (diff < this.config.ambiguityMargin && top1 > 0.4) {
          isAmbiguous = true;
          ambiguityNote = `Top actions [${sorted[0][0]}: ${(top1 * 100).toFixed(0)}%] and [${sorted[1][0]}: ${(top2 * 100).toFixed(0)}%] margin < ${(this.config.ambiguityMargin * 100).toFixed(0)}%`;
        }
      }
    }

    // 2. Check for Low Confidence (only when confidence is a real number)
    const isLowConfidence = confidence !== null && confidence < this.config.minConfidenceThreshold;

    if (isAmbiguous) {
      // Do not increment candidate confirmation if ambiguous
      return {
        stability: 'AMBIGUOUS',
        stableAction: this.currentStableAction,
        candidateAction: rawAction,
        consecutiveCandidateCount: this.consecutiveCandidateCount,
        isAmbiguous: true,
        isLowConfidence,
        reason: ambiguityNote || 'Ambiguous prediction — waiting for additional temporal evidence',
      };
    }

    if (isLowConfidence) {
      return {
        stability: 'LOW_CONFIDENCE',
        stableAction: this.currentStableAction,
        candidateAction: rawAction,
        consecutiveCandidateCount: this.consecutiveCandidateCount,
        isAmbiguous: false,
        isLowConfidence: true,
        reason: `Confidence ${(confidence! * 100).toFixed(0)}% is below threshold ${(this.config.minConfidenceThreshold * 100).toFixed(0)}%`,
      };
    }

    // 3. Candidate confirmation & debouncing
    if (this.currentCandidateAction === rawAction) {
      this.consecutiveCandidateCount++;
    } else {
      this.currentCandidateAction = rawAction;
      this.consecutiveCandidateCount = 1;
    }

    if (this.consecutiveCandidateCount >= this.config.stabilityThreshold) {
      this.currentStableAction = rawAction;
      return {
        stability: 'STABLE',
        stableAction: this.currentStableAction,
        candidateAction: this.currentCandidateAction,
        consecutiveCandidateCount: this.consecutiveCandidateCount,
        isAmbiguous: false,
        isLowConfidence: false,
        reason: `Action "${rawAction}" confirmed stable across ${this.consecutiveCandidateCount} consecutive evaluations`,
      };
    }

    return {
      stability: 'CANDIDATE',
      stableAction: this.currentStableAction,
      candidateAction: this.currentCandidateAction,
      consecutiveCandidateCount: this.consecutiveCandidateCount,
      isAmbiguous: false,
      isLowConfidence: false,
      reason: `Candidate action "${rawAction}" confirming (${this.consecutiveCandidateCount}/${this.config.stabilityThreshold})`,
    };
  }

  getStableAction(): CanonicalAction | null {
    return this.currentStableAction;
  }

  reset(): void {
    this.currentStableAction = null;
    this.currentCandidateAction = null;
    this.consecutiveCandidateCount = 0;
  }
}
