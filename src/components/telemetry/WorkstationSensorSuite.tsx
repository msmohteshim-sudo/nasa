// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Workstation Multi-Sensor Telemetry Suite Component
// Live real-time sensor array displaying physical, environmental, optical,
// force, radiation, and crew biometrics for microgravity space experiments.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Thermometer,
  Gauge,
  Radio,
  RefreshCw,
  Cpu,
  Wind,
  Heart,
  Crosshair,
} from 'lucide-react';
import { WorkstationSensor, SensorCategory } from '@/types/sensor';
import { INITIAL_WORKSTATION_SENSORS } from '@/data/workstationSensors';

interface WorkstationSensorSuiteProps {
  onSensorSelected?: (sensor: WorkstationSensor) => void;
  className?: string;
}

export const WorkstationSensorSuite: React.FC<WorkstationSensorSuiteProps> = ({
  onSensorSelected,
  className = '',
}) => {
  const [sensors, setSensors] = useState<WorkstationSensor[]>(INITIAL_WORKSTATION_SENSORS);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [simulatedSpikeSensorId, setSimulatedSpikeSensorId] = useState<string | null>(null);

  // Live real-time micro-fluctuations every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          // If this sensor has a simulated spike active, keep it
          if (s.id === simulatedSpikeSensorId) return s;

          let newVal = s.value;
          let newDisplay = s.displayValue;
          const hist = s.history ? [...s.history.slice(1)] : [];

          if (s.category === 'MICROGRAVITY') {
            const jitter = (Math.random() - 0.5) * 0.0001;
            newVal = +(Math.max(0.0009, Math.min(0.0016, s.value + jitter))).toFixed(4);
            newDisplay = `${newVal} g`;
            hist.push(newVal);
          } else if (s.category === 'THERMAL') {
            const jitter = (Math.random() - 0.5) * 0.05;
            newVal = +(Math.max(36.9, Math.min(37.3, s.value + jitter))).toFixed(1);
            newDisplay = `${newVal} °C`;
            hist.push(newVal);
          } else if (s.category === 'LIDAR_PROXIMITY') {
            const jitter = (Math.random() - 0.5) * 0.3;
            newVal = +(Math.max(17.8, Math.min(19.2, s.value + jitter))).toFixed(1);
            newDisplay = `${newVal} cm`;
            hist.push(newVal);
          } else if (s.category === 'FORCE_TACTILE') {
            const jitter = (Math.random() - 0.5) * 0.1;
            newVal = +(Math.max(4.6, Math.min(5.1, s.value + jitter))).toFixed(1);
            newDisplay = `${newVal} N`;
            hist.push(newVal);
          } else if (s.category === 'ENVIRONMENTAL' && s.code === 'AFL-05') {
            const jitter = (Math.random() - 0.5) * 0.01;
            newVal = +(Math.max(0.16, Math.min(0.20, s.value + jitter))).toFixed(2);
            newDisplay = `${newVal} m/s`;
            hist.push(newVal);
          } else if (s.category === 'CREW_BIOMETRIC') {
            const delta = Math.floor(Math.random() * 3) - 1;
            newVal = Math.max(68, Math.min(76, (s.value as number) + delta));
            newDisplay = `${newVal} BPM`;
            hist.push(newVal);
          } else if (s.category === 'RADIATION') {
            const jitter = (Math.random() - 0.5) * 0.2;
            newVal = +(Math.max(13.6, Math.min(14.8, s.value + jitter))).toFixed(1);
            newDisplay = `${newVal} µSv/h`;
            hist.push(newVal);
          }

          return {
            ...s,
            value: newVal,
            displayValue: newDisplay,
            history: hist.length > 0 ? hist : s.history,
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, [simulatedSpikeSensorId]);

  // Toggle simulated anomaly on a sensor
  const handleToggleSpike = (sensorId: string) => {
    if (simulatedSpikeSensorId === sensorId) {
      // Clear spike
      setSimulatedSpikeSensorId(null);
      setSensors((prev) =>
        prev.map((s) => (s.id === sensorId ? { ...s, status: 'NOMINAL' } : s))
      );
    } else {
      // Trigger spike
      setSimulatedSpikeSensorId(sensorId);
      setSensors((prev) =>
        prev.map((s) => {
          if (s.id === sensorId) {
            let spikedVal = s.value;
            let spikedDisplay = s.displayValue;
            if (s.category === 'MICROGRAVITY') {
              spikedVal = 0.0048;
              spikedDisplay = '0.0048 g (TRANSIENT SPIKE)';
            } else if (s.category === 'THERMAL') {
              spikedVal = 38.6;
              spikedDisplay = '38.6 °C (TEMP DRIFT)';
            } else if (s.category === 'FORCE_TACTILE') {
              spikedVal = 9.4;
              spikedDisplay = '9.4 N (FORCE OVERLOAD)';
            } else if (s.category === 'LIDAR_PROXIMITY') {
              spikedVal = 4.2;
              spikedDisplay = '4.2 cm (TOO CLOSE)';
            }
            return {
              ...s,
              value: spikedVal,
              displayValue: spikedDisplay,
              status: 'ALERT',
            };
          }
          return s;
        })
      );
    }
  };

  const filteredSensors = sensors.filter((s) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PHYSICS') return s.category === 'MICROGRAVITY' || s.category === 'FORCE_TACTILE';
    if (activeFilter === 'ENVIRONMENT') return s.category === 'ENVIRONMENTAL' || s.category === 'THERMAL';
    if (activeFilter === 'OPTICAL') return s.category === 'LIDAR_PROXIMITY';
    if (activeFilter === 'RADIATION_BIO') return s.category === 'RADIATION' || s.category === 'CREW_BIOMETRIC';
    return true;
  });

  const getCategoryIcon = (category: SensorCategory) => {
    switch (category) {
      case 'MICROGRAVITY':
        return <Activity className="w-4 h-4 text-sky-500" />;
      case 'THERMAL':
        return <Thermometer className="w-4 h-4 text-amber-500" />;
      case 'ENVIRONMENTAL':
        return <Wind className="w-4 h-4 text-purple-500" />;
      case 'LIDAR_PROXIMITY':
        return <Crosshair className="w-4 h-4 text-cyan-500" />;
      case 'FORCE_TACTILE':
        return <Gauge className="w-4 h-4 text-emerald-500" />;
      case 'RADIATION':
        return <Radio className="w-4 h-4 text-pink-500" />;
      case 'CREW_BIOMETRIC':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <Cpu className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#002244] text-white">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
              Workstation Multi-Sensor Telemetry Suite
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">
              8 CHANNELS ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real-time space sensor fusion monitoring microgravity, thermal, LiDAR, force, and life support parameters.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Sensors (8)' },
            { id: 'PHYSICS', label: 'Micro-g & Force' },
            { id: 'ENVIRONMENT', label: 'Thermal & Air' },
            { id: 'OPTICAL', label: 'LiDAR & Depth' },
            { id: 'RADIATION_BIO', label: 'Radiation & Bio' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                activeFilter === tab.id
                  ? 'bg-[#002244] text-white shadow-xs'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredSensors.map((sensor) => {
          const isSpiked = sensor.status === 'ALERT';

          return (
            <div
              key={sensor.id}
              onClick={() => onSensorSelected && onSensorSelected(sensor)}
              className={`p-4 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSpiked
                  ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/30'
                  : 'bg-slate-50/70 hover:bg-slate-50 border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Top Row: Code, Name, Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(sensor.category)}
                    <span className="font-mono text-xs font-bold text-gray-800">
                      {sensor.code}
                    </span>
                  </div>
                  <span
                    className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      isSpiked
                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#002244] leading-tight">
                  {sensor.name}
                </div>

                {/* Big Primary Value Readout */}
                <div className="my-2.5 flex items-baseline gap-1.5">
                  <span
                    className={`text-xl font-extrabold font-mono tracking-tight ${
                      isSpiked ? 'text-rose-700' : 'text-slate-900'
                    }`}
                  >
                    {sensor.displayValue}
                  </span>
                </div>

                {/* Submetrics list */}
                <div className="space-y-1 pt-2 border-t border-gray-200/60 text-[10.5px] font-mono text-gray-600">
                  {sensor.subMetrics.map((sub, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-400">{sub.label}:</span>
                      <span className="font-semibold text-gray-800">{sub.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer: Nominal Range & Anomaly Trigger */}
              <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-gray-400">
                  Nom: <span className="text-gray-600">{sensor.nominalRange}</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSpike(sensor.id);
                  }}
                  className={`px-1.5 py-0.5 rounded transition ${
                    isSpiked
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-gray-400 hover:text-amber-700 hover:bg-amber-100'
                  }`}
                  title="Simulate telemetry threshold anomaly"
                >
                  {isSpiked ? 'RESET' : 'TEST SPIKE'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry Summary Banner */}
      <div className="mt-5 p-3 rounded-lg bg-[#002244] text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">SPACE HARVEST & SENSOR FUSION ENGINE:</span>
            <span className="text-cyan-300">SYNCHRONIZED (60 Hz)</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">Telemetry Bus: MIL-STD-1553B · SpaceWire Link Active</span>
        </div>

        <div className="flex items-center gap-2">
          {simulatedSpikeSensorId && (
            <button
              onClick={() => {
                setSimulatedSpikeSensorId(null);
                setSensors(INITIAL_WORKSTATION_SENSORS);
              }}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded font-bold text-[10.5px] flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>CLEAR SIMULATED SPIKE</span>
            </button>
          )}
          <span className="text-emerald-400 font-bold">ALL SENSORS NOMINAL</span>
        </div>
      </div>
    </div>
  );
};
