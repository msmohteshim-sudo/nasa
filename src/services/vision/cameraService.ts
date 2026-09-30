// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Camera Service & Capability Discovery
// Real webcam stream management, resolution discovery, and camera FPS monitoring.
// ─────────────────────────────────────────────────────────────────────────────

import type { CameraCapabilities } from '@/types/vision';

export class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private activeTrack: MediaStreamTrack | null = null;
  private frameCount = 0;
  private lastFpsTimestamp = performance.now();
  private currentCameraFps = 0;

  /**
   * Request webcam stream with practical target constraints
   */
  async startCamera(
    videoEl: HTMLVideoElement,
    targetResolution: { width: number; height: number } = { width: 1280, height: 720 }
  ): Promise<{ stream: MediaStream; capabilities: CameraCapabilities }> {
    this.stopCamera();
    this.videoElement = videoEl;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        width: { ideal: targetResolution.width, max: 1920 },
        height: { ideal: targetResolution.height, max: 1080 },
        facingMode: 'user',
        frameRate: { ideal: 30, max: 60 },
      },
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = this.stream;
      await videoEl.play();

      const tracks = this.stream.getVideoTracks();
      this.activeTrack = tracks[0] || null;

      const capabilities = this.discoverCapabilities();
      this.startFpsCounter();

      return { stream: this.stream, capabilities };
    } catch (err) {
      console.error('[CameraService] Failed to start camera:', err);
      throw err;
    }
  }

  /**
   * Stop active camera stream and clean up tracks
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.activeTrack = null;
    this.currentCameraFps = 0;
  }

  /**
   * Inspect current MediaStreamTrack capabilities supported by browser
   */
  discoverCapabilities(): CameraCapabilities {
    if (!this.activeTrack) {
      return {
        resolutionWidth: 1280,
        resolutionHeight: 720,
        frameRate: 30,
        facingMode: 'user',
        aspectRatio: 16 / 9,
      };
    }

    const settings = this.activeTrack.getSettings();

    return {
      resolutionWidth: settings.width || 1280,
      resolutionHeight: settings.height || 720,
      frameRate: settings.frameRate || 30,
      facingMode: settings.facingMode || 'user',
      aspectRatio: settings.aspectRatio || (settings.width && settings.height ? settings.width / settings.height : 16 / 9),
      deviceId: settings.deviceId,
      label: this.activeTrack.label || 'Webcam Stream',
    };
  }

  /**
   * Track real-time camera stream FPS
   */
  private startFpsCounter(): void {
    this.frameCount = 0;
    this.lastFpsTimestamp = performance.now();
  }

  /**
   * Called on each frame process to update camera FPS metric
   */
  tickFrame(): void {
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastFpsTimestamp;
    if (delta >= 1000) {
      this.currentCameraFps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastFpsTimestamp = now;
    }
  }

  getCameraFps(): number {
    return this.currentCameraFps || 30;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  isActive(): boolean {
    return !!this.stream && this.stream.active;
  }
}

export const cameraService = new CameraService();
