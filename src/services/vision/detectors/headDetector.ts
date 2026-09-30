// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Head & Face Orientation Analyzer
// Analyzes head pose & gaze orientation from facial landmarks.
// Anonymous only (NO facial recognition / identity matching).
// ─────────────────────────────────────────────────────────────────────────────

import type { FaceAnalysis, PoseLandmarks, HeadOrientation, BoundingBox } from '@/types/vision';

export class HeadDetector {
  analyzeFaces(poses: PoseLandmarks[]): FaceAnalysis[] {
    const faces: FaceAnalysis[] = [];

    poses.forEach((pose) => {
      const headLms = pose.regions.head;
      if (headLms.length === 0) return;

      const nose = headLms.find((l) => l.name === 'nose');
      const leftEye = headLms.find((l) => l.name === 'left_eye');
      const rightEye = headLms.find((l) => l.name === 'right_eye');

      let orientation: HeadOrientation = 'LOOKING_FORWARD';

      if (nose && leftEye && rightEye) {
        const eyeCenter = (leftEye.x + rightEye.x) / 2;
        const eyeDist = Math.abs(leftEye.x - rightEye.x);
        const noseOffset = nose.x - eyeCenter;

        if (noseOffset > eyeDist * 0.35) {
          orientation = 'LOOKING_RIGHT';
        } else if (noseOffset < -eyeDist * 0.35) {
          orientation = 'LOOKING_LEFT';
        } else if (nose.y < leftEye.y) {
          orientation = 'LOOKING_UP';
        } else if (nose.y > leftEye.y + eyeDist * 0.8) {
          orientation = 'LOOKING_DOWN';
        }
      }

      // Compute face bounding box
      let faceBox: BoundingBox | undefined = undefined;
      const validLms = headLms.filter((l) => l.score > 0.3);
      if (validLms.length > 0) {
        const minX = Math.min(...validLms.map((l) => l.x));
        const maxX = Math.max(...validLms.map((l) => l.x));
        const minY = Math.min(...validLms.map((l) => l.y));
        const maxY = Math.max(...validLms.map((l) => l.y));
        const pad = 20;

        faceBox = {
          x: Math.max(0, Math.round(minX - pad)),
          y: Math.max(0, Math.round(minY - pad)),
          width: Math.round(maxX - minX + pad * 2),
          height: Math.round(maxY - minY + pad * 2),
        };
      }

      const avgScore = validLms.length > 0
        ? Math.round((validLms.reduce((a, b) => a + b.score, 0) / validLms.length) * 100)
        : 88;

      faces.push({
        personId: pose.personId,
        box: faceBox,
        confidence: avgScore,
        orientation,
        landmarksCount: validLms.length,
      });
    });

    return faces;
  }
}

export const headDetector = new HeadDetector();
