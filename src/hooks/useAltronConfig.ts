// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — System Configuration Manager Hook (useAltronConfig)
// Handles canonical AltronSystemConfig state, local storage persistence,
// and real-time synchronization with VisionPipeline, VoiceGuidance, and ProcedureEngine.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import type { AltronSystemConfig } from '@/types/config';
import { DEFAULT_ALTRON_CONFIG } from '@/types/config';
import { visionPipeline } from '@/services/vision/visionPipeline';
import { VoiceGuidanceService } from '@/services/voice/voiceGuidanceService';

const STORAGE_KEY = 'AltronSystemConfig';

export function loadAltronConfig(): AltronSystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ALTRON_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ALTRON_CONFIG, ...parsed };
  } catch (err) {
    console.warn('[useAltronConfig] Error reading stored config, using defaults:', err);
    return DEFAULT_ALTRON_CONFIG;
  }
}

export function saveAltronConfig(config: AltronSystemConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('[useAltronConfig] Error saving config to localStorage:', err);
  }
}

export function useAltronConfig() {
  const [config, setConfigState] = useState<AltronSystemConfig>(loadAltronConfig);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Apply settings to live services
  const syncServices = useCallback((newCfg: AltronSystemConfig) => {
    // 1. Sync VisionPipeline mode
    visionPipeline.setMode(newCfg.vision.visionMode);

    // 2. Sync VoiceGuidance parameters
    VoiceGuidanceService.setEnabled(newCfg.voice.enabled);
  }, []);

  useEffect(() => {
    syncServices(config);
  }, [config, syncServices]);

  const updateConfig = useCallback((updater: Partial<AltronSystemConfig> | ((prev: AltronSystemConfig) => AltronSystemConfig)) => {
    setConfigState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveAltronConfig(next);
      syncServices(next);
      setLastSaved(new Date().toLocaleTimeString('en-GB', { hour12: false }));
      return next;
    });
  }, [syncServices]);

  const resetConfig = useCallback(() => {
    setConfigState(DEFAULT_ALTRON_CONFIG);
    saveAltronConfig(DEFAULT_ALTRON_CONFIG);
    syncServices(DEFAULT_ALTRON_CONFIG);
    setLastSaved(new Date().toLocaleTimeString('en-GB', { hour12: false }));
  }, [syncServices]);

  return {
    config,
    updateConfig,
    resetConfig,
    lastSaved,
  };
}
