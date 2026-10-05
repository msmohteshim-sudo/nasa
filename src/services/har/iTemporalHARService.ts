// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal HAR Service Interface
// ITemporalHARService defines the contract for mock, demo, and real HAR models
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PerFrameObservation,
  TemporalHARPrediction,
  TemporalHARStatus,
  TemporalWindowConfig,
  TemporalExplainability,
} from '@/types/temporalHAR';
import type { TemporalBuffer } from './temporalBuffer';

export interface ITemporalHARService {
  initialize(): Promise<void>;
  addObservation(obs: PerFrameObservation): boolean;
  isWindowReady(): boolean;
  predict(): TemporalHARPrediction;
  reset(): void;
  getBuffer(): TemporalBuffer;
  getStatus(): TemporalHARStatus;
  getStatusNote(): string;
  getConfig(): TemporalWindowConfig;
  setConfig(config: Partial<TemporalWindowConfig>): void;
  getExplainability(prediction: TemporalHARPrediction): TemporalExplainability;
  setExpectedAction(action: string | null): void;
}
