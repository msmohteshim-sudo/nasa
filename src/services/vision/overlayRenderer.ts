// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Camera Overlay Renderer
// Draws real-time overlay graphics (bounding boxes, pose skeleton, hand landmarks,
// object regions, motion vectors, interaction links) directly onto the camera canvas.
// ─────────────────────────────────────────────────────────────────────────────

import type { VisionResult, VisionOverlaySettings } from '@/types/vision';

// Skeleton joint connection pairs for 17 COCO landmarks
const SKELETON_CONNECTIONS: [string, string][] = [
  ['nose', 'left_eye'], ['nose', 'right_eye'],
  ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle'],
];

export class OverlayRenderer {
  renderOverlay(
    ctx: CanvasRenderingContext2D,
    result: VisionResult,
    settings: VisionOverlaySettings,
    canvasW: number,
    canvasH: number
  ): void {
    ctx.clearRect(0, 0, canvasW, canvasH);

    // 1. Draw Region of Interest (ROI) workspace boundary if enabled
    if (settings.showROI) {
      this.drawROI(ctx, canvasW, canvasH);
    }

    // 2. Draw Object Bounding Boxes
    if (settings.showObjects) {
      result.objects.forEach((obj) => {
        this.drawObjectBox(ctx, obj);
      });
    }

    // 3. Draw Person Bounding Boxes
    if (settings.showPersonBoxes) {
      result.persons.forEach((person) => {
        this.drawPersonBox(ctx, person);
      });
    }

    // 4. Draw Pose Skeleton & Landmarks
    if (settings.showPoseSkeleton) {
      result.poses.forEach((pose) => {
        this.drawSkeleton(ctx, pose);
      });
    }

    // 5. Draw Hand Landmarks & Boxes
    if (settings.showHands) {
      result.hands.forEach((hand) => {
        this.drawHand(ctx, hand);
      });
    }

    // 6. Draw Motion Vectors
    if (settings.showMotionVectors) {
      result.motions.forEach((motion) => {
        this.drawMotionVectors(ctx, motion, result.poses);
      });
    }

    // 7. Draw Interaction Lines & Badges
    if (settings.showInteractions) {
      result.interactions.forEach((inter) => {
        this.drawInteraction(ctx, inter, result.hands, result.objects);
      });
    }

    // 8. Draw Secondary Person Warning overlay if > 1 person present
    if (result.secondaryPersonPresent) {
      this.drawSecondaryPersonWarning(ctx, canvasW);
    }
  }

  private drawROI(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const rx = w * 0.15;
    const ry = h * 0.35;
    const rw = w * 0.70;
    const rh = h * 0.60;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 102, 204, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(rx, ry, rw, rh);

    ctx.fillStyle = '#0066CC';
    ctx.font = '10px monospace';
    ctx.fillText('EXPERIMENT WORKSPACE (ROI)', rx + 8, ry + 16);
    ctx.restore();
  }

  private drawPersonBox(ctx: CanvasRenderingContext2D, person: import('@/types/vision').PersonDetection) {
    const { x, y, width, height } = person.box;

    ctx.save();
    ctx.strokeStyle = person.isPrimary ? '#00E676' : '#FF9100'; // Emerald for primary operator, amber for secondary
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Header badge
    const badgeText = `${person.id} • ${person.confidence}%`;
    ctx.fillStyle = person.isPrimary ? '#002244' : '#5D4037';
    ctx.fillRect(x, Math.max(0, y - 24), Math.max(140, ctx.measureText(badgeText).width + 16), 24);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(badgeText, x + 8, Math.max(16, y - 8));

    // Corner brackets
    const bracketLen = 14;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(x, y + bracketLen); ctx.lineTo(x, y); ctx.lineTo(x + bracketLen, y); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(x + width - bracketLen, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + bracketLen); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(x, y + height - bracketLen); ctx.lineTo(x, y + height); ctx.lineTo(x + bracketLen, y + height); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(x + width - bracketLen, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - bracketLen); ctx.stroke();

    ctx.restore();
  }

  private drawSkeleton(ctx: CanvasRenderingContext2D, pose: import('@/types/vision').PoseLandmarks) {
    const lmsMap = new Map<string, import('@/types/vision').Landmark>();
    pose.landmarks.forEach((l) => lmsMap.set(l.name, l));

    ctx.save();
    // Skeleton Connection Lines
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2.5;

    SKELETON_CONNECTIONS.forEach(([p1Name, p2Name]) => {
      const p1 = lmsMap.get(p1Name);
      const p2 = lmsMap.get(p2Name);
      if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // Landmark Joint Dots
    pose.landmarks.forEach((l) => {
      if (l.score > 0.3) {
        ctx.fillStyle = l.name.includes('eye') || l.name === 'nose' ? '#FFEA00' : '#00E676';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  private drawHand(ctx: CanvasRenderingContext2D, hand: import('@/types/vision').HandDetection) {
    const { x, y, width, height } = hand.box;

    ctx.save();
    ctx.strokeStyle = '#E040FB';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = '#4A148C';
    ctx.fillRect(x, Math.max(0, y - 18), 85, 18);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`${hand.hand} HAND`, x + 6, Math.max(12, y - 5));

    // Finger Dots
    hand.landmarks.forEach((l) => {
      ctx.fillStyle = '#E040FB';
      ctx.beginPath();
      ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  private drawObjectBox(ctx: CanvasRenderingContext2D, obj: import('@/types/vision').ObjectDetection) {
    const { x, y, width, height } = obj.box;

    ctx.save();
    ctx.strokeStyle = '#FF6D00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    const text = `${obj.label} ${obj.confidence}%`;
    ctx.fillStyle = '#E65100';
    ctx.fillRect(x, Math.max(0, y - 20), Math.max(120, ctx.measureText(text).width + 12), 20);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(text, x + 6, Math.max(14, y - 6));
    ctx.restore();
  }

  private drawMotionVectors(
    ctx: CanvasRenderingContext2D,
    motion: import('@/types/vision').PersonMotion,
    poses: import('@/types/vision').PoseLandmarks[]
  ) {
    const pose = poses.find((p) => p.personId === motion.personId);
    if (!pose) return;

    ctx.save();
    motion.regions.forEach((r) => {
      if (r.level === 'HIGH_MOVEMENT' || r.level === 'MODERATE_MOVEMENT') {
        const matchingLms = pose.landmarks.filter((l) =>
          r.partName.toLowerCase().includes(l.name.split('_')[1] || l.name)
        );

        matchingLms.forEach((lm) => {
          ctx.strokeStyle = '#FF1744';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lm.x, lm.y);
          ctx.lineTo(lm.x + (r.magnitude > 50 ? 18 : 10), lm.y - 12);
          ctx.stroke();
        });
      }
    });
    ctx.restore();
  }

  private drawInteraction(
    ctx: CanvasRenderingContext2D,
    inter: import('@/types/vision').InteractionResult,
    hands: import('@/types/vision').HandDetection[],
    objects: import('@/types/vision').ObjectDetection[]
  ) {
    const hand = hands.find((h) => h.hand === inter.hand);
    const obj = objects.find((o) => o.id === inter.objectId);

    if (hand && obj) {
      const hCx = hand.box.x + hand.box.width / 2;
      const hCy = hand.box.y + hand.box.height / 2;
      const oCx = obj.box.x + obj.box.width / 2;
      const oCy = obj.box.y + obj.box.height / 2;

      ctx.save();
      ctx.strokeStyle = '#7C4DFF';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hCx, hCy);
      ctx.lineTo(oCx, oCy);
      ctx.stroke();

      // Interaction Badge at midpoint
      const midX = (hCx + oCx) / 2;
      const midY = (hCy + oCy) / 2;
      const badgeText = `${inter.type}: ${inter.objectLabel} (${inter.confidence}%)`;

      ctx.fillStyle = '#311B92';
      ctx.fillRect(midX - 70, midY - 12, 140, 24);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(badgeText, midX - 64, midY + 4);
      ctx.restore();
    }
  }

  private drawSecondaryPersonWarning(ctx: CanvasRenderingContext2D, canvasW: number) {
    ctx.save();
    ctx.fillStyle = '#D50000';
    ctx.fillRect(canvasW - 210, 10, 200, 26);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('⚠ SECONDARY PERSON PRESENT', canvasW - 200, 27);
    ctx.restore();
  }
}

export const overlayRenderer = new OverlayRenderer();
