// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Experiment & General Object Detector
// Multi-class object detection using TF.js COCO-SSD (lite_mobilenet_v2).
// Detects all objects in front of webcam with expanded space-mapped terminology
// and fallback workspace spatial fixtures.
// ─────────────────────────────────────────────────────────────────────────────

import type { ObjectDetection, BoundingBox } from '@/types/vision';
import { tfjsLoader } from './tfjsLoader';

// Mapping of COCO labels to Space Experiment terminology
const COCO_SPACE_MAP: Record<string, string> = {
  bottle: 'SAMPLE CONTAINER',
  cup: 'OBSERVATION CHAMBER',
  box: 'EXPERIMENT MODULE',
  cellphone: 'IMAGING UNIT',
  laptop: 'WORKSTATION',
  book: 'PROCEDURE LOG',
  scissors: 'EXPERIMENT TOOL',
  mouse: 'FLUIDIC CONTROLLER',
  keyboard: 'WORKSTATION FIXTURE',
  chair: 'OPERATOR SEAT',
  backpack: 'EQUIPMENT BAG',
  handbag: 'SAMPLE POUCH',
  suitcase: 'CARGO MODULE',
  remote: 'CONTROL TRANSCEIVER',
  clock: 'MISSION TIMER',
  tv: 'MONITOR DISPLAY',
  bowl: 'CONTAINMENT DISH',
  vase: 'SAMPLE RECEPTACLE',
  umbrella: 'SUN SHIELD',
};

export class ObjectDetector {
  async detectObjects(
    video: HTMLVideoElement,
    _canvas: HTMLCanvasElement,
    hands: { box: BoundingBox }[]
  ): Promise<ObjectDetection[]> {
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (!width || !height || video.readyState < 2) {
      return [];
    }

    const { cocoModel } = tfjsLoader.getModels();
    const objects: ObjectDetection[] = [];

    // 1. Run COCO-SSD detection with low threshold (0.15) to detect EVERYTHING in front of camera
    if (cocoModel) {
      try {
        const predictions = await cocoModel.detect(video, 20, 0.15);
        const objPreds = predictions.filter((p) => p.class !== 'person');

        objPreds.forEach((pred, idx) => {
          const [px, py, pw, ph] = pred.bbox;
          const classLower = pred.class.toLowerCase();
          const mappedLabel = COCO_SPACE_MAP[classLower] || pred.class.toUpperCase();
          const score = Math.round((pred.score || 0.80) * 100);

          objects.push({
            id: `obj-${idx + 1}`,
            label: mappedLabel,
            confidence: score,
            box: {
              x: Math.round(px),
              y: Math.round(py),
              width: Math.round(pw),
              height: Math.round(ph),
            },
            trackingId: `OBJ-${String(idx + 1).padStart(2, '0')}`,
          });
        });
      } catch (err) {
        console.warn('[ObjectDetector] COCO inference error:', err);
      }
    }

    // 2. Fallback / Workspace Fixture spatial detection if fewer than 3 objects detected
    if (objects.length < 3) {
      const workspaceObjects = this.detectWorkspaceFixtures(width, height, hands);
      workspaceObjects.forEach((wo) => {
        if (!objects.some((o) => o.label === wo.label)) {
          objects.push(wo);
        }
      });
    }

    return objects;
  }

  private detectWorkspaceFixtures(
    frameW: number,
    frameH: number,
    hands: { box: BoundingBox }[]
  ): ObjectDetection[] {
    const results: ObjectDetection[] = [];

    // Primary Experiment Module region
    const modBox: BoundingBox = {
      x: Math.round(frameW * 0.32),
      y: Math.round(frameH * 0.45),
      width: Math.round(frameW * 0.36),
      height: Math.round(frameH * 0.38),
    };

    let proxBonus = 0;
    if (hands.length > 0) {
      const hand = hands[0].box;
      const dist = Math.hypot(
        hand.x + hand.width / 2 - (modBox.x + modBox.width / 2),
        hand.y + hand.height / 2 - (modBox.y + modBox.height / 2)
      );
      if (dist < 200) proxBonus = 5;
    }

    results.push({
      id: 'obj-exp-mod',
      label: 'EXPERIMENT MODULE',
      confidence: Math.min(98, 92 + proxBonus),
      box: modBox,
      trackingId: 'MOD-01',
      isSimulated: true,
    });

    results.push({
      id: 'obj-obs-cham',
      label: 'OBSERVATION CHAMBER',
      confidence: Math.min(97, 89 + proxBonus),
      box: {
        x: Math.round(frameW * 0.38),
        y: Math.round(frameH * 0.52),
        width: Math.round(frameW * 0.16),
        height: Math.round(frameH * 0.22),
      },
      trackingId: 'CHAM-01',
      isSimulated: true,
    });

    results.push({
      id: 'obj-img-unit',
      label: 'IMAGING UNIT',
      confidence: 91,
      box: {
        x: Math.round(frameW * 0.56),
        y: Math.round(frameH * 0.48),
        width: Math.round(frameW * 0.12),
        height: Math.round(frameH * 0.20),
      },
      trackingId: 'IMG-01',
      isSimulated: true,
    });

    results.push({
      id: 'obj-wk-fix',
      label: 'WORKSTATION FIXTURE',
      confidence: 94,
      box: {
        x: Math.round(frameW * 0.20),
        y: Math.round(frameH * 0.70),
        width: Math.round(frameW * 0.60),
        height: Math.round(frameH * 0.25),
      },
      trackingId: 'FIX-01',
      isSimulated: true,
    });

    return results;
  }
}

export const objectDetector = new ObjectDetector();
