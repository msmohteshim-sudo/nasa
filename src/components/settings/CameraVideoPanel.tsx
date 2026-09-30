// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Camera & Video Settings Panel (02 CAMERA & VIDEO)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CameraOff, Video, Sliders, AlertTriangle } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const CameraVideoPanel: React.FC<Props> = ({ config, onChange }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionState, setPermissionState] = useState<string>('checking');
  const [previewActive, setPreviewActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Enumerate real video input devices
  const loadDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);
        setPermissionState(videoInputs.some((d) => d.label) ? 'granted' : 'prompt');
      }
    } catch {
      setPermissionState('denied');
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Preview test controls
  const startPreview = async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: config.camera.selectedDeviceId !== 'default' ? { exact: config.camera.selectedDeviceId } : undefined,
          width: config.camera.resolution === '1920x1080' ? 1920 : config.camera.resolution === '1280x720' ? 1280 : 640,
          height: config.camera.resolution === '1920x1080' ? 1080 : config.camera.resolution === '1280x720' ? 720 : 480,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPreviewActive(true);
      setPermissionState('granted');
    } catch (err: unknown) {
      alert(`Camera preview error: ${err instanceof Error ? err.message : 'Access denied'}`);
      setPreviewActive(false);
    }
  };

  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setPreviewActive(false);
  };

  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Camera className="w-4 h-4 text-blue-600" />
          <span>02 Camera & Video Input Configuration</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Select input device, resolution, target frame rate, and test webcam feed parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Dropdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
          <label className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
            CAMERA SOURCE DEVICE
          </label>
          <select
            value={config.camera.selectedDeviceId}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                camera: { ...prev.camera, selectedDeviceId: e.target.value },
              }))
            }
            className="w-full bg-slate-50 border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="default">Default System Webcam</option>
            {devices.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId}>
                {d.label || `Camera Device #${i + 1}`}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 font-mono">
            Discovered {devices.length} video input device(s) via MediaDevices API.
          </p>
        </div>

        {/* Permission Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
          <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
            CAMERA PERMISSION & STATUS
          </span>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-200 rounded font-mono text-xs">
            <span>Browser Permission:</span>
            <span className={`font-bold uppercase ${permissionState === 'granted' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {permissionState}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-mono">
            Status: {previewActive ? 'STREAM ACTIVE' : 'CONNECTED & READY'}
          </p>
        </div>

        {/* Resolution Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
          <label className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
            STREAM RESOLUTION
          </label>
          <select
            value={config.camera.resolution}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                camera: { ...prev.camera, resolution: e.target.value as any },
              }))
            }
            className="w-full bg-slate-50 border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="Auto">Auto (Optimal Device Target)</option>
            <option value="640x480">640 × 480 (SD / Fast)</option>
            <option value="1280x720">1280 × 720 (HD 720p)</option>
            <option value="1920x1080">1920 × 1080 (Full HD 1080p)</option>
          </select>
        </div>

        {/* Frame Rate Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
          <label className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
            TARGET FRAME RATE
          </label>
          <select
            value={config.camera.targetFPS}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                camera: { ...prev.camera, targetFPS: Number(e.target.value) as any },
              }))
            }
            className="w-full bg-slate-50 border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value={15}>15 FPS (Low Latency)</option>
            <option value={24}>24 FPS (Cinematic / Standard)</option>
            <option value={30}>30 FPS (Recommended Standard)</option>
            <option value={60}>60 FPS (High Speed - Hardware Dependent)</option>
          </select>
        </div>
      </div>

      {/* Video Preview Box */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-600" />
            <span>VIDEO FEED TEST PREVIEW</span>
          </span>
          <div className="flex items-center gap-2 font-mono text-xs">
            {!previewActive ? (
              <button
                onClick={startPreview}
                className="px-3 py-1 bg-[#002244] hover:bg-[#003366] text-white rounded font-bold transition-colors"
              >
                TEST CAMERA PREVIEW
              </button>
            ) : (
              <button
                onClick={stopPreview}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-colors"
              >
                STOP PREVIEW
              </button>
            )}
          </div>
        </div>

        <div className="relative aspect-video max-w-lg mx-auto bg-black rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center">
          <video ref={videoRef} playsInline muted className={`w-full h-full object-cover ${previewActive ? 'block' : 'hidden'}`} />
          {!previewActive && (
            <div className="text-center p-4">
              <CameraOff className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="font-mono text-xs text-gray-400 font-bold">PREVIEW INACTIVE</p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Camera Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-3">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>ADVANCED HARDWARE CONTROLS</span>
        </span>
        <p className="text-xs text-gray-500 font-medium">
          Exposure, white balance, focus, and zoom are controlled automatically by the browser/OS driver for standard webcams.
        </p>
        <div className="p-3 bg-slate-50 border border-gray-200 rounded text-xs font-mono text-gray-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Hardware manual focus/exposure adjustments depend on active USB UVC driver support.</span>
        </div>
      </div>
    </div>
  );
};
