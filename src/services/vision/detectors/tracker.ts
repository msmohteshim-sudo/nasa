// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Multi-Person & Multi-Object Spatial Tracker
// Maintains persistent tracking IDs (Person #01, OBJ-01) across frames.
// Implements IoU matching, spatial centroid velocity prediction, trajectory buffers,
// and state lifecycle management (NEW -> ACTIVE -> OCCLUDED -> RECOVERED -> LOST).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PersonDetection,
  ObjectDetection,
  BoundingBox,
  TrackState,
  TrackHistoryPoint,
} from '@/types/vision';

interface ActiveTrack {
  id: string;
  trackingId: string;
  type: 'PERSON' | 'OBJECT';
  lastBox: BoundingBox;
  lastSeenFrame: number;
  lastSeenMs: number;
  firstSeenMs: number;
  state: TrackState;
  trajectory: TrackHistoryPoint[];
  velocity: { dx: number; dy: number };
}

export class Tracker {
  private personTracks: Map<string, ActiveTrack> = new Map();
  private objectTracks: Map<string, ActiveTrack> = new Map();
  private nextPersonTrackNum = 1;
  private nextObjectTrackNum = 1;

  /**
   * Track persons across video frames with trajectory trails and state machine
   */
  updatePersonTracks(persons: PersonDetection[], currentFrameId: number): PersonDetection[] {
    const nowMs = Date.now();
    const updatedPersons: PersonDetection[] = [];
    const matchedTrackIds = new Set<string>();

    persons.forEach((person) => {
      let matchedTrackId: string | null = null;
      let bestIoU = 0;

      // Match against existing person tracks
      this.personTracks.forEach((track, tid) => {
        const iou = this.calculateIoU(person.box, track.lastBox);
        if (iou > 0.25 && iou > bestIoU) {
          bestIoU = iou;
          matchedTrackId = tid;
        }
      });

      // Centroid distance fallback if IoU is weak
      if (!matchedTrackId) {
        let minDistance = 120; // pixel distance threshold
        const pCx = person.box.x + person.box.width / 2;
        const pCy = person.box.y + person.box.height / 2;

        this.personTracks.forEach((track, tid) => {
          if (matchedTrackIds.has(tid)) return;
          const tCx = track.lastBox.x + track.lastBox.width / 2;
          const tCy = track.lastBox.y + track.lastBox.height / 2;
          const dist = Math.hypot(pCx - tCx, pCy - tCy);
          if (dist < minDistance) {
            minDistance = dist;
            matchedTrackId = tid;
          }
        });
      }

      let track: ActiveTrack;

      if (matchedTrackId && this.personTracks.has(matchedTrackId)) {
        track = this.personTracks.get(matchedTrackId)!;
        matchedTrackIds.add(matchedTrackId);

        // Velocity vector
        const prevCx = track.lastBox.x + track.lastBox.width / 2;
        const prevCy = track.lastBox.y + track.lastBox.height / 2;
        const curCx = person.box.x + person.box.width / 2;
        const curCy = person.box.y + person.box.height / 2;

        track.velocity = { dx: curCx - prevCx, dy: curCy - prevCy };
        track.lastBox = person.box;
        track.lastSeenFrame = currentFrameId;
        track.lastSeenMs = nowMs;
        track.state = track.state === 'OCCLUDED' ? 'RECOVERED' : 'ACTIVE';
      } else {
        // Create new person track
        const trackIdStr = `Person #${String(this.nextPersonTrackNum++).padStart(2, '0')}`;
        track = {
          id: trackIdStr,
          trackingId: trackIdStr,
          type: 'PERSON',
          lastBox: person.box,
          lastSeenFrame: currentFrameId,
          lastSeenMs: nowMs,
          firstSeenMs: nowMs,
          state: 'NEW',
          trajectory: [],
          velocity: { dx: 0, dy: 0 },
        };
        this.personTracks.set(trackIdStr, track);
        matchedTrackIds.add(trackIdStr);
      }

      // Record trajectory history (up to 30 frame positions)
      const cx = person.box.x + person.box.width / 2;
      const cy = person.box.y + person.box.height / 2;
      track.trajectory.push({ x: cx, y: cy, timestamp: nowMs });
      if (track.trajectory.length > 30) track.trajectory.shift();

      updatedPersons.push({
        ...person,
        id: track.id,
        trackingId: parseInt(track.id.replace('Person #', ''), 10) || 1,
        trackingState: 'ACTIVE',
        trackState: track.state,
        trajectory: [...track.trajectory],
        velocity: track.velocity,
      });
    });

    // Mark unmatched tracks as OCCLUDED or LOST
    this.personTracks.forEach((track, tid) => {
      if (!matchedTrackIds.has(tid)) {
        const unseenFrames = currentFrameId - track.lastSeenFrame;
        if (unseenFrames > 60) {
          track.state = 'LOST';
          this.personTracks.delete(tid);
        } else {
          track.state = 'OCCLUDED';
        }
      }
    });

    return updatedPersons;
  }

  /**
   * Track space experiment objects across frames with velocity and persistent IDs
   */
  updateObjectTracks(objects: ObjectDetection[], currentFrameId: number): ObjectDetection[] {
    const nowMs = Date.now();
    const updatedObjects: ObjectDetection[] = [];
    const matchedTrackIds = new Set<string>();

    objects.forEach((obj) => {
      let matchedTrackId: string | null = null;
      let bestIoU = 0;

      // Match against existing object tracks of same label
      this.objectTracks.forEach((track, tid) => {
        if (matchedTrackIds.has(tid)) return;
        const iou = this.calculateIoU(obj.box, track.lastBox);
        if (iou > 0.20 && iou > bestIoU) {
          bestIoU = iou;
          matchedTrackId = tid;
        }
      });

      // Centroid distance fallback
      if (!matchedTrackId) {
        let minDistance = 100;
        const oCx = obj.box.x + obj.box.width / 2;
        const oCy = obj.box.y + obj.box.height / 2;

        this.objectTracks.forEach((track, tid) => {
          if (matchedTrackIds.has(tid)) return;
          const tCx = track.lastBox.x + track.lastBox.width / 2;
          const tCy = track.lastBox.y + track.lastBox.height / 2;
          const dist = Math.hypot(oCx - tCx, oCy - tCy);
          if (dist < minDistance) {
            minDistance = dist;
            matchedTrackId = tid;
          }
        });
      }

      let track: ActiveTrack;

      if (matchedTrackId && this.objectTracks.has(matchedTrackId)) {
        track = this.objectTracks.get(matchedTrackId)!;
        matchedTrackIds.add(matchedTrackId);

        const prevCx = track.lastBox.x + track.lastBox.width / 2;
        const prevCy = track.lastBox.y + track.lastBox.height / 2;
        const curCx = obj.box.x + obj.box.width / 2;
        const curCy = obj.box.y + obj.box.height / 2;

        track.velocity = { dx: curCx - prevCx, dy: curCy - prevCy };
        track.lastBox = obj.box;
        track.lastSeenFrame = currentFrameId;
        track.lastSeenMs = nowMs;
        track.state = track.state === 'OCCLUDED' ? 'RECOVERED' : 'ACTIVE';
      } else {
        const objTrackStr = `OBJ-${String(this.nextObjectTrackNum++).padStart(2, '0')}`;
        track = {
          id: objTrackStr,
          trackingId: objTrackStr,
          type: 'OBJECT',
          lastBox: obj.box,
          lastSeenFrame: currentFrameId,
          lastSeenMs: nowMs,
          firstSeenMs: nowMs,
          state: 'NEW',
          trajectory: [],
          velocity: { dx: 0, dy: 0 },
        };
        this.objectTracks.set(objTrackStr, track);
        matchedTrackIds.add(objTrackStr);
      }

      const cx = obj.box.x + obj.box.width / 2;
      const cy = obj.box.y + obj.box.height / 2;
      track.trajectory.push({ x: cx, y: cy, timestamp: nowMs });
      if (track.trajectory.length > 30) track.trajectory.shift();

      updatedObjects.push({
        ...obj,
        trackingId: track.id,
        trackState: track.state,
        trajectory: [...track.trajectory],
        velocity: track.velocity,
        firstSeenMs: track.firstSeenMs,
        lastSeenMs: track.lastSeenMs,
      });
    });

    // Cleanup stale object tracks after 90 frames (~3 seconds)
    this.objectTracks.forEach((track, tid) => {
      if (!matchedTrackIds.has(tid)) {
        const unseenFrames = currentFrameId - track.lastSeenFrame;
        if (unseenFrames > 90) {
          track.state = 'LOST';
          this.objectTracks.delete(tid);
        } else {
          track.state = 'OCCLUDED';
        }
      }
    });

    return updatedObjects;
  }

  private calculateIoU(a: BoundingBox, b: BoundingBox): number {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    if (intersection <= 0) return 0;

    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const union = areaA + areaB - intersection;

    return union > 0 ? intersection / union : 0;
  }
}

export const tracker = new Tracker();
