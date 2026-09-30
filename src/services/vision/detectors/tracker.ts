// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Multi-Person & Multi-Object Tracker
// Maintains consistent tracking IDs (Person #1, Person #2) across frames.
// Uses Intersection over Union (IoU) & centroid distance tracking.
// ─────────────────────────────────────────────────────────────────────────────

import type { PersonDetection, BoundingBox } from '@/types/vision';

interface TrackedSubject {
  id: string;
  trackingId: number;
  lastBox: BoundingBox;
  lastSeenFrame: number;
}

export class Tracker {
  private activeTracks: Map<number, TrackedSubject> = new Map();
  private nextTrackId = 1;

  updateTracks(persons: PersonDetection[], currentFrameId: number): PersonDetection[] {
    const updatedPersons: PersonDetection[] = [];

    persons.forEach((person) => {
      let matchedTrackId: number | null = null;
      let bestIoU = 0;

      // Find best matching existing track by IoU overlap
      this.activeTracks.forEach((track, tid) => {
        const iou = this.calculateIoU(person.box, track.lastBox);
        if (iou > 0.3 && iou > bestIoU) {
          bestIoU = iou;
          matchedTrackId = tid;
        }
      });

      if (matchedTrackId === null) {
        matchedTrackId = this.nextTrackId++;
      }

      // Update or create track
      this.activeTracks.set(matchedTrackId, {
        id: `Person #${String(matchedTrackId).padStart(2, '0')}`,
        trackingId: matchedTrackId,
        lastBox: person.box,
        lastSeenFrame: currentFrameId,
      });

      updatedPersons.push({
        ...person,
        id: `Person #${String(matchedTrackId).padStart(2, '0')}`,
        trackingId: matchedTrackId,
        trackingState: 'ACTIVE',
      });
    });

    // Clean up stale tracks not seen in last 45 frames (~1.5 seconds)
    this.activeTracks.forEach((track, tid) => {
      if (currentFrameId - track.lastSeenFrame > 45) {
        this.activeTracks.delete(tid);
      }
    });

    return updatedPersons;
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
