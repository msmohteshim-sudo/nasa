// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Temporal Motion & Velocity Analyzer
// Analyzes frame-to-frame displacement of body landmarks & pixel regions.
// Calculates movement magnitude (0..100) per body region & overall movement level.
// Explicitly distinguishes Detection Confidence from Movement Magnitude!
// ─────────────────────────────────────────────────────────────────────────────

import type { PersonMotion, BodyPartMotion, PoseLandmarks, MovementLevel } from '@/types/vision';

interface FramePoseHistory {
  frameId: number;
  timestamp: number;
  landmarks: Map<string, { x: number; y: number }>;
}

export class MotionAnalyzer {
  private poseHistory: Map<string, FramePoseHistory[]> = new Map();

  analyzeMotion(
    poses: PoseLandmarks[],
    currentFrameId: number,
    nowMs: number
  ): PersonMotion[] {
    const motionResults: PersonMotion[] = [];

    poses.forEach((pose) => {
      const pid = pose.personId;
      const history = this.poseHistory.get(pid) || [];

      // Map current landmarks by name
      const currentMap = new Map<string, { x: number; y: number }>();
      pose.landmarks.forEach((l) => {
        if (l.score > 0.3) {
          currentMap.set(l.name, { x: l.x, y: l.y });
        }
      });

      history.push({ frameId: currentFrameId, timestamp: nowMs, landmarks: currentMap });
      // Keep past 15 frames (~0.5 - 1.0s window)
      if (history.length > 15) history.shift();
      this.poseHistory.set(pid, history);

      if (history.length < 2) {
        motionResults.push(this.buildDefaultMotion(pid, pose.confidence));
        return;
      }

      // Calculate landmark displacements relative to previous frames
      const prevFrame = history[Math.max(0, history.length - 4)];
      const dtSeconds = Math.max(0.016, (nowMs - prevFrame.timestamp) / 1000);

      const partMotions: BodyPartMotion[] = [
        this.computeRegionMotion('Head', ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear'], currentMap, prevFrame.landmarks, dtSeconds),
        this.computeRegionMotion('Left Arm', ['left_shoulder', 'left_elbow', 'left_wrist'], currentMap, prevFrame.landmarks, dtSeconds),
        this.computeRegionMotion('Right Arm', ['right_shoulder', 'right_elbow', 'right_wrist'], currentMap, prevFrame.landmarks, dtSeconds),
        this.computeRegionMotion('Left Hand', ['left_wrist'], currentMap, prevFrame.landmarks, dtSeconds),
        this.computeRegionMotion('Right Hand', ['right_wrist'], currentMap, prevFrame.landmarks, dtSeconds),
        this.computeRegionMotion('Torso', ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'], currentMap, prevFrame.landmarks, dtSeconds),
        this.computeRegionMotion('Left Leg', ['left_hip', 'left_knee', 'left_ankle'], currentMap, prevFrame.landmarks, dtSeconds),
        this.computeRegionMotion('Right Leg', ['right_hip', 'right_knee', 'right_ankle'], currentMap, prevFrame.landmarks, dtSeconds),
      ];

      // Overall displacement velocity
      const avgMagnitude = Math.round(
        partMotions.reduce((acc, p) => acc + p.magnitude, 0) / partMotions.length
      );

      const overallLevel = this.classifyLevel(avgMagnitude);

      motionResults.push({
        personId: pid,
        overallLevel,
        confidence: Math.round(Math.min(96, Math.max(70, pose.confidence))),
        displacementVelocity: avgMagnitude,
        regions: partMotions,
      });
    });

    return motionResults;
  }

  private computeRegionMotion(
    partName: string,
    landmarkNames: string[],
    currentMap: Map<string, { x: number; y: number }>,
    prevMap: Map<string, { x: number; y: number }>,
    dtSec: number
  ): BodyPartMotion {
    let totalDist = 0;
    let count = 0;

    landmarkNames.forEach((name) => {
      const curr = currentMap.get(name);
      const prev = prevMap.get(name);
      if (curr && prev) {
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        totalDist += dist;
        count++;
      }
    });

    if (count === 0) {
      return { partName, magnitude: 0, level: 'NO_MOVEMENT' };
    }

    const avgPixelDist = totalDist / count;
    // Velocity in pixels per second
    const velocity = avgPixelDist / dtSec;

    // Normalize to 0..100 scale (where 150px/sec velocity is high movement)
    const normalizedMag = Math.round(Math.min(100, Math.max(0, (velocity / 150) * 100)));
    const level = this.classifyLevel(normalizedMag);

    return { partName, magnitude: normalizedMag, level };
  }

  private classifyLevel(magnitude: number): MovementLevel {
    if (magnitude < 5) return 'NO_MOVEMENT';
    if (magnitude < 35) return 'LOW_MOVEMENT';
    if (magnitude < 65) return 'MODERATE_MOVEMENT';
    return 'HIGH_MOVEMENT';
  }

  private buildDefaultMotion(personId: string, poseConfidence: number): PersonMotion {
    const parts = ['Head', 'Left Arm', 'Right Arm', 'Left Hand', 'Right Hand', 'Torso', 'Left Leg', 'Right Leg'];
    return {
      personId,
      overallLevel: 'LOW_MOVEMENT',
      confidence: Math.round(poseConfidence),
      displacementVelocity: 15,
      regions: parts.map((partName) => ({
        partName,
        magnitude: partName.includes('Head') || partName.includes('Arm') || partName.includes('Hand') ? 15 : 0,
        level: partName.includes('Head') || partName.includes('Arm') || partName.includes('Hand') ? 'LOW_MOVEMENT' : 'NO_MOVEMENT',
      })),
    };
  }
}

export const motionAnalyzer = new MotionAnalyzer();
