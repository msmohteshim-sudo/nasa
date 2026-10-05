// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Experiments Page (Redesigned)
// Clean, spacious, scientific experiment management interface.
// Primary focus: information hierarchy, progressive disclosure, readability.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Eye,
  Brain,
  Volume2,
  FileText,
  ArrowRight,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { CANONICAL_EXPERIMENT } from '@/data/canonicalExperiment';
import type { LiveStep } from '@/types/session';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getStepStatusConfig(status: LiveStep['status']) {
  switch (status) {
    case 'completed':
      return {
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Completed',
        icon: '✓',
        ring: '',
      };
    case 'active':
      return {
        dot: 'bg-[#1a6fc4]',
        badge: 'bg-blue-50 text-[#0d2b5e] border-blue-300',
        label: 'In Progress',
        icon: '●',
        ring: 'ring-2 ring-[#1a6fc4]/25',
      };
    case 'wrong':
      return {
        dot: 'bg-rose-500',
        badge: 'bg-rose-50 text-rose-800 border-rose-200',
        label: 'Deviation',
        icon: '!',
        ring: 'ring-2 ring-rose-400/20',
      };
    case 'skipped':
      return {
        dot: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Skipped',
        icon: '○',
        ring: '',
      };
    default:
      return {
        dot: 'bg-gray-300',
        badge: 'bg-gray-50 text-gray-500 border-gray-200',
        label: 'Pending',
        icon: '○',
        ring: '',
      };
  }
}

function getSessionStatusDisplay(status: string) {
  switch (status) {
    case 'active':
      return { label: 'In Progress', color: 'text-emerald-700', dot: 'bg-emerald-500 animate-pulse' };
    case 'paused':
      return { label: 'Paused', color: 'text-amber-700', dot: 'bg-amber-500' };
    case 'completed':
      return { label: 'Completed', color: 'text-[#1a6fc4]', dot: 'bg-[#1a6fc4]' };
    case 'aborted':
      return { label: 'Aborted', color: 'text-rose-700', dot: 'bg-rose-500' };
    default:
      return { label: 'Ready', color: 'text-gray-600', dot: 'bg-gray-400' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI VERIFICATION CONCEPTS — one per step (concept labels only, not invented facts)
// ─────────────────────────────────────────────────────────────────────────────

const AI_VERIFICATION_CONCEPTS: Record<string, string[]> = {
  PROC_01_INIT:       ['Operator presence detected', 'Workspace region active', 'Initialization action observed'],
  PROC_02_FETCH:      ['Module retrieval motion detected', 'Hand-object interaction identified', 'Module movement confirmed'],
  PROC_03_VERIFY_ID:  ['Module identity confirmed', 'Hand-object contact verified', 'Correct object in workspace'],
  PROC_04_SECURE:     ['Securing action observed', 'Hand-object interaction confirmed', 'Module position stable'],
  PROC_05_PREP_CHAMBER: ['Chamber interaction detected', 'Preparation action recognized', 'Hand interaction logged'],
  PROC_06_TRANSFER:   ['Transfer motion detected', 'Object movement tracked', 'Hand-object interaction confirmed'],
  PROC_07_ALIGN_IMAGER: ['Positioning action observed', 'Object placement confirmed', 'Imaging unit interaction detected'],
  PROC_08_CAPTURE:    ['Capture action recognized', 'Observation interaction logged', 'Action sequence verified'],
  PROC_09_LOG:        ['Recording action detected', 'Logging interaction confirmed', 'Documentation step observed'],
  PROC_10_STOW:       ['Stowing motion detected', 'Module returned to storage', 'Experiment conclusion confirmed'],
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP ROW — single procedure step in the timeline
// ─────────────────────────────────────────────────────────────────────────────

interface StepRowProps {
  step: LiveStep;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const StepRow: React.FC<StepRowProps> = ({ step, isLast, isExpanded, onToggle }) => {
  const cfg = getStepStatusConfig(step.status);
  const isActive = step.status === 'active';
  const isDone = step.status === 'completed';
  const isWrong = step.status === 'wrong';
  const isPending = step.status === 'pending' || step.status === 'skipped';
  const aiConcepts = AI_VERIFICATION_CONCEPTS[step.code] ?? [];

  return (
    <div className="relative flex gap-5">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0 w-8 mt-1">
        {/* Step dot */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10 transition-all border-2 ${
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : isActive
              ? 'bg-white border-[#1a6fc4] text-[#1a6fc4]'
              : isWrong
              ? 'bg-rose-500 border-rose-500 text-white'
              : 'bg-white border-gray-300 text-gray-400'
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : isWrong ? (
            <XCircle className="w-4 h-4" />
          ) : isActive ? (
            <span className="text-xs font-mono font-bold">{step.stepNumber}</span>
          ) : (
            <span className="text-xs font-mono">{step.stepNumber}</span>
          )}
        </div>
        {/* Vertical connector */}
        {!isLast && (
          <div
            className={`w-px flex-1 mt-1 min-h-[24px] ${
              isDone ? 'bg-emerald-200' : 'bg-gray-200'
            }`}
          />
        )}
      </div>

      {/* Step content */}
      <div
        className={`flex-1 mb-6 rounded-lg border transition-all duration-200 ${
          isActive
            ? `bg-white border-[#1a6fc4]/40 shadow-sm ${cfg.ring}`
            : isDone
            ? 'bg-white border-gray-200 hover:border-gray-300'
            : isWrong
            ? `bg-white border-rose-200 ${cfg.ring}`
            : 'bg-white border-gray-200 hover:border-gray-300'
        } ${isPending && !isWrong ? 'opacity-75' : ''}`}
      >
        {/* Step header — always visible */}
        <button
          onClick={onToggle}
          className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 group"
          aria-expanded={isExpanded}
        >
          <div className="flex-1 min-w-0">
            {/* Step number + title */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                  isActive ? 'text-[#1a6fc4]' : isDone ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                STEP {step.stepNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${cfg.badge}`}
              >
                {cfg.label}
              </span>
              {isDone && step.confidence > 0 && (
                <span className="text-[10px] text-emerald-600 font-mono">
                  {step.confidence}% confidence
                </span>
              )}
            </div>

            <h3
              className={`text-base font-semibold leading-snug capitalize ${
                isActive
                  ? 'text-[#0d2b5e]'
                  : isDone
                  ? 'text-gray-700'
                  : isWrong
                  ? 'text-rose-800'
                  : 'text-gray-600'
              }`}
            >
              {step.title}
            </h3>

            {/* Short description — always visible, concise */}
            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
              {step.action}
            </p>

            {/* Timestamp for completed steps */}
            {isDone && step.timestamp && (
              <p className="mt-2 text-[11px] text-emerald-600 font-mono">
                Verified at {step.timestamp}
              </p>
            )}
          </div>

          {/* Expand toggle */}
          <div
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors mt-0.5 ${
              isExpanded ? 'bg-gray-100' : 'bg-transparent group-hover:bg-gray-50'
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded step details — progressive disclosure */}
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Expected action */}
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-2">
                  Expected Action
                </div>
                <p className="text-sm font-medium text-[#0d2b5e]">{step.expectedAction}</p>
              </div>

              {/* AI verification concepts */}
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-2">
                  AI Will Verify
                </div>
                <ul className="space-y-1.5">
                  {aiConcepts.map((concept) => (
                    <li key={concept} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1a6fc4] shrink-0" />
                      {concept}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Verification condition */}
            <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Verification Rule
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                ALTRON will confirm the expected action <strong className="text-gray-800 font-semibold">{step.expectedAction}</strong> is
                observed before marking this step complete and advancing the procedure.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MINI TIMELINE — compact flow overview in right panel
// ─────────────────────────────────────────────────────────────────────────────

const MiniTimeline: React.FC<{ steps: LiveStep[] }> = ({ steps }) => (
  <div className="flex flex-col gap-0">
    {steps.map((step, i) => {
      const isDone = step.status === 'completed';
      const isCurrent = step.status === 'active';
      const isWrong = step.status === 'wrong';
      return (
        <div key={step.id} className="flex items-center gap-3">
          <div className="flex flex-col items-center w-6 shrink-0">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                isDone
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-white border-[#1a6fc4] text-[#1a6fc4]'
                  : isWrong
                  ? 'bg-rose-400 border-rose-400 text-white'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {isDone ? '✓' : isWrong ? '!' : isCurrent ? '→' : step.stepNumber}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-px h-4 ${isDone ? 'bg-emerald-200' : 'bg-gray-200'}`} />
            )}
          </div>
          <span
            className={`text-xs py-1 leading-none ${
              isCurrent
                ? 'text-[#0d2b5e] font-semibold'
                : isDone
                ? 'text-emerald-700'
                : 'text-gray-400'
            }`}
          >
            {step.title.length > 32 ? step.title.substring(0, 32) + '…' : step.title}
          </span>
        </div>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY ITEM — small icon + label + one-liner
// ─────────────────────────────────────────────────────────────────────────────

interface CapabilityItemProps {
  icon: React.ElementType;
  label: string;
  description: string;
}

const CapabilityItem: React.FC<CapabilityItemProps> = ({ icon: Icon, label, description }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-[#e8f0fb] flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-[#1a6fc4]" />
    </div>
    <div>
      <div className="text-sm font-semibold text-[#0d2b5e]">{label}</div>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPERIMENTS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const ExperimentsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    session,
    startSession,
    resetSession,
    simulateVerified,
    simulateWrong,
    simulateSkipped,
  } = useSession();

  const steps = session.steps;
  const currentStep = steps[session.currentStepIndex] ?? steps[0];
  const nextStep = steps[session.currentStepIndex + 1] ?? null;
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPct = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  const isRunnable =
    session.status === 'idle' ||
    session.status === 'completed' ||
    session.status === 'aborted';
  const isActive = session.status === 'active' || session.status === 'paused';
  const statusDisplay = getSessionStatusDisplay(session.status);

  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);

  const handleToggleStep = useCallback((id: number) => {
    setExpandedStepId((prev) => (prev === id ? null : id));
  }, []);

  const handleStartExperiment = useCallback(() => {
    resetSession();
    setTimeout(startSession, 100);
  }, [resetSession, startSession]);

  const handleGoToMonitor = useCallback(() => {
    navigate('/monitor');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans pb-20">

      {/* ══════════════════════════════════════════════════════════════════
          EXPERIMENT HEADER
         ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-8 py-8">

          {/* Prototype disclaimer — subtle, not competing */}
          <div className="flex items-start gap-2 text-xs text-gray-500 mb-6 max-w-3xl">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span>{CANONICAL_EXPERIMENT.disclaimer}</span>
          </div>

          {/* Title row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical className="w-4 h-4 text-[#1a6fc4]" />
                <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#1a6fc4]">
                  Experiment
                </span>
              </div>

              {/* Experiment name — Level 1 heading */}
              <h1 className="text-3xl font-bold text-[#0d2b5e] leading-tight tracking-tight">
                {CANONICAL_EXPERIMENT.title}
              </h1>

              {/* Subtitle */}
              <p className="mt-2 text-base text-gray-500 font-medium">
                {CANONICAL_EXPERIMENT.subtitle}
              </p>

              {/* Inline metadata chips */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Prototype
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  {CANONICAL_EXPERIMENT.totalSteps} Steps
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  {CANONICAL_EXPERIMENT.category}
                </span>

                {/* Session status */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold ml-1">
                  <span className={`w-2 h-2 rounded-full ${statusDisplay.dot}`} />
                  <span className={statusDisplay.color}>{statusDisplay.label}</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end shrink-0">
              {isRunnable && (
                <button
                  onClick={handleStartExperiment}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#0d2b5e] hover:bg-[#1a4080] text-white text-sm font-bold tracking-wide rounded-md transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  Start Experiment
                </button>
              )}
              {isActive && (
                <button
                  onClick={handleGoToMonitor}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold tracking-wide rounded-md transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Go to Live Monitor
                </button>
              )}
              <button
                onClick={resetSession}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 text-sm font-medium rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN BODY — 2-column layout
         ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* ────────────────────────────────────────────────────────────
              LEFT COLUMN — Experiment Overview + Procedure Workflow
              ─────────────────────────────────────────────────────────── */}
          <div className="xl:col-span-7 2xl:col-span-8 space-y-8">

            {/* EXPERIMENT OVERVIEW SECTION */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* About this experiment */}
                <div>
                  <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
                    About this Experiment
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This prototype demonstrates how ALTRON can observe and verify a structured
                    scientific experiment performed by a crew member. The system tracks procedural
                    actions, object interactions and workflow deviations through a local vision
                    pipeline — without requiring external connectivity.
                  </p>
                  <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                    Protocol ID: <span className="font-mono text-gray-600">{CANONICAL_EXPERIMENT.id}</span>
                  </p>
                </div>

                {/* Experiment at a glance */}
                <div className="space-y-3">
                  <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
                    Experiment at a Glance
                  </h2>
                  <CapabilityItem
                    icon={Eye}
                    label="AI Vision"
                    description="Camera-based observation of crew actions and experiment objects."
                  />
                  <CapabilityItem
                    icon={Brain}
                    label="Procedure Verification"
                    description="Compares observed actions to expected protocol steps in real time."
                  />
                  <CapabilityItem
                    icon={Volume2}
                    label="Voice Guidance"
                    description="Spoken announcements and deviation alerts for the operator."
                  />
                  <CapabilityItem
                    icon={FileText}
                    label="Evidence Logging"
                    description="Timestamped audit trail for each verified procedure step."
                  />
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* PROCEDURE WORKFLOW SECTION */}
            <section>
              {/* Section heading */}
              <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0d2b5e] tracking-tight">
                    Experiment Workflow
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {CANONICAL_EXPERIMENT.totalSteps} procedural stages · AI verification sequence
                  </p>
                </div>

                {/* Progress indicator — compact */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="text-sm font-semibold text-[#0d2b5e]">
                    {completedCount} / {steps.length} verified
                  </div>
                  <div className="w-36 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#1a6fc4] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {steps.length - completedCount} remaining
                  </div>
                </div>
              </div>

              {/* Vertical timeline of steps */}
              <div>
                {steps.map((step, idx) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    isLast={idx === steps.length - 1}
                    isExpanded={expandedStepId === step.id}
                    onToggle={() => handleToggleStep(step.id)}
                  />
                ))}
              </div>

              {/* Procedure engine status footer */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono pt-2 border-t border-gray-200 mt-2">
                <span>
                  Procedure Engine · {session.status === 'active' ? 'ACTIVE' : 'STANDBY'}
                </span>
                <span>{CANONICAL_EXPERIMENT.totalSteps} steps registered</span>
              </div>
            </section>

          </div>

          {/* ────────────────────────────────────────────────────────────
              RIGHT COLUMN — Experiment Intelligence Panel
              ─────────────────────────────────────────────────────────── */}
          <div className="xl:col-span-5 2xl:col-span-4 space-y-5">

            {/* ── CURRENT STEP ── */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">
                Current Step
              </h3>

              {currentStep ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#e8f0fb] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold font-mono text-[#1a6fc4]">
                        {currentStep.stepNumber}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#0d2b5e] leading-snug capitalize">
                        {currentStep.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {currentStep.action}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                          getStepStatusConfig(currentStep.status).badge
                        }`}
                      >
                        {getStepStatusConfig(currentStep.status).label}
                      </span>
                    </div>
                  </div>

                  {/* What ALTRON expects */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-2">
                      ALTRON Expects
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{currentStep.expectedAction}</p>
                  </div>

                  {/* AI will verify */}
                  {AI_VERIFICATION_CONCEPTS[currentStep.code] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-2">
                        AI Will Verify
                      </div>
                      <ul className="space-y-1.5">
                        {AI_VERIFICATION_CONCEPTS[currentStep.code].map((c) => (
                          <li key={c} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1a6fc4] shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next step */}
                  {nextStep && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                        Next Step
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="capitalize">{nextStep.title}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">No active step.</p>
              )}
            </div>

            {/* ── AI VERIFICATION STATUS ── */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">
                AI Verification
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Expected</span>
                  <span className="text-gray-800 font-medium text-right max-w-[60%]">
                    {currentStep?.expectedAction ?? '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Observed</span>
                  <span
                    className={`font-medium text-right max-w-[60%] px-2 py-0.5 rounded text-xs ${
                      session.lastObservation
                        ? session.auditLog[0]?.outcome === 'WRONG_STEP'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {session.lastObservation?.dominantAction ?? 'Waiting for action'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Status</span>
                  {!session.lastObservation ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-gray-50 text-gray-500 border-gray-200">
                      Waiting
                    </span>
                  ) : session.auditLog[0]?.outcome === 'WRONG_STEP' ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-rose-50 text-rose-700 border-rose-200">
                      Deviation
                    </span>
                  ) : session.auditLog[0]?.outcome === 'VERIFIED' ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200">
                      Observing
                    </span>
                  )}
                </div>

                {session.lastObservation && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Confidence</span>
                    <span className="text-gray-800 font-mono text-sm font-semibold">
                      {Math.round(session.lastObservation.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── PROCEDURE MINI-MAP ── */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">
                Procedure Flow
              </h3>
              <MiniTimeline steps={steps} />
            </div>

            {/* ── DEMO SIMULATION CONTROLS (only when session active) ── */}
            {isActive && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
                  Demo Controls
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Simulate AI detection outcomes for demonstration.
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={simulateVerified}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0d2b5e] hover:bg-[#1a4080] text-white text-sm font-semibold rounded-md transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Simulate Step Verified
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={simulateSkipped}
                      className="flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-md border border-amber-200 transition-colors"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      Skip Step
                    </button>
                    <button
                      onClick={simulateWrong}
                      className="flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-md border border-rose-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Deviation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── START EXPERIMENT CTA (right panel) ── */}
            {isRunnable && (
              <div className="bg-[#f0f4fa] border border-[#c5d6f0] rounded-lg p-6">
                <h3 className="text-sm font-bold text-[#0d2b5e] mb-1">
                  Ready to begin?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Starting the experiment will activate the camera and begin procedural verification.
                </p>
                <button
                  onClick={handleStartExperiment}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#0d2b5e] hover:bg-[#1a4080] text-white text-sm font-bold rounded-md transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  Start Experiment
                </button>
                <button
                  onClick={handleGoToMonitor}
                  className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 border border-gray-300 hover:border-[#1a6fc4] text-gray-600 hover:text-[#1a6fc4] text-sm font-medium rounded-md transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Go to Live Monitor
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            BOTTOM — CAPABILITIES ROW + SESSION AUDIT
           ══════════════════════════════════════════════════════════════════ */}

        {/* Divider */}
        <div className="border-t border-gray-200 mt-12 mb-10" />

        {/* Capabilities row — clean, horizontal */}
        <section>
          <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">
            Experiment Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Eye,
                label: 'AI Vision',
                description:
                  'Computer vision observes human activity and experiment objects in real time.',
              },
              {
                icon: Brain,
                label: 'Procedure Verification',
                description:
                  'The procedure engine compares observed actions with expected steps and flags mismatches.',
              },
              {
                icon: Volume2,
                label: 'Voice Guidance',
                description:
                  'ALTRON provides spoken guidance and deviation warnings throughout the experiment.',
              },
              {
                icon: FileText,
                label: 'Evidence Logging',
                description:
                  'Timestamped audit records with confidence scores for each verified action.',
              },
            ].map(({ icon: Icon, label, description }) => (
              <div key={label} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[#e8f0fb] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#1a6fc4]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0d2b5e]">{label}</div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Session Audit Log — shown only when there are entries */}
        {session.auditLog.length > 0 && (
          <>
            <div className="border-t border-gray-200 mt-10 mb-8" />
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-gray-400">
                  Session Audit Log
                </h2>
                <span className="text-xs text-gray-400 font-mono">
                  {session.auditLog.length} entries
                </span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {session.auditLog.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 px-5 py-3 text-xs ${
                        entry.outcome === 'VERIFIED'
                          ? 'bg-emerald-50/50'
                          : entry.outcome === 'WRONG_STEP'
                          ? 'bg-rose-50/50'
                          : entry.outcome === 'SKIPPED'
                          ? 'bg-amber-50/50'
                          : ''
                      }`}
                    >
                      {entry.outcome === 'VERIFIED' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      {entry.outcome === 'WRONG_STEP' && (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      {entry.outcome === 'SKIPPED' && (
                        <MinusCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="font-mono font-bold text-gray-500 shrink-0 w-24">
                        [{entry.stepCode}]
                      </span>
                      <span className="text-gray-700 flex-1 truncate">{entry.message}</span>
                      <span className="text-gray-400 font-mono shrink-0">{entry.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  );
};

export default ExperimentsPage;
