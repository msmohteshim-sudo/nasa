// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Space Workstation Sensor & Telemetry Data Types
// Comprehensive sensor suite for microgravity experiment monitoring.
// ─────────────────────────────────────────────────────────────────────────────

export type SensorCategory =
  | 'MICROGRAVITY'
  | 'THERMAL'
  | 'ENVIRONMENTAL'
  | 'LIDAR_PROXIMITY'
  | 'FORCE_TACTILE'
  | 'RADIATION'
  | 'CREW_BIOMETRIC'
  | 'ACOUSTIC_VIBRATION';

export interface WorkstationSensor {
  id: string;
  code: string;
  name: string;
  shortLabel: string;
  category: SensorCategory;
  unit: string;
  value: number;
  displayValue: string;
  nominalRange: string;
  status: 'NOMINAL' | 'WARNING' | 'ALERT';
  subMetrics: { label: string; value: string }[];
  color: string;
  badgeBg: string;
  overlayBadge: string;
  overlayBox?: {
    top: string;
    left?: string;
    right?: string;
    width: string;
    height: string;
  };
  description: string;
  history?: number[]; // last 12 readings for mini sparkline
}
