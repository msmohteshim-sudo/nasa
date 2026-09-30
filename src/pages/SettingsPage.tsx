// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Complete System Configuration Center (SettingsPage)
// 17 Category Left Navigation, Persistent Search Filter, and Subsystem Panels.
// Inspired by ISRO / aerospace institutional visual & information architecture.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  RotateCcw,
  Save,
  Search,
  Activity,
  Camera,
  Eye,
  Zap,
  Boxes,
  Cpu,
  FileCode,
  Volume2,
  Bell,
  Shield,
  FileText,
  Lock,
  Bug,
  Info,
} from 'lucide-react';
import { useAltronConfig } from '@/hooks/useAltronConfig';
import { useSession } from '@/context/SessionContext';
import type { ConfigCategoryKey } from '@/types/config';

// ── 17 Category Subsystem Panels ──────────────────────────────────────────────
import { SystemOverviewPanel } from '@/components/settings/SystemOverviewPanel';
import { CameraVideoPanel } from '@/components/settings/CameraVideoPanel';
import { VisionDetectionPanel } from '@/components/settings/VisionDetectionPanel';
import { HumanPosePanel } from '@/components/settings/HumanPosePanel';
import { ObjectInteractionPanel } from '@/components/settings/ObjectInteractionPanel';
import { MotionActivityPanel } from '@/components/settings/MotionActivityPanel';
import { ProcedureEnginePanel } from '@/components/settings/ProcedureEnginePanel';
import { ExperimentConfigPanel } from '@/components/settings/ExperimentConfigPanel';
import { VoiceGuidancePanel } from '@/components/settings/VoiceGuidancePanel';
import { AlertsNotificationsPanel } from '@/components/settings/AlertsNotificationsPanel';
import { EvidenceLoggingPanel } from '@/components/settings/EvidenceLoggingPanel';
import { ReportsPanel } from '@/components/settings/ReportsPanel';
import { PerformancePanel } from '@/components/settings/PerformancePanel';
import { PrivacyDataPanel } from '@/components/settings/PrivacyDataPanel';
import { AccessibilityPanel } from '@/components/settings/AccessibilityPanel';
import { DeveloperPrototypePanel } from '@/components/settings/DeveloperPrototypePanel';
import { AboutAltronPanel } from '@/components/settings/AboutAltronPanel';

interface CategoryNavDef {
  key: ConfigCategoryKey;
  num: string;
  label: string;
  icon: React.ElementType;
  isDev?: boolean;
}

const CATEGORIES: CategoryNavDef[] = [
  { key: 'overview',      num: '01', label: 'SYSTEM OVERVIEW',       icon: Activity },
  { key: 'camera',        num: '02', label: 'CAMERA & VIDEO',        icon: Camera },
  { key: 'vision',        num: '03', label: 'VISION & DETECTION',    icon: Eye },
  { key: 'pose',          num: '04', label: 'HUMAN / POSE ANALYSIS', icon: Zap },
  { key: 'objects',       num: '05', label: 'OBJECT & INTERACTION',  icon: Boxes },
  { key: 'motion',        num: '06', label: 'MOTION & ACTIVITY',     icon: Activity },
  { key: 'procedure',     num: '07', label: 'PROCEDURE ENGINE',      icon: Cpu },
  { key: 'experiment',    num: '08', label: 'EXPERIMENT CONFIG',     icon: FileCode },
  { key: 'voice',         num: '09', label: 'VOICE GUIDANCE',        icon: Volume2 },
  { key: 'alerts',        num: '10', label: 'ALERTS & NOTIFY',       icon: Bell },
  { key: 'evidence',      num: '11', label: 'EVIDENCE & LOGGING',    icon: Shield },
  { key: 'reports',       num: '12', label: 'REPORTS & EXPORT',      icon: FileText },
  { key: 'performance',   num: '13', label: 'PERFORMANCE',           icon: Cpu },
  { key: 'privacy',       num: '14', label: 'PRIVACY & DATA',        icon: Lock },
  { key: 'accessibility', num: '15', label: 'ACCESSIBILITY',         icon: Eye },
  { key: 'developer',     num: '16', label: 'DEVELOPER / DEV TOOL',  icon: Bug, isDev: true },
  { key: 'about',         num: '17', label: 'ABOUT ALTRON',          icon: Info },
];

export const SettingsPage: React.FC = () => {
  const { config, updateConfig, resetConfig, lastSaved } = useAltronConfig();
  const { session, resetSession } = useSession();

  const [activeCategory, setActiveCategory] = useState<ConfigCategoryKey>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  const filteredCategories = CATEGORIES.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.num.includes(searchQuery)
  );

  const handleSave = () => {
    updateConfig(config);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset ALTRON System Configuration to canonical defaults?')) {
      resetConfig();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-900 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">

        {/* ── Top Header Bar ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <Sliders className="w-4 h-4 text-[#002244]" />
              <span>ALTRON SYSTEM CONFIGURATION CENTER</span>
            </div>
            <h1 className="text-2xl font-bold text-[#002244] tracking-tight mt-1">
              Configuration & Subsystem Settings
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Configure ALTRON vision, experiment execution, procedural verification, voice guidance, evidence collection and system behavior.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
            <span className="text-gray-500 text-[11px]">
              Status: <strong className="text-emerald-700">● Saved</strong> {lastSaved && `(${lastSaved})`}
            </span>
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 border border-gray-300 rounded font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
              <span>RESET</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#002244] hover:bg-[#003366] text-white rounded font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>SAVE CONFIGURATION</span>
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {saveToast && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded font-mono text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ALTRON System Configuration updated and persisted.</span>
          </div>
        )}

        {/* ── Main 2-Column Settings Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Persistent Category Navigation (4 Cols) */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-4">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings (camera, pose, voice)..."
                className="w-full bg-slate-50 border border-gray-200 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Navigation Menu */}
            <nav className="space-y-1 max-h-[620px] overflow-y-auto pr-1 font-mono text-xs">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;

                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`w-full text-left p-2.5 rounded flex items-center justify-between transition-all ${
                      isActive
                        ? cat.isDev
                          ? 'bg-rose-50 text-rose-900 border border-rose-300 font-bold shadow-xs'
                          : 'bg-[#002244] text-white font-bold shadow-xs'
                        : cat.isDev
                        ? 'text-rose-700 hover:bg-rose-50 border border-transparent'
                        : 'text-gray-700 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`text-[10px] opacity-75 font-mono ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {cat.num}
                      </span>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? (cat.isDev ? 'text-rose-600' : 'text-emerald-400') : 'text-gray-500'}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>

                    {cat.isDev && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold shrink-0">
                        DEV
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Area: Selected Category Panel (8 Cols) */}
          <div className="lg:col-span-8">
            {activeCategory === 'overview' && <SystemOverviewPanel config={config} cameraActive={session.cameraActive} />}
            {activeCategory === 'camera' && <CameraVideoPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'vision' && <VisionDetectionPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'pose' && <HumanPosePanel config={config} onChange={updateConfig} />}
            {activeCategory === 'objects' && <ObjectInteractionPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'motion' && <MotionActivityPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'procedure' && <ProcedureEnginePanel config={config} onChange={updateConfig} />}
            {activeCategory === 'experiment' && <ExperimentConfigPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'voice' && <VoiceGuidancePanel config={config} onChange={updateConfig} />}
            {activeCategory === 'alerts' && <AlertsNotificationsPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'evidence' && <EvidenceLoggingPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'reports' && <ReportsPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'performance' && <PerformancePanel config={config} onChange={updateConfig} />}
            {activeCategory === 'privacy' && <PrivacyDataPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'accessibility' && <AccessibilityPanel config={config} onChange={updateConfig} />}
            {activeCategory === 'developer' && <DeveloperPrototypePanel config={config} onChange={updateConfig} onResetSession={resetSession} />}
            {activeCategory === 'about' && <AboutAltronPanel />}
          </div>

        </div>

      </div>
    </div>
  );
};
