export interface NavItem {
  label: string;
  path: string;
  icon: string;
  description?: string;
  badge?: string | number;
}

export interface SystemStatus {
  name: string;
  version: string;
  environment: string;
  status: 'operational' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
}

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
}

export interface TelemetryMetric {
  cpuUsage: number; // percentage
  gpuUsage: number; // percentage
  ramUsage: number; // percentage
  vramUsage: number; // percentage
  quantumCoherence: number; // percentage
  latencyMs: number;
  activeFPS: number;
  bandwidthMbps: number;
  history: {
    time: string;
    cpu: number;
    gpu: number;
    ram: number;
    quantum: number;
  }[];
}

export interface SystemNode {
  id: string;
  name: string;
  location: string;
  type: 'Quantum Processing' | 'Neural Inference' | 'Edge Gateway' | 'Database Cluster';
  status: 'online' | 'busy' | 'warning' | 'offline';
  load: number;
  temperature: number;
  memoryUsed: string;
  lastHeartbeat: string;
}

export interface ExperimentTrial {
  id: string;
  title: string;
  category: 'Computer Vision' | 'Quantum ML' | 'Neural Compression' | 'Spatial Mapping';
  status: 'running' | 'completed' | 'failed' | 'queued' | 'paused';
  accuracy: number;
  loss: number;
  epochs: number;
  maxEpochs: number;
  learningRate: number;
  batchSize: number;
  confidenceThreshold: number;
  startTime: string;
  duration: string;
  modelType: string;
  logs: string[];
}

export interface VideoStream {
  id: string;
  title: string;
  channel: string;
  resolution: string;
  fps: number;
  status: 'active' | 'buffering' | 'offline';
  detectionsCount: number;
  latencyMs: number;
  feedUrl: string;
  sourceType: 'Optical AI' | 'Thermal IR' | 'Depth LiDAR' | 'Spectral';
  detectedObjects: { label: string; confidence: number; color: string }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: 'Telemetry' | 'Experiment' | 'Security' | 'Node' | 'Stream' | 'System';
  message: string;
  nodeId?: string;
  user: string;
}

export interface PlatformSettings {
  refreshRateMs: number;
  theme: 'dark-indigo' | 'cyberpunk-dark' | 'midnight-slate';
  autoRecovery: boolean;
  cpuThreshold: number;
  gpuThreshold: number;
  ramThreshold: number;
  emailAlerts: boolean;
  webhookUrl: string;
  targetFPS: number;
  streamQuality: '1080p' | '4K' | '720p';
  showBoundingBoxes: boolean;
  boundingColor: string;
}
