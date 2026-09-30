// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Mission Anomaly Detection Engine
// Real-time detection of microgravity floating objects, spatial zone boundary violations,
// procedure sequence errors, and operator safety/inactivity anomalies.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AnomalyEvent,
  ObjectDetection,
  PersonDetection,
  InteractionResult,
  ZoneOccupancy,
  MissionTask,
  SpatialZone,
} from '@/types/vision';

export class AnomalyEngine {
  private activeAnomalies: Map<string, AnomalyEvent> = new Map();
  private objectNoContactFrames: Map<string, number> = new Map();
  private lastOperatorActivityMs: number = Date.now();

  getActiveAnomalies(): AnomalyEvent[] {
    return Array.from(this.activeAnomalies.values());
  }

  clearAnomaly(anomalyId: string): void {
    this.activeAnomalies.delete(anomalyId);
  }

  clearAllAnomalies(): void {
    this.activeAnomalies.clear();
  }

  /**
   * Evaluate frame detections and identify mission anomalies
   */
  evaluateAnomalies(
    persons: PersonDetection[],
    objects: ObjectDetection[],
    interactions: InteractionResult[],
    zones: ZoneOccupancy[],
    spatialZones: SpatialZone[],
    activeTask?: MissionTask
  ): AnomalyEvent[] {
    const newAnomalies: AnomalyEvent[] = [];
    const nowMs = Date.now();
    const nowHHMMSS = new Date().toLocaleTimeString('en-GB', { hour12: false });

    // 1. Microgravity Floating Object Detection
    objects.forEach((obj) => {
      // Check if object has high velocity vector (moving across frame)
      const speed = obj.velocity ? Math.hypot(obj.velocity.dx, obj.velocity.dy) : 0;
      const isInteracting = interactions.some((i) => i.objectId === obj.id);

      if (!isInteracting && speed > 3.5) {
        const frames = (this.objectNoContactFrames.get(obj.id) || 0) + 1;
        this.objectNoContactFrames.set(obj.id, frames);

        // Require 5 consecutive frames of unanchored motion to confirm
        if (frames >= 5) {
          const anomalyId = `ANOM-FLOAT-${obj.id}`;
          const anomaly: AnomalyEvent = {
            id: anomalyId,
            type: 'FLOATING_OBJECT',
            severity: 'HIGH',
            title: 'Unanchored Object Drift Alert',
            message: `Unsecured ${obj.label} floating with velocity vector (${obj.velocity?.dx.toFixed(1)}, ${obj.velocity?.dy.toFixed(1)})`,
            timestamp: nowHHMMSS,
            timestampMs: nowMs,
            locationZone: obj.currentZone || 'Unknown Zone',
            entityId: obj.id,
            resolved: false,
          };
          this.activeAnomalies.set(anomalyId, anomaly);
          newAnomalies.push(anomaly);
        }
      } else {
        this.objectNoContactFrames.set(obj.id, 0);
      }
    });

    // 2. Spatial Zone Violation Detection
    zones.forEach((occ) => {
      const defZone = spatialZones.find((z) => z.id === occ.zoneId);
      if (defZone && defZone.type === 'AIRLOCK_SAFETY') {
        // If airlock zone occupied while task is NOT airlock safety check
        if (occ.personIds.length > 0) {
          const isAirlockTask = activeTask?.category === 'SAFETY' || activeTask?.name.toLowerCase().includes('airlock');
          if (!isAirlockTask) {
            const anomalyId = `ANOM-ZONE-${occ.zoneId}`;
            const anomaly: AnomalyEvent = {
              id: anomalyId,
              type: 'ZONE_VIOLATION',
              severity: 'CRITICAL',
              title: 'Airlock Safety Boundary Breach',
              message: `Operator ${occ.personIds[0]} entered Airlock Safety Zone without active EVA/Airlock procedure authorization.`,
              timestamp: nowHHMMSS,
              timestampMs: nowMs,
              locationZone: defZone.name,
              entityId: occ.personIds[0],
              resolved: false,
            };
            this.activeAnomalies.set(anomalyId, anomaly);
            newAnomalies.push(anomaly);
          }
        }
      }
    });

    // 3. Inactivity Alert Detection
    const hasMovement = persons.some((p) => p.velocity && (Math.abs(p.velocity.dx) > 1 || Math.abs(p.velocity.dy) > 1));
    if (hasMovement || interactions.length > 0) {
      this.lastOperatorActivityMs = nowMs;
    } else if (persons.length > 0 && activeTask?.status === 'IN_PROGRESS') {
      const inactiveSec = Math.round((nowMs - this.lastOperatorActivityMs) / 1000);
      if (inactiveSec >= 20) {
        const anomalyId = 'ANOM-INACTIVE-OPERATOR';
        const anomaly: AnomalyEvent = {
          id: anomalyId,
          type: 'INACTIVITY_ALERT',
          severity: 'MEDIUM',
          title: 'Operator Inactivity Alert',
          message: `No operator motion detected for ${inactiveSec} seconds during active procedure "${activeTask.name}".`,
          timestamp: nowHHMMSS,
          timestampMs: nowMs,
          locationZone: persons[0]?.currentZone || 'Workstation',
          entityId: persons[0]?.id,
          resolved: false,
        };
        this.activeAnomalies.set(anomalyId, anomaly);
        newAnomalies.push(anomaly);
      }
    }

    return newAnomalies;
  }
}

export const anomalyEngine = new AnomalyEngine();
