// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Session Video Recording & PC Storage Service
// Records live camera feed with real-time AI perception overlays using MediaRecorder API.
// Allows exporting and downloading recorded WebM/MP4 session files directly to local PC/laptop.
// ─────────────────────────────────────────────────────────────────────────────

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStream: MediaStream | null = null;
  private startTimeMs: number = 0;
  private isCurrentlyRecording: boolean = false;
  private latestBlob: Blob | null = null;

  /**
   * Start recording stream from HTML5 canvas (captures video + AI overlays)
   */
  startRecording(canvas: HTMLCanvasElement): boolean {
    if (this.isCurrentlyRecording) return false;

    try {
      this.recordedChunks = [];
      this.latestBlob = null;
      this.startTimeMs = Date.now();

      // Capture 30 FPS stream from composite canvas
      this.recordingStream = canvas.captureStream(30);

      // Select supported MIME type
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      this.mediaRecorder = new MediaRecorder(this.recordingStream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps crisp quality
      });

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.recordedChunks.length > 0) {
          this.latestBlob = new Blob(this.recordedChunks, { type: mimeType });
        }
        this.isCurrentlyRecording = false;
      };

      this.mediaRecorder.start(1000); // 1-second timeslice chunks
      this.isCurrentlyRecording = true;
      console.log(`[RecordingService] Session recording started. Format: ${mimeType}`);
      return true;
    } catch (err) {
      console.error('[RecordingService] Failed to start recording:', err);
      this.isCurrentlyRecording = false;
      return false;
    }
  }

  /**
   * Stop recording and return compiled video Blob
   */
  async stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder || !this.isCurrentlyRecording) {
      return this.latestBlob;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (this.recordedChunks.length > 0) {
          const type = this.mediaRecorder?.mimeType || 'video/webm';
          this.latestBlob = new Blob(this.recordedChunks, { type });
        }
        this.isCurrentlyRecording = false;
        console.log('[RecordingService] Session recording stopped.');
        resolve(this.latestBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.isCurrentlyRecording;
  }

  getRecordingDurationSec(): number {
    if (!this.isCurrentlyRecording) return 0;
    return Math.round((Date.now() - this.startTimeMs) / 1000);
  }

  getLatestBlob(): Blob | null {
    return this.latestBlob;
  }

  /**
   * Download recorded session video file directly to user's PC/laptop
   */
  downloadRecording(blob?: Blob | null, filename?: string): void {
    const targetBlob = blob || this.latestBlob;
    if (!targetBlob) {
      console.warn('[RecordingService] No recorded session blob available to download.');
      return;
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultFilename = filename || `ALTRON_Space_Mission_Session_${timestampStr}.webm`;

    const url = URL.createObjectURL(targetBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  }
}

export const recordingService = new RecordingService();
