// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Spatial Zone Reasoning Engine
// Maps screen-space bounding box centroids & bounding volumes to defined 2D/3D zones.
// Computes zone occupancy, entry/exit state transitions, and boundary alerts.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  SpatialZone,
  ZoneOccupancy,
  PersonDetection,
  ObjectDetection,
  BoundingBox,
} from '@/types/vision';
import { DEFAULT_SPATIAL_ZONES } from '@/config/missionConfig';

export class ZoneEngine {
  private zones: SpatialZone[] = [...DEFAULT_SPATIAL_ZONES];
  private previousOccupancy: Map<string, { persons: Set<string>; objects: Set<string> }> = new Map();

  constructor() {
    this.zones.forEach((zone) => {
      this.previousOccupancy.set(zone.id, { persons: new Set(), objects: new Set() });
    });
  }

  setZones(customZones: SpatialZone[]): void {
    this.zones = customZones;
    this.previousOccupancy.clear();
    this.zones.forEach((zone) => {
      this.previousOccupancy.set(zone.id, { persons: new Set(), objects: new Set() });
    });
  }

  getZones(): SpatialZone[] {
    return this.zones;
  }

  /**
   * Process frame detections and compute zone assignments & occupancy
   */
  processZones(
    persons: PersonDetection[],
    objects: ObjectDetection[],
    frameW: number,
    frameH: number
  ): {
    updatedPersons: PersonDetection[];
    updatedObjects: ObjectDetection[];
    zoneOccupancies: ZoneOccupancy[];
    events: { type: 'ENTER' | 'EXIT'; zoneId: string; zoneName: string; entityId: string; entityType: 'PERSON' | 'OBJECT' }[];
  } {
    const updatedPersons = [...persons];
    const updatedObjects = [...objects];
    const occupancies: ZoneOccupancy[] = [];
    const events: { type: 'ENTER' | 'EXIT'; zoneId: string; zoneName: string; entityId: string; entityType: 'PERSON' | 'OBJECT' }[] = [];

    const nowMs = Date.now();

    this.zones.forEach((zone) => {
      // Convert normalized zone box (0..1) to pixel space
      const pxZone: BoundingBox = {
        x: zone.normalizedBox.x * frameW,
        y: zone.normalizedBox.y * frameH,
        width: zone.normalizedBox.width * frameW,
        height: zone.normalizedBox.height * frameH,
      };

      const currentPersons = new Set<string>();
      const currentObjects = new Set<string>();

      // Check persons
      updatedPersons.forEach((person) => {
        const cx = person.box.x + person.box.width / 2;
        const cy = person.box.y + person.box.height / 2;

        if (this.isPointInsideBox(cx, cy, pxZone)) {
          currentPersons.add(person.id);
          person.currentZone = zone.name;
        }
      });

      // Check objects
      updatedObjects.forEach((obj) => {
        const cx = obj.box.x + obj.box.width / 2;
        const cy = obj.box.y + obj.box.height / 2;

        if (this.isPointInsideBox(cx, cy, pxZone)) {
          currentObjects.add(obj.id);
          obj.currentZone = zone.name;
        }
      });

      // Compare with previous occupancy for transition events
      const prev = this.previousOccupancy.get(zone.id) || { persons: new Set(), objects: new Set() };

      // Persons entered
      currentPersons.forEach((pid) => {
        if (!prev.persons.has(pid)) {
          events.push({ type: 'ENTER', zoneId: zone.id, zoneName: zone.name, entityId: pid, entityType: 'PERSON' });
        }
      });
      // Persons exited
      prev.persons.forEach((pid) => {
        if (!currentPersons.has(pid)) {
          events.push({ type: 'EXIT', zoneId: zone.id, zoneName: zone.name, entityId: pid, entityType: 'PERSON' });
        }
      });

      // Objects entered
      currentObjects.forEach((oid) => {
        if (!prev.objects.has(oid)) {
          events.push({ type: 'ENTER', zoneId: zone.id, zoneName: zone.name, entityId: oid, entityType: 'OBJECT' });
        }
      });
      // Objects exited
      prev.objects.forEach((oid) => {
        if (!currentObjects.has(oid)) {
          events.push({ type: 'EXIT', zoneId: zone.id, zoneName: zone.name, entityId: oid, entityType: 'OBJECT' });
        }
      });

      // Store current occupancy
      this.previousOccupancy.set(zone.id, { persons: currentPersons, objects: currentObjects });

      occupancies.push({
        zoneId: zone.id,
        zoneName: zone.name,
        personIds: Array.from(currentPersons),
        objectIds: Array.from(currentObjects),
        occupantCount: currentPersons.size + currentObjects.size,
        lastChangedMs: nowMs,
      });
    });

    return {
      updatedPersons,
      updatedObjects,
      zoneOccupancies: occupancies,
      events,
    };
  }

  private isPointInsideBox(px: number, py: number, box: BoundingBox): boolean {
    return px >= box.x && px <= box.x + box.width && py >= box.y && py <= box.y + box.height;
  }
}

export const zoneEngine = new ZoneEngine();
