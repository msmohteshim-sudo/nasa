// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Mission Telemetry & Event Log Service
// Maintains an in-memory chronological event stream of spatial zone transitions,
// hand-object interactions, procedure step completions, and safety anomalies.
// ─────────────────────────────────────────────────────────────────────────────

import type { MissionEvent, MissionEventType } from '@/types/vision';

type EventListener = (event: MissionEvent) => void;

export class EventLogService {
  private events: MissionEvent[] = [];
  private listeners: Set<EventListener> = new Set();
  private maxHistory = 100;

  constructor() {
    this.addEvent({
      type: 'SYSTEM',
      severity: 'INFO',
      summary: 'ALTRON Vision & Activity Intelligence System Initialized',
      details: 'Multi-object tracker, spatial zone engine, and mission task engine ready.',
    });
  }

  getEvents(): MissionEvent[] {
    return [...this.events];
  }

  subscribe(cb: EventListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  addEvent(event: Omit<MissionEvent, 'id' | 'timestamp' | 'timestampMs'>): MissionEvent {
    const now = new Date();
    const timestampStr = now.toLocaleTimeString('en-GB', { hour12: false });
    const fullEvent: MissionEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timestampStr,
      timestampMs: now.getTime(),
      ...event,
    };

    this.events.unshift(fullEvent);
    if (this.events.length > this.maxHistory) {
      this.events.pop();
    }

    this.listeners.forEach((listener) => listener(fullEvent));
    return fullEvent;
  }

  clearLog(): void {
    this.events = [];
  }
}

export const eventLogService = new EventLogService();
