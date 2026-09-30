// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Control Vision Canvas Overlay Renderer
// Renders rich space-grade visual telemetry on HTML5 Canvas:
// - Live video frame composition for unified video + AI overlay recording
// - Spatial zone boundaries & occupancy badges
// - Multi-person skeletons & pose keypoints
// - Multi-object bounding boxes, persistent track IDs & trajectory trails
// - Hand-object interaction state connection lines ([APPROACHING], [HOLDING], [MOVING])
// - Real-time Task HUD & Anomaly Warning Overlay
// ─────────────────────────────────────────────────────────────────────────────

import type { VisionResult, VisionOverlaySettings } from '@/types/vision';
import { DEFAULT_OVERLAY_SETTINGS } from '@/config/missionConfig';
import { zoneEngine } from './zoneEngine';

export class OverlayRenderer {
  render(
    canvas: HTMLCanvasElement,
    result: VisionResult,
    settings: VisionOverlaySettings = DEFAULT_OVERLAY_SETTINGS,
    videoElement?: HTMLVideoElement | null
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Composite live video frame onto canvas if available (allows full video + overlay recording)
    if (videoElement && videoElement.readyState >= 2) {
      try {
        ctx.drawImage(videoElement, 0, 0, width, height);
      } catch (e) {
        // Fallback if video draw fails
      }
    }

    // 1. Render Spatial Zones
    if (settings.showZones) {
      this.renderZones(ctx, width, height, result);
    }

    // 2. Render Object Trajectories & Bounding Boxes
    if (settings.showObjects) {
      this.renderObjects(ctx, result, settings.showTrajectories);
    }

    // 3. Render Person Skeletons & Bounding Boxes
    this.renderPersons(ctx, result, settings);

    // 4. Render Hand-Object Interaction Connection Lines
    if (settings.showInteractions) {
      this.renderInteractions(ctx, result);
    }

    // 5. Render Mission Task HUD & Anomaly Highlights
    if (settings.showTaskHUD) {
      this.renderMissionHUD(ctx, width, height, result);
    }
  }

  private renderZones(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    result: VisionResult
  ): void {
    const zones = zoneEngine.getZones();
    const occupancies = result.zones || [];

    zones.forEach((zone) => {
      const zx = zone.normalizedBox.x * width;
      const zy = zone.normalizedBox.y * height;
      const zw = zone.normalizedBox.width * width;
      const zh = zone.normalizedBox.height * height;

      const occ = occupancies.find((o) => o.zoneId === zone.id);
      const occupantCount = occ?.occupantCount || 0;

      // Fill translucent background
      ctx.fillStyle = this.hexToRgba(zone.color, occupantCount > 0 ? 0.12 : 0.05);
      ctx.fillRect(zx, zy, zw, zh);

      // Border stroke
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = occupantCount > 0 ? 2 : 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(zx, zy, zw, zh);
      ctx.setLineDash([]);

      // Label badge
      ctx.fillStyle = zone.color;
      ctx.fillRect(zx, zy, Math.min(180, zw), 20);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${zone.name.toUpperCase()} [${occupantCount}]`, zx + 6, zy + 14);
    });
  }

  private renderObjects(
    ctx: CanvasRenderingContext2D,
    result: VisionResult,
    showTrajectories: boolean
  ): void {
    result.objects.forEach((obj) => {
      const { x, y, width, height } = obj.box;

      // Trajectory trail
      if (showTrajectories && obj.trajectory && obj.trajectory.length > 1) {
        ctx.strokeStyle = '#38BDF8'; // Sky blue
        ctx.lineWidth = 2;
        ctx.beginPath();
        obj.trajectory.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      }

      // Box
      const color = obj.isSimulated ? '#F59E0B' : '#06B6D4'; // Amber for simulated, Cyan for detected
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Label background
      const labelText = `${obj.trackingId || 'OBJ'} | ${obj.label} ${obj.confidence}%${obj.isSimulated ? ' (SIM)' : ''}`;
      ctx.font = 'bold 11px Inter, sans-serif';
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = color;
      ctx.fillRect(x, Math.max(0, y - 20), textWidth + 12, 20);

      ctx.fillStyle = '#000000';
      ctx.fillText(labelText, x + 6, Math.max(14, y - 6));
    });
  }

  private renderPersons(
    ctx: CanvasRenderingContext2D,
    result: VisionResult,
    settings: VisionOverlaySettings
  ): void {
    // Person Box & Trajectory
    if (settings.showPersonBoxes) {
      result.persons.forEach((person) => {
        const { x, y, width, height } = person.box;
        ctx.strokeStyle = '#10B981'; // Emerald green
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        const personLabel = `${person.id} | ASTRONAUT ${person.confidence}%`;
        ctx.font = 'bold 11px Inter, sans-serif';
        const tw = ctx.measureText(personLabel).width;

        ctx.fillStyle = '#10B981';
        ctx.fillRect(x, Math.max(0, y - 20), tw + 12, 20);
        ctx.fillStyle = '#000000';
        ctx.fillText(personLabel, x + 6, Math.max(14, y - 6));
      });
    }

    // Pose Skeletons
    if (settings.showPoseSkeleton) {
      result.poses.forEach((pose) => {
        const keypoints = pose.landmarks;

        // Draw connections
        const connections = [
          [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Arms
          [5, 11], [6, 12], [11, 12], // Torso
          [11, 13], [13, 15], [12, 14], [14, 16] // Legs
        ];

        ctx.strokeStyle = '#A855F7'; // Purple skeleton
        ctx.lineWidth = 2;

        connections.forEach(([i1, i2]) => {
          const p1 = keypoints[i1];
          const p2 = keypoints[i2];
          if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        // Keypoints
        keypoints.forEach((kp) => {
          if (kp.score > 0.3) {
            ctx.fillStyle = '#EC4899';
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      });
    }
  }

  private renderInteractions(ctx: CanvasRenderingContext2D, result: VisionResult): void {
    result.interactions.forEach((inter) => {
      const hand = result.hands.find((h) => h.personId === inter.personId && h.hand === inter.hand);
      const obj = result.objects.find((o) => o.id === inter.objectId);

      if (hand && obj) {
        const hCx = hand.box.x + hand.box.width / 2;
        const hCy = hand.box.y + hand.box.height / 2;
        const oCx = obj.box.x + obj.box.width / 2;
        const oCy = obj.box.y + obj.box.height / 2;

        // Dotted connection line
        ctx.strokeStyle = inter.interactionState === 'MOVING' ? '#EF4444' : '#F59E0B';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(hCx, hCy);
        ctx.lineTo(oCx, oCy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Badge at midpoint
        const midX = (hCx + oCx) / 2;
        const midY = (hCy + oCy) / 2;

        const stateLabel = `[${inter.interactionState || inter.type}] ${inter.spatialDistance}px`;
        ctx.font = 'bold 10px monospace';
        const tw = ctx.measureText(stateLabel).width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(midX - tw / 2 - 4, midY - 10, tw + 8, 16);

        ctx.fillStyle = '#F59E0B';
        ctx.fillText(stateLabel, midX - tw / 2, midY + 2);
      }
    });
  }

  private renderMissionHUD(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    result: VisionResult
  ): void {
    // Top-Right Task HUD
    if (result.activeTask) {
      const task = result.activeTask;
      const currentStep = task.steps[task.currentStepIndex];

      const hudW = 240;
      const hudH = 75;
      const hudX = width - hudW - 12;
      const hudY = 12;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(hudX, hudY, hudW, hudH);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1;
      ctx.strokeRect(hudX, hudY, hudW, hudH);

      ctx.fillStyle = '#60A5FA';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`PROCEDURE ENGINE: ${task.status}`, hudX + 10, hudY + 18);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      const truncatedTitle = task.name.length > 28 ? task.name.substring(0, 26) + '...' : task.name;
      ctx.fillText(truncatedTitle, hudX + 10, hudY + 34);

      if (currentStep) {
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`STEP ${currentStep.stepNumber}: ${currentStep.title}`, hudX + 10, hudY + 50);

        // Step Progress Bar
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(hudX + 10, hudY + 56, hudW - 20, 6);

        ctx.fillStyle = '#10B981';
        ctx.fillRect(hudX + 10, hudY + 56, ((hudW - 20) * currentStep.progress) / 100, 6);
      }
    }

    // Active Anomalies Banner at Bottom Left
    if (result.anomalies && result.anomalies.length > 0) {
      const anomaly = result.anomalies[0];
      const bannerX = 12;
      const bannerY = height - 40;

      ctx.fillStyle = anomaly.severity === 'CRITICAL' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(217, 119, 6, 0.9)';
      ctx.fillRect(bannerX, bannerY, 340, 28);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`⚠️ ALERT: ${anomaly.title}`, bannerX + 8, bannerY + 18);
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

export const overlayRenderer = new OverlayRenderer();
