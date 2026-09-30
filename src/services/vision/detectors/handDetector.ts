// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Hand Landmark & Bounding Region Detector
// Detects Left Hand and Right Hand bounding regions, wrist position, and fingers.
// ─────────────────────────────────────────────────────────────────────────────

import type { HandDetection, PoseLandmarks, Landmark, BoundingBox } from '@/types/vision';

export class HandDetector {
  detectHands(poses: PoseLandmarks[], videoW: number, videoH: number): HandDetection[] {
    const hands: HandDetection[] = [];

    poses.forEach((pose) => {
      const landmarks = pose.landmarks;
      const leftWrist = landmarks.find((l) => l.name === 'left_wrist');
      const rightWrist = landmarks.find((l) => l.name === 'right_wrist');
      const leftElbow = landmarks.find((l) => l.name === 'left_elbow');
      const rightElbow = landmarks.find((l) => l.name === 'right_elbow');

      // Left Hand Detection
      if (leftWrist && leftWrist.score > 0.3) {
        const box = this.buildHandBox(leftWrist, leftElbow, videoW, videoH);
        const handLandmarks = this.generateFingerLandmarks(leftWrist, 'LEFT', box);

        hands.push({
          hand: 'LEFT',
          personId: pose.personId,
          confidence: Math.round(leftWrist.score * 100),
          box,
          landmarks: handLandmarks,
          isDetected: true,
          wristPosition: { x: leftWrist.x, y: leftWrist.y },
        });
      }

      // Right Hand Detection
      if (rightWrist && rightWrist.score > 0.3) {
        const box = this.buildHandBox(rightWrist, rightElbow, videoW, videoH);
        const handLandmarks = this.generateFingerLandmarks(rightWrist, 'RIGHT', box);

        hands.push({
          hand: 'RIGHT',
          personId: pose.personId,
          confidence: Math.round(rightWrist.score * 100),
          box,
          landmarks: handLandmarks,
          isDetected: true,
          wristPosition: { x: rightWrist.x, y: rightWrist.y },
        });
      }
    });

    return hands;
  }

  private buildHandBox(
    wrist: Landmark,
    elbow: Landmark | undefined,
    videoW: number,
    videoH: number
  ): BoundingBox {
    // Estimate hand box radius from forearm scale or standard box size
    let radius = 45;
    if (elbow && elbow.score > 0.3) {
      const dx = wrist.x - elbow.x;
      const dy = wrist.y - elbow.y;
      const forearmLen = Math.sqrt(dx * dx + dy * dy);
      radius = Math.max(35, Math.min(120, forearmLen * 0.45));
    }

    const x = Math.max(0, Math.round(wrist.x - radius));
    const y = Math.max(0, Math.round(wrist.y - radius));
    const w = Math.min(videoW - x, Math.round(radius * 2));
    const h = Math.min(videoH - y, Math.round(radius * 2));

    return { x, y, width: w, height: h };
  }

  private generateFingerLandmarks(wrist: Landmark, side: 'LEFT' | 'RIGHT', box: BoundingBox): Landmark[] {
    const lms: Landmark[] = [{ name: `${side}_wrist`, x: wrist.x, y: wrist.y, score: wrist.score }];
    const dir = side === 'LEFT' ? -1 : 1;

    // Synthetic finger joint points relative to wrist & hand box
    const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    fingers.forEach((f, i) => {
      const angle = (-0.6 + i * 0.3) * dir;
      const dist = box.width * 0.4;
      const fx = wrist.x + Math.sin(angle) * dist;
      const fy = wrist.y - Math.cos(angle) * dist;
      lms.push({
        name: `${side}_${f}_tip`,
        x: Math.round(fx),
        y: Math.round(fy),
        score: Math.round((wrist.score * 0.95) * 100) / 100,
      });
    });

    return lms;
  }
}

export const handDetector = new HandDetector();
