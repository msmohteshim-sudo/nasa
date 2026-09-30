// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Voice Guidance Settings Panel (09 VOICE GUIDANCE)
// Populates system TTS voices via window.speechSynthesis.getVoices().
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import type { AltronSystemConfig } from '@/types/config';

interface Props {
  config: AltronSystemConfig;
  onChange: (updater: (prev: AltronSystemConfig) => AltronSystemConfig) => void;
}

export const VoiceGuidancePanel: React.FC<Props> = ({ config, onChange }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState<string>('Step two verified. Proceed to microfluidic syringe injection.');

  const loadVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = config.voice.speechRate;
      utterance.pitch = config.voice.pitch;
      utterance.volume = config.voice.volume;

      const matchedVoice = voices.find((v) => v.voiceURI === config.voice.voiceURI);
      if (matchedVoice) utterance.voice = matchedVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis API is not supported in this browser environment.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span>09 Text-to-Speech Voice Guidance Center</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure real-time astronaut headset audio prompts, voice selection, speech rate, and event triggers.
        </p>
      </div>

      {/* Primary Enable Switch */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex items-center justify-between font-mono text-xs">
        <div>
          <span className="font-bold text-[#002244] block">Enable Audio Voice Guidance</span>
          <p className="text-[11px] text-gray-500 font-sans mt-0.5">Spoken procedure prompts and audio deviation warnings.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              voice: { ...prev.voice, enabled: !prev.voice.enabled },
            }))
          }
          className={`px-3.5 py-1.5 rounded font-bold border transition-colors flex items-center gap-1.5 ${
            config.voice.enabled ? 'bg-blue-50 text-[#002244] border-blue-300' : 'bg-gray-100 text-gray-500 border-gray-300'
          }`}
        >
          {config.voice.enabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
          <span>{config.voice.enabled ? 'VOICE ON' : 'VOICE OFF'}</span>
        </button>
      </div>

      {/* Voice Selection & Sliders */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
          VOICE ENGINE & SYNTHESIS PARAMETERS
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="md:col-span-2 space-y-1.5">
            <label className="font-bold text-gray-800 block">Available Web Speech Voices ({voices.length})</label>
            <select
              value={config.voice.voiceURI}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  voice: { ...prev.voice, voiceURI: e.target.value },
                }))
              }
              className="w-full bg-slate-50 border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="default">Default System Voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-1.5">
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">Speech Rate</span>
              <span className="font-bold text-blue-700">{config.voice.speechRate}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={config.voice.speechRate}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange((prev) => ({
                  ...prev,
                  voice: { ...prev.voice, speechRate: val },
                }));
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-gray-200 rounded space-y-1.5">
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">Volume</span>
              <span className="font-bold text-blue-700">{Math.round(config.voice.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.0}
              step={0.05}
              value={config.voice.volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange((prev) => ({
                  ...prev,
                  voice: { ...prev.voice, volume: val },
                }));
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Voice Preview Tester */}
        <div className="p-4 bg-slate-50 border border-gray-200 rounded space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#002244] uppercase">TEST VOICE AUDIO PREVIEW</span>
            <button
              onClick={testVoice}
              className="px-3 py-1 bg-[#002244] hover:bg-[#003366] text-white rounded font-bold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>TEST VOICE</span>
            </button>
          </div>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-900"
          />
        </div>
      </div>

      {/* Voice Event Triggers */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <span className="text-xs font-mono font-bold text-[#002244] uppercase tracking-wider block">
          VOICE EVENT TRIGGER CHECKBOXES
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {[
            { key: 'start', label: 'Experiment Started' },
            { key: 'verify', label: 'Step Verified' },
            { key: 'next', label: 'Next Step Prompt' },
            { key: 'wrong', label: 'Wrong Action Alert' },
            { key: 'outOfSeq', label: 'Out-of-Sequence Alert' },
            { key: 'completed', label: 'Experiment Completed' },
            { key: 'warning', label: 'Critical Warning' },
          ].map((trig) => (
            <label key={trig.key} className="p-2.5 bg-slate-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer">
              <span className="text-[11px] font-semibold text-gray-800">{trig.label}</span>
              <input
                type="checkbox"
                checked={(config.voice.triggers as any)[trig.key]}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    voice: {
                      ...prev.voice,
                      triggers: {
                        ...prev.voice.triggers,
                        [trig.key]: e.target.checked,
                      },
                    },
                  }))
                }
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
