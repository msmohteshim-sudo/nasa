import { useState, useEffect, useCallback } from 'react';
import {
  SystemStatus,
  TelemetryMetric,
  SystemNode,
  ExperimentTrial,
  VideoStream,
  AuditLogEntry,
  PlatformSettings,
} from '@/types';
import {
  INITIAL_NODES,
  INITIAL_EXPERIMENTS,
  INITIAL_STREAMS,
  INITIAL_LOGS,
  DEFAULT_SETTINGS,
} from '@/data/mockData';

const INITIAL_HISTORY = [
  { time: '13:00', cpu: 45, gpu: 62, ram: 54, quantum: 99.4 },
  { time: '13:02', cpu: 52, gpu: 68, ram: 56, quantum: 99.2 },
  { time: '13:04', cpu: 48, gpu: 74, ram: 58, quantum: 99.5 },
  { time: '13:06', cpu: 61, gpu: 71, ram: 60, quantum: 98.9 },
  { time: '13:08', cpu: 58, gpu: 79, ram: 62, quantum: 99.6 },
  { time: '13:10', cpu: 64, gpu: 83, ram: 61, quantum: 99.1 },
];

export function useSystemStatus() {
  // System General Status
  const [status, setStatus] = useState<SystemStatus>({
    name: 'ALTRON Operations Core',
    version: '2.4.0-Pro',
    environment: 'Production Gateway',
    status: 'operational',
    uptimeSeconds: 84320,
  });

  // Telemetry Metrics
  const [telemetry, setTelemetry] = useState<TelemetryMetric>({
    cpuUsage: 54,
    gpuUsage: 78,
    ramUsage: 62,
    vramUsage: 71,
    quantumCoherence: 99.4,
    latencyMs: 14,
    activeFPS: 60,
    bandwidthMbps: 450,
    history: INITIAL_HISTORY,
  });

  // Nodes, Experiments, Streams, Logs State
  const [nodes, setNodes] = useState<SystemNode[]>(INITIAL_NODES);
  const [experiments, setExperiments] = useState<ExperimentTrial[]>(INITIAL_EXPERIMENTS);
  const [streams] = useState<VideoStream[]>(INITIAL_STREAMS);
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);

  // Settings State with LocalStorage
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem('altron_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Save Settings
  const updateSettings = useCallback((newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('altron_settings', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
      return updated;
    });
  }, []);

  // 1. Uptime Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Real-time Telemetry Simulator
  useEffect(() => {
    const telemetryTimer = setInterval(() => {
      setTelemetry((prev) => {
        const cpuVariation = Math.floor(Math.random() * 11) - 5;
        const gpuVariation = Math.floor(Math.random() * 9) - 4;
        const ramVariation = Math.floor(Math.random() * 5) - 2;
        const qVariation = (Math.random() * 0.4 - 0.2);

        const newCpu = Math.min(Math.max(prev.cpuUsage + cpuVariation, 25), 98);
        const newGpu = Math.min(Math.max(prev.gpuUsage + gpuVariation, 30), 99);
        const newRam = Math.min(Math.max(prev.ramUsage + ramVariation, 40), 92);
        const newQ = Math.min(Math.max(Number((prev.quantumCoherence + qVariation).toFixed(1)), 94.0), 100.0);

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const updatedHistory = [
          ...prev.history.slice(1),
          { time: timeStr, cpu: newCpu, gpu: newGpu, ram: newRam, quantum: newQ },
        ];

        return {
          ...prev,
          cpuUsage: newCpu,
          gpuUsage: newGpu,
          ramUsage: newRam,
          quantumCoherence: newQ,
          latencyMs: Math.max(8, prev.latencyMs + Math.floor(Math.random() * 5 - 2)),
          history: updatedHistory,
        };
      });
    }, settings.refreshRateMs || 2000);

    return () => clearInterval(telemetryTimer);
  }, [settings.refreshRateMs]);

  // 3. Experiment Epoch Simulation
  useEffect(() => {
    const expTimer = setInterval(() => {
      setExperiments((prevExps) =>
        prevExps.map((exp) => {
          if (exp.status === 'running' && exp.epochs < exp.maxEpochs) {
            const nextEpoch = exp.epochs + 1;
            const nextAccuracy = Math.min(99.9, Number((exp.accuracy + Math.random() * 0.15).toFixed(1)));
            const nextLoss = Math.max(0.005, Number((exp.loss - Math.random() * 0.002).toFixed(3)));
            const isFinished = nextEpoch >= exp.maxEpochs;

            const newLog = `[${new Date().toLocaleTimeString()}] Epoch ${nextEpoch}/${exp.maxEpochs} completed - Loss: ${nextLoss} | Acc: ${nextAccuracy}%`;

            return {
              ...exp,
              epochs: nextEpoch,
              accuracy: nextAccuracy,
              loss: nextLoss,
              status: isFinished ? 'completed' : 'running',
              logs: [...exp.logs, newLog].slice(-10),
            };
          }
          return exp;
        })
      );
    }, 3000);

    return () => clearInterval(expTimer);
  }, []);

  // Experiment Action Controls
  const toggleExperimentStatus = useCallback((id: string) => {
    setExperiments((prev) =>
      prev.map((exp) => {
        if (exp.id === id) {
          const nextStatus = exp.status === 'running' ? 'paused' : 'running';
          return {
            ...exp,
            status: nextStatus,
            logs: [
              ...exp.logs,
              `[${new Date().toLocaleTimeString()}] Manual action: Experiment status changed to ${nextStatus}`,
            ],
          };
        }
        return exp;
      })
    );
  }, []);

  const addExperiment = useCallback((newExp: Omit<ExperimentTrial, 'id' | 'logs' | 'startTime' | 'duration' | 'accuracy' | 'loss' | 'epochs'>) => {
    const created: ExperimentTrial = {
      ...newExp,
      id: `exp-${Date.now().toString().slice(-4)}`,
      accuracy: 0.0,
      loss: 1.0,
      epochs: 0,
      startTime: new Date().toLocaleTimeString(),
      duration: '0m',
      logs: [`[${new Date().toLocaleTimeString()}] Trial initialized and queued.`],
    };
    setExperiments((prev) => [created, ...prev]);
  }, []);

  // Node Controls
  const toggleNodeStatus = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const newStatus = node.status === 'online' ? 'offline' : 'online';
          return { ...node, status: newStatus };
        }
        return node;
      })
    );
  }, []);

  // Add Log Entry
  const addLog = useCallback((message: string, level: AuditLogEntry['level'], category: AuditLogEntry['category']) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      level,
      category,
      message,
      user: 'Operator Session',
    };
    setLogs((prev) => [entry, ...prev]);
  }, []);

  return {
    status,
    telemetry,
    nodes,
    experiments,
    streams,
    logs,
    settings,
    updateSettings,
    toggleExperimentStatus,
    addExperiment,
    toggleNodeStatus,
    addLog,
  };
}
