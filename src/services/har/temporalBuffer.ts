// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Observation Buffer
// Sliding temporal window with real timestamp-based duration and FPS awareness
// ─────────────────────────────────────────────────────────────────────────────

import type { PerFrameObservation } from '@/types/temporalHAR';

export class TemporalBuffer {
  private buffer: PerFrameObservation[] = [];
  private windowSize: number;
  private stride: number;
  private framesSinceLastStride = 0;
  private totalFramesPushed = 0;

  constructor(windowSizeOrConfig: number | { windowSize?: number; stride?: number } = 60, stride = 5) {
    if (typeof windowSizeOrConfig === 'object' && windowSizeOrConfig !== null) {
      this.windowSize = Math.max(10, windowSizeOrConfig.windowSize ?? 60);
      this.stride = Math.max(1, windowSizeOrConfig.stride ?? 5);
    } else {
      this.windowSize = Math.max(10, windowSizeOrConfig);
      this.stride = Math.max(1, stride);
    }
  }

  /**
   * Update window size dynamically
   */
  setWindowSize(size: number): void {
    this.windowSize = Math.max(10, size);
    if (this.buffer.length > this.windowSize) {
      this.buffer = this.buffer.slice(this.buffer.length - this.windowSize);
    }
  }

  getWindowSize(): number {
    return this.windowSize;
  }

  setStride(stride: number): void {
    this.stride = Math.max(1, stride);
  }

  getStride(): number {
    return this.stride;
  }

  /**
   * Push a new per-frame observation into the rolling sliding window
   */
  addObservation(obs: PerFrameObservation): boolean {
    this.totalFramesPushed++;
    this.framesSinceLastStride++;

    this.buffer.push(obs);

    // Maintain sliding window constraint
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    // Returns true when a stride step is reached and window is ready
    if (this.framesSinceLastStride >= this.stride) {
      this.framesSinceLastStride = 0;
      return this.isReady();
    }

    return false;
  }

  /**
   * Returns true if buffer has accumulated the required window size
   */
  isReady(): boolean {
    return this.buffer.length >= this.windowSize;
  }

  /**
   * Current number of observations in the buffer
   */
  getCount(): number {
    return this.buffer.length;
  }

  /**
   * Fill ratio (0.0 to 1.0)
   */
  getFillRatio(): number {
    return Math.min(1.0, this.buffer.length / this.windowSize);
  }

  /**
   * Get all observations currently in the temporal window
   */
  getObservations(): readonly PerFrameObservation[] {
    return this.buffer;
  }

  /**
   * Get the oldest observation in the current window
   */
  getFirst(): PerFrameObservation | null {
    return this.buffer.length > 0 ? this.buffer[0] : null;
  }

  /**
   * Get the latest observation in the current window
   */
  getLatest(): PerFrameObservation | null {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
  }

  /**
   * Get the most recent N observations
   */
  getRecent(n: number): PerFrameObservation[] {
    return this.buffer.slice(-Math.min(n, this.buffer.length));
  }

  /**
   * Compute actual temporal duration from real timestamps (not assuming 30fps)
   */
  getDurationSec(): number {
    if (this.buffer.length < 2) return 0;
    const start = this.buffer[0].timestampMs ?? (this.buffer[0] as any).timestamp ?? 0;
    const end = this.buffer[this.buffer.length - 1].timestampMs ?? (this.buffer[this.buffer.length - 1] as any).timestamp ?? 0;
    const diffMs = Math.max(0, end - start);
    return Math.round((diffMs / 1000) * 100) / 100;
  }

  /**
   * Derive actual camera FPS from timestamps in buffer
   */
  getMeasuredFps(): number {
    const duration = this.getDurationSec();
    if (duration <= 0 || this.buffer.length < 2) return 0;
    const fps = (this.buffer.length - 1) / duration;
    return Math.round(fps * 10) / 10;
  }

  /**
   * Check if multiple people are detected across the window
   */
  hasMultiPersonScene(): boolean {
    if (this.buffer.length === 0) return false;
    // If more than 20% of frames have >1 person
    const multiCount = this.buffer.filter((o) => o.persons && o.persons.length > 1).length;
    return multiCount / this.buffer.length > 0.2;
  }



  /**
   * Reset the buffer
   */
  clear(): void {
    this.buffer = [];
    this.framesSinceLastStride = 0;
    this.totalFramesPushed = 0;
  }

  /**
   * Alias for clear()
   */
  reset(): void {
    this.clear();
  }
}
