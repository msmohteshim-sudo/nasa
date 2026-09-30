import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Eye,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  FileText,
  Camera,
  Cpu,
  Activity,
  Shield,
  Menu,
  X,
  ArrowRight,
  Clock,
  ExternalLink,
  Layers,
} from 'lucide-react';
import heroExperimentImg from '@/assets/hero_experiment.png';
import { useAuth } from '@/context/AuthContext';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS & STATIC DATA
───────────────────────────────────────────────────────────────────────────── */

const EXPERIMENT_STEPS = [
  { num: '01', action: 'Initialize experiment workstation' },
  { num: '02', action: 'Retrieve biological experiment module' },
  { num: '03', action: 'Verify module identification' },
  { num: '04', action: 'Secure module in workstation fixture' },
  { num: '05', action: 'Prepare observation chamber' },
  { num: '06', action: 'Transfer sample module' },
  { num: '07', action: 'Position imaging unit' },
  { num: '08', action: 'Capture observation' },
  { num: '09', action: 'Record observation' },
  { num: '10', action: 'Secure and stow experiment module' },
];

const WHAT_ALTRON_DOES = [
  {
    num: '01',
    icon: Eye,
    title: 'Observe',
    description:
      'Computer vision observes human activity, hands and experiment objects in real time through a connected camera.',
  },
  {
    num: '02',
    icon: Brain,
    title: 'Understand',
    description:
      'AI identifies object interactions and human actions, classifying what is happening at each moment of the experiment.',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: 'Verify',
    description:
      'The procedure engine compares observed actions with the expected experiment steps and flags any mismatch.',
  },
  {
    num: '04',
    icon: Volume2,
    title: 'Guide',
    description:
      'ALTRON suggests the next required step and provides voice guidance to support the operator during the experiment.',
  },
  {
    num: '05',
    icon: FileText,
    title: 'Record',
    description:
      'ALTRON creates timestamped, structured experiment evidence with confidence scores for each verified action.',
  },
];

const CAPABILITIES = [
  'Computer Vision',
  'Human Activity Recognition',
  'Object Detection',
  'Procedure Recognition',
  'Sequence Verification',
  'Next-Step Guidance',
  'Voice Alerts',
  'Timestamped Logging',
  'Video Monitoring',
  'Offline / Edge Processing',
];

const EXPERIMENT_UPDATES = [
  { time: '12:41:03', event: 'Experiment procedure initialized', type: 'info' },
  { time: '12:41:04', event: 'Crew activity detected in frame', type: 'info' },
  { time: '12:41:05', event: 'Step 01 verified — Initialize workstation', type: 'success' },
  { time: '12:41:08', event: 'Step 02 verified — Retrieve experiment module', type: 'success' },
  { time: '12:41:11', event: 'Step 03 verified — Verify module identification', type: 'success' },
  { time: '12:41:14', event: 'Out-of-sequence action detected', type: 'warning' },
  { time: '12:41:15', event: 'Voice guidance triggered', type: 'info' },
  { time: '12:41:20', event: 'Experiment verification active', type: 'success' },
];

const EVIDENCE_ROWS = [
  { step: '01', action: 'Initialize workstation',       result: 'VERIFIED', time: '12:41:05', conf: '96%' },
  { step: '02', action: 'Retrieve experiment module',    result: 'VERIFIED', time: '12:41:08', conf: '94%' },
  { step: '03', action: 'Verify module identification', result: 'VERIFIED', time: '12:41:11', conf: '98%' },
  { step: '04', action: 'Secure module in fixture',      result: 'VERIFIED', time: '12:41:22', conf: '95%' },
  { step: '05', action: 'Prepare observation chamber',   result: 'VERIFIED', time: '12:41:30', conf: '92%' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#1a6fc4] mb-2">{children}</p>
);

const SectionHeading: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <h2 className={`text-2xl md:text-3xl font-bold leading-tight tracking-tight ${light ? 'text-white' : 'text-[#0a1628]'}`}>
    {children}
  </h2>
);

const SectionRule: React.FC<{ light?: boolean }> = ({ light }) => (
  <div className={`w-10 h-[3px] mt-4 mb-6 ${light ? 'bg-white/40' : 'bg-[#1a6fc4]'}`} />
);

/* ─────────────────────────────────────────────────────────────────────────────
   FLASH BAR — ISRO-style scrolling news bar
───────────────────────────────────────────────────────────────────────────── */
const FlashBar: React.FC = () => (
  <div className="bg-[#0d2b5e] text-white flex items-center overflow-hidden">
    <div className="shrink-0 bg-[#d32f2f] text-white text-[10px] font-black tracking-[0.2em] uppercase px-4 py-2 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
      UPDATES
    </div>
    <div className="overflow-hidden flex-1 py-2 px-4">
      <div className="flex gap-12 animate-marquee whitespace-nowrap text-[11px] text-blue-100">
        <span>ALTRON AI Procedural Intelligence System initialized</span>
        <span>•</span>
        <span>AI Human Activity Recognition pipeline active</span>
        <span>•</span>
        <span>Microgravity Biological Observation experiment loaded</span>
        <span>•</span>
        <span>Procedure engine verified 10-step sequence</span>
        <span>•</span>
        <span>Voice guidance system operational</span>
        <span>•</span>
        <span>Local edge processing — no cloud inference required</span>
        <span>•</span>
        <span>ALTRON Space Technology Research Prototype</span>
        <span>•</span>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SITE HEADER — Institutional navigation bar
───────────────────────────────────────────────────────────────────────────── */
const SiteHeader: React.FC<{ onConsole: () => void; isAuthenticated?: boolean; userName?: string }> = ({ onConsole, isAuthenticated, userName }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Home',         path: '/' },
    { label: 'About ALTRON', path: '#about' },
    { label: 'Experiments',  path: '/experiments' },
    { label: 'Live Monitor', path: '/monitor' },
    { label: 'Reports',      path: '/reports' },
    { label: 'Documentation', path: '#docs' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 bg-white ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between h-[68px]">

          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-3 select-none">
            <div className="w-11 h-11 rounded-full bg-[#0d2b5e] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-[18px] font-extrabold tracking-widest text-[#0d2b5e] uppercase leading-none">
                ALTRON
              </div>
              <div className="text-[9px] font-medium tracking-[0.18em] text-[#1a6fc4] uppercase mt-0.5">
                AI Procedural Intelligence
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ label, path }) =>
              path.startsWith('#') ? (
                <a
                  key={label}
                  href={path}
                  className="px-3.5 py-2 text-[13px] font-medium text-[#1a1a1a] hover:text-[#1a6fc4] transition-colors relative group"
                >
                  {label}
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-[#1a6fc4] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </a>
              ) : (
                <Link
                  key={label}
                  to={path}
                  className="px-3.5 py-2 text-[13px] font-medium text-[#1a1a1a] hover:text-[#1a6fc4] transition-colors relative group"
                >
                  {label}
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-[#1a6fc4] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              )
            )}
          </nav>

          {/* Right: Open Console CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && userName && (
              <span className="text-[12px] text-slate-600 font-medium hidden xl:block">{userName}</span>
            )}
            <button
              onClick={onConsole}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0d2b5e] hover:bg-[#1a4080] text-white text-[13px] font-semibold tracking-wide rounded transition-colors"
            >
              {isAuthenticated ? 'Open Operations Console' : 'Open Console'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-[#0d2b5e]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 pb-4">
            {navLinks.map(({ label, path }) =>
              path.startsWith('#') ? (
                <a
                  key={label}
                  href={path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2.5 text-[13px] font-medium text-[#1a1a1a] hover:text-[#1a6fc4] border-b border-gray-50"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2.5 text-[13px] font-medium text-[#1a1a1a] hover:text-[#1a6fc4] border-b border-gray-50"
                >
                  {label}
                </Link>
              )
            )}
            <button
              onClick={() => { onConsole(); setMobileOpen(false); }}
              className="mt-3 w-full px-5 py-2.5 bg-[#0d2b5e] text-white text-[13px] font-semibold rounded"
            >
              Open Console
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   HERO SECTION — Full-width institutional banner
───────────────────────────────────────────────────────────────────────────── */
const HeroSection: React.FC<{ onConsole: () => void }> = ({ onConsole }) => (
  <section className="relative bg-[#071428] overflow-hidden">
    {/* Full-width background image */}
    <div className="absolute inset-0">
      <img
        src={heroExperimentImg}
        alt="Astronaut conducting scientific experiment in spacecraft laboratory"
        className="w-full h-full object-cover object-center opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071428]/95 via-[#071428]/70 to-[#071428]/30" />
    </div>

    <div className="relative max-w-7xl mx-auto px-5 lg:px-10 py-20 lg:py-28">
      <div className="max-w-2xl">
        {/* Prototype identifier */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 border border-white/30 text-white/70 bg-white/10 rounded-sm">
            SPACE TECHNOLOGY RESEARCH PROTOTYPE
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-none tracking-tight uppercase mb-2">
          ALTRON
        </h1>
        <p className="text-xl sm:text-2xl font-semibold text-[#7ab3f0] mb-5 leading-snug">
          AI-Powered Procedural Intelligence<br />for Space Experiments
        </p>
        <div className="w-12 h-[3px] bg-[#d32f2f] mb-6" />

        {/* 4-word mission */}
        <p className="text-base font-medium text-white/80 uppercase tracking-widest mb-2">
          Observe · Understand · Verify · Guide
        </p>

        {/* Description */}
        <p className="text-sm text-white/65 leading-relaxed max-w-xl mb-8">
          ALTRON combines computer vision and procedural intelligence to understand predefined
          scientific experiment workflows — recognizing human actions, verifying procedure sequences,
          detecting deviations, and generating structured experiment evidence.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            to="/experiments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a6fc4] hover:bg-[#2589e8] text-white font-semibold text-sm tracking-wide rounded transition-colors shadow-lg"
          >
            Explore ALTRON
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onConsole}
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 hover:border-white/70 text-white font-semibold text-sm tracking-wide rounded transition-colors"
          >
            Open Mission Console
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    {/* Bottom decoration bar — like ISRO's orange/saffron stripe */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d32f2f] via-[#f59e0b] to-[#1a6fc4]" />
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   FEATURED EXPERIMENT — ISRO-style featured mission section
───────────────────────────────────────────────────────────────────────────── */
const FeaturedExperimentSection: React.FC = () => (
  <section className="bg-gray-50 border-b border-gray-200 py-16">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: Content */}
        <div>
          <SectionEyebrow>Featured Experiment</SectionEyebrow>
          <SectionHeading>Microgravity Biological Observation</SectionHeading>
          <SectionRule />
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            A representative demonstration evaluating ALTRON's ability to recognize crew
            human activity, object interactions, and procedural sequences during spaceflight biological research.
            This 10-step experiment serves as the primary benchmark for the ALTRON system.
          </p>

          {/* Procedure list */}
          <div className="space-y-2 mb-7 max-h-[340px] overflow-y-auto pr-1">
            {EXPERIMENT_STEPS.map((step) => (
              <div key={step.num} className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded">
                <span className="w-6 h-6 rounded-full bg-[#0d2b5e] text-white text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                  {step.num}
                </span>
                <span className="text-xs font-medium text-gray-800">{step.action}</span>
              </div>
            ))}
          </div>

          <Link
            to="/experiments"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d2b5e] hover:bg-[#1a4080] text-white text-sm font-semibold tracking-wide rounded transition-colors"
          >
            View Experiment Protocol
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right: Experiment preview panel */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="bg-[#0d2b5e] text-white px-5 py-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-200">Experiment Preview</div>
              <div className="text-sm font-semibold mt-0.5">Microgravity Biological Observation</div>
            </div>
            <span className="text-[10px] px-2.5 py-1 bg-white/15 rounded text-blue-100 font-medium font-mono">
              PROTOTYPE
            </span>
          </div>

          {/* Procedure progress */}
          <div className="p-5">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">
              Procedure Progress (Step 04 Active)
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {[
                { num: '01', action: 'Initialize workstation',          status: 'verified' },
                { num: '02', action: 'Retrieve experiment module',      status: 'verified' },
                { num: '03', action: 'Verify module identification',   status: 'verified' },
                { num: '04', action: 'Secure module in fixture',        status: 'active'   },
                { num: '05', action: 'Prepare observation chamber',     status: 'pending'  },
                { num: '06', action: 'Transfer sample module',          status: 'pending'  },
                { num: '07', action: 'Position imaging unit',           status: 'pending'  },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center gap-3 px-3 py-2 rounded border text-xs ${
                    s.status === 'verified' ? 'bg-green-50 border-green-200 text-green-800' :
                    s.status === 'active'   ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' :
                                              'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <span className="font-mono text-[11px] w-5 shrink-0">{s.num}</span>
                  <span className="flex-1">{s.action}</span>
                  {s.status === 'verified' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  )}
                  {s.status === 'active' && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded shrink-0 font-mono">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Current action */}
            <div className="mt-4 p-3 bg-[#f0f4fa] border border-[#c5d6f0] rounded font-mono">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-sans">Current Action Detected</div>
              <div className="font-semibold text-[#0d2b5e] text-xs">Secure Module in Fixture</div>
              <div className="flex items-center gap-1.5 mt-1.5 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[11px] font-bold text-green-700 font-mono">VERIFIED — Step 04</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   WHAT ALTRON DOES — 5-column feature blocks
───────────────────────────────────────────────────────────────────────────── */
const WhatAltronDoesSection: React.FC = () => (
  <section className="bg-white py-16 border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="text-center mb-12">
        <SectionEyebrow>System Overview</SectionEyebrow>
        <SectionHeading>What ALTRON Does</SectionHeading>
        <div className="w-10 h-[3px] bg-[#1a6fc4] mx-auto mt-4 mb-5" />
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          ALTRON connects camera observation, AI recognition, and experiment protocols
          into a unified procedural intelligence system for scientific experiment support.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {WHAT_ALTRON_DOES.map(({ num, icon: Icon, title, description }) => (
          <div
            key={num}
            className="text-center group"
          >
            <div className="w-14 h-14 rounded-full bg-[#e8f0fb] border-2 border-[#c5d6f0] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#1a6fc4] group-hover:border-[#1a6fc4] transition-colors">
              <Icon className="w-6 h-6 text-[#1a6fc4] group-hover:text-white transition-colors" />
            </div>
            <div className="text-[10px] font-black text-[#1a6fc4] tracking-widest uppercase mb-1">
              {num}
            </div>
            <h3 className="text-[15px] font-bold text-[#0d2b5e] mb-2">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   AI COMPUTER VISION PIPELINE SECTION
───────────────────────────────────────────────────────────────────────────── */
const AIPipelineSection: React.FC = () => {
  const stages = [
    { icon: Camera,        label: 'Camera',       sub: 'Frame capture' },
    { icon: Eye,           label: 'Human\nDetection', sub: 'Locate operator' },
    { icon: Activity,      label: 'Hand / Pose',  sub: 'Track joints' },
    { icon: Cpu,           label: 'Object\nDetection', sub: 'Identify objects' },
    { icon: Brain,         label: 'Interaction',  sub: 'Human-object contact' },
    { icon: CheckCircle2,  label: 'Action\nRecognition', sub: 'Classify action' },
  ];

  return (
    <section className="bg-[#f7f9fc] border-b border-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <div>
            <SectionEyebrow>Technology</SectionEyebrow>
            <SectionHeading>AI Human Activity Recognition</SectionHeading>
            <SectionRule />
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              ALTRON uses a six-stage computer vision pipeline that transforms raw camera frames
              into classified, verified procedural actions. Each stage builds on the previous
              to produce a complete understanding of what is happening in the experiment workspace.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The pipeline runs locally on device — no cloud inference is required —
              making ALTRON suitable for isolated and offline operational environments.
            </p>

            {/* Pipeline flow linear */}
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Processing Pipeline
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {['Camera', 'Human Detection', 'Hand / Pose', 'Object Detection',
                  'Interaction', 'Action', 'Procedure Engine', 'Verification', 'Audit Log'].map((s, i, arr) => (
                  <React.Fragment key={s}>
                    <span className={`text-[10px] px-2 py-1 rounded font-medium ${
                      i === arr.length - 1
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-[#f0f4fa] text-[#0d2b5e] border border-[#c5d6f0]'
                    }`}>
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Pipeline stage cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stages.map(({ icon: Icon, label, sub }, i) => (
              <div
                key={label}
                className={`p-4 rounded-lg border text-center ${
                  i === stages.length - 1
                    ? 'bg-[#0d2b5e] border-[#0d2b5e] text-white'
                    : 'bg-white border-gray-200 hover:border-[#1a6fc4] transition-colors'
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  i === stages.length - 1 ? 'bg-white/20' : 'bg-[#e8f0fb]'
                }`}>
                  <Icon className={`w-5 h-5 ${i === stages.length - 1 ? 'text-white' : 'text-[#1a6fc4]'}`} />
                </div>
                <div className={`text-[11px] font-bold leading-tight mb-1 whitespace-pre-line ${
                  i === stages.length - 1 ? 'text-white' : 'text-[#0d2b5e]'
                }`}>
                  {label}
                </div>
                <div className={`text-[10px] leading-snug ${
                  i === stages.length - 1 ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PROCEDURAL INTELLIGENCE SECTION
───────────────────────────────────────────────────────────────────────────── */
const ProceduralIntelligenceSection: React.FC = () => (
  <section className="bg-white py-16 border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="text-center mb-12">
        <SectionEyebrow>Core Capability</SectionEyebrow>
        <SectionHeading>Procedural Intelligence & Verification Engine</SectionHeading>
        <div className="w-10 h-[3px] bg-[#1a6fc4] mx-auto mt-4 mb-5" />
        <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
          ALTRON moves beyond static computer vision by synthesizing real-time spatial movement, hand-object interaction graphs, and temporal state machines to continuously verify microgravity experiment execution compliance.
        </p>
      </div>

      {/* 4 Core Intelligence Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          {
            title: 'Deterministic State Machine',
            code: 'SEQ_ENGINE_v2.4',
            desc: 'Tracks active step execution state, enforcing strict prerequisite graph rules and minimum step dwell time before step advancement.',
            metric: '100% Sequence Guard',
            color: 'border-blue-200 bg-blue-50/40 text-blue-900',
          },
          {
            title: 'Human-Object Interaction',
            code: 'HOI_VECTOR_GRAPH',
            desc: 'Calculates spatial bounding box overlap, hand landmark velocities, and tool contact duration to confirm physical interaction.',
            metric: 'Real-Time Spatio-Temporal',
            color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
          },
          {
            title: 'Deviation & Anomaly Engine',
            code: 'DEVIATION_MONITOR',
            desc: 'Instantly identifies out-of-sequence steps, skipped tasks, unauthorized tool contact, and operator timeout stalls.',
            metric: 'Sub-30ms Anomaly Flagging',
            color: 'border-amber-200 bg-amber-50/40 text-amber-900',
          },
          {
            title: 'Closed-Loop Audio & Audit',
            code: 'FEEDBACK_LOGGER',
            desc: 'Dispatches contextual voice alerts via Speech Synthesis and records cryptographic ISO-8601 audit events with frame evidence.',
            metric: 'Automated Audit Trail',
            color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900',
          },
        ].map((pillar) => (
          <div key={pillar.title} className={`p-5 border rounded-lg ${pillar.color}`}>
            <div className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70 mb-1">{pillar.code}</div>
            <h4 className="text-sm font-bold mb-2">{pillar.title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{pillar.desc}</p>
            <div className="text-[11px] font-mono font-semibold pt-2 border-t border-black/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
              {pillar.metric}
            </div>
          </div>
        ))}
      </div>

      {/* Live Verification Scenarios (Verified vs Out-of-Sequence) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">

        {/* VERIFIED example */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="bg-[#f0f9f4] border-b border-green-200 px-5 py-3 flex items-center justify-between">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Scenario 01 — Verified Sequence Compliance
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">STATE_VERIFIED</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded text-center">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold font-mono">Expected Step</div>
                <div className="text-xs font-semibold text-gray-800">Secure Module in Fixture</div>
                <div className="text-[10px] text-gray-500 font-mono mt-1">STEP_04</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <ArrowRight className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[9px] font-mono text-emerald-700 font-bold">1.8s Hold</span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded text-center">
                <div className="text-[9px] text-emerald-700 uppercase tracking-wider mb-1 font-bold font-mono">Observed Action</div>
                <div className="text-xs font-semibold text-emerald-900">Secure Module in Fixture</div>
                <div className="text-[10px] text-emerald-600 font-mono mt-1">CONF_94.8%</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-900 font-mono">VERIFICATION STATUS: STEP COMPLETE</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Procedure Engine confirmed step completion. Advancing to Step 05 (Prepare Observation Chamber).</div>
              </div>
            </div>
          </div>
        </div>

        {/* OUT-OF-SEQUENCE example */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="bg-[#fdf4f4] border-b border-red-200 px-5 py-3 flex items-center justify-between">
            <div className="text-[10px] font-bold text-red-800 uppercase tracking-widest font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Scenario 02 — Out-Of-Sequence Deviation
            </div>
            <span className="text-[10px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold">DEVIATION_ALERT</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded text-center">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold font-mono">Expected Step</div>
                <div className="text-xs font-semibold text-gray-800">Position Imaging Unit</div>
                <div className="text-[10px] text-gray-500 font-mono mt-1">STEP_07</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <X className="w-5 h-5 text-red-500 mb-1" />
                <span className="text-[9px] font-mono text-red-600 font-bold">BLOCKED</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
                <div className="text-[9px] text-red-700 uppercase tracking-wider mb-1 font-bold font-mono">Observed Action</div>
                <div className="text-xs font-semibold text-red-800">Stow Module</div>
                <div className="text-[10px] text-red-600 font-mono mt-1">STEP_10</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-red-900 font-mono">DEVIATION FLAG: OUT_OF_SEQUENCE</div>
                <div className="text-[10px] text-red-700 mt-0.5">Attempted Step 10 prior to completing Step 07. Execution state locked.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded">
              <Volume2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 font-medium italic">
                "Voice Prompt: Please complete observation step 07 before stowing the module."
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Comprehensive Procedural Safety Rules Table / Spec */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#f7f9fc] border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0d2b5e] uppercase tracking-wider font-mono">Procedural Safety & Autonomous Verification Standards</h3>
              <p className="text-xs text-gray-500">System guardrails enforcing strict experiment reproducibility and astronaut safety.</p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded self-start sm:self-auto">ISO-8601 AUDIT READY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Skipped Steps', desc: 'Flags uncompleted procedure steps and prevents state machine auto-advancement.', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
              { label: 'Wrong Actions', desc: 'Detects unauthorized tool usage or incorrect physical manipulations.', icon: X, color: 'text-red-600 bg-red-50 border-red-200' },
              { label: 'Out-of-Sequence', desc: 'Identifies prerequisite violations when steps are executed out of defined order.', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
              { label: 'Procedure Timeout', desc: 'Monitors operator stall durations and notifies crew if a step exceeds safe limits.', icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            ].map(({ label, desc, icon: Icon, color }) => (
              <div key={label} className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 border rounded ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">{label}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   LIVE MONITOR PREVIEW — Technical interface preview inside clean container
───────────────────────────────────────────────────────────────────────────── */
const LiveMonitorSection: React.FC<{ onConsole: () => void }> = ({ onConsole }) => (
  <section className="bg-[#0d2b5e] py-16">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: Description */}
        <div>
          <SectionEyebrow>Live System</SectionEyebrow>
          <SectionHeading light>Live Experiment Monitor</SectionHeading>
          <SectionRule light />
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            The ALTRON Live Monitor provides a real-time view of the camera feed, object detection
            overlays, current action classification, and procedure verification status.
          </p>
          <p className="text-sm text-white/70 leading-relaxed mb-7">
            Each camera frame is processed through the AI pipeline to detect crew member
            hands, classify the current action, and compare it against the expected experiment step.
          </p>
          <button
            onClick={onConsole}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0d2b5e] font-semibold text-sm tracking-wide rounded hover:bg-blue-50 transition-colors"
          >
            Open Live Monitor
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Monitor preview card */}
        <div className="bg-[#071428] border border-[#1a4080] rounded-lg overflow-hidden shadow-2xl">
          {/* Camera header */}
          <div className="bg-[#0a1e3f] border-b border-[#1a4080] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d32f2f]" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-300 tracking-widest">
                ALTRON · CAMERA 01 · SIMULATION MODE
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          </div>

          {/* Detection status */}
          <div className="p-4 border-b border-[#1a4080]">
            <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-2 font-mono">Detected Objects</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'PERSON',               color: 'text-blue-300 border-blue-500 bg-blue-500/10' },
                { label: 'HAND',                 color: 'text-green-300 border-green-500 bg-green-500/10' },
                { label: 'EXPERIMENT MODULE',    color: 'text-[#4fa3f7] border-blue-400 bg-blue-400/10' },
                { label: 'SAMPLE CONTAINER',     color: 'text-purple-300 border-purple-500 bg-purple-500/10' },
                { label: 'OBSERVATION CHAMBER',  color: 'text-cyan-300 border-cyan-500 bg-cyan-500/10' },
                { label: 'WORKSTATION FIXTURE', color: 'text-slate-300 border-slate-500 bg-slate-500/10' },
              ].map(({ label, color }) => (
                <span key={label} className={`text-[9px] font-mono font-bold px-2 py-1 border rounded ${color}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Action status */}
          <div className="p-4 space-y-2.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold font-sans">Current Action</span>
              <span className="text-xs font-bold text-white">Secure Module in Fixture</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold font-sans">Expected</span>
              <span className="text-xs font-bold text-white">Secure Module in Fixture</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold font-sans">Result</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED
              </span>
            </div>
            <div className="mt-1 pt-2.5 border-t border-[#1a4080]">
              <div className="text-[9px] text-blue-400 uppercase tracking-wider font-bold mb-1 font-sans">Next Step</div>
              <div className="text-[11px] text-blue-200 font-medium">
                05 — Prepare observation chamber
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   VOICE GUIDANCE SECTION
───────────────────────────────────────────────────────────────────────────── */
const VoiceGuidanceSection: React.FC = () => (
  <section className="bg-[#f7f9fc] py-16 border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        <div>
          <SectionEyebrow>Guidance System</SectionEyebrow>
          <SectionHeading>Voice Guidance</SectionHeading>
          <SectionRule />
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            ALTRON provides contextual spoken guidance to the operator during experiment
            execution. The system announces each verified step and alerts the operator when
            an out-of-sequence action is detected — without requiring manual interaction.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Step Verified</div>
                <p className="text-sm text-gray-700 italic">
                  "Step two verified. Please verify module identification barcode."
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white border border-amber-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deviation Warning</div>
                <p className="text-sm text-gray-700 italic">
                  "Warning. This action is out of sequence. Please complete the current procedure step."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Local edge processing */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#0d2b5e] px-5 py-4">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">
              Processing Mode
            </div>
            <div className="text-lg font-bold text-white">Local / Edge Intelligence</div>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              ALTRON is designed around local processing for the prototype, supporting an
              offline and standalone AI workflow. No external cloud connectivity is required
              for core inference.
            </p>
            <div className="space-y-3">
              {[
                { icon: Shield,   label: 'All AI inference runs on local hardware' },
                { icon: Cpu,      label: 'No cloud connectivity required for core functions' },
                { icon: Activity, label: 'Designed for isolated and remote environments' },
                { icon: Eye,      label: 'Data stays on device — no external transmission' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#e8f0fb] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#1a6fc4]" />
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   EXPERIMENT EVIDENCE / REPORTS SECTION
───────────────────────────────────────────────────────────────────────────── */
const EvidenceSection: React.FC = () => (
  <section className="bg-white py-16 border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Description */}
        <div className="lg:col-span-1">
          <SectionEyebrow>Reporting</SectionEyebrow>
          <SectionHeading>Experiment Evidence</SectionHeading>
          <SectionRule />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Every procedural action produces a timestamped record. ALTRON generates a
            structured Experiment Verification Report with full action traceability.
          </p>

          {/* Run metadata */}
          <div className="space-y-2 text-sm mb-6">
            {[
              { label: 'Experiment',    value: 'Microgravity Biological Observation' },
              { label: 'Run ID',        value: 'RUN-2026-09-29-001' },
              { label: 'Duration',      value: '00:01:45' },
              { label: 'Final Status',  value: 'VERIFIED IN PROGRESS' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start py-1.5 border-b border-gray-100">
                <span className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">{label}</span>
                <span className="text-gray-800 font-semibold text-xs text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0d2b5e] hover:bg-[#1a4080] text-white text-xs font-semibold tracking-wide rounded transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Export JSON Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 hover:border-[#1a6fc4] hover:text-[#1a6fc4] text-xs font-semibold tracking-wide rounded transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Export CSV Log
            </button>
          </div>
        </div>

        {/* Right: Evidence table */}
        <div className="lg:col-span-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Experiment Verification Report — Sample Output
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Step', 'Action', 'Result', 'Timestamp', 'Confidence'].map((h) => (
                    <th key={h} className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {EVIDENCE_ROWS.map((row) => (
                  <tr key={row.step} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono font-bold text-[#0d2b5e]">{row.step}</td>
                    <td className="py-3 px-4 text-xs text-gray-700 font-medium">{row.action}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        {row.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-400">{row.time}</td>
                    <td className="py-3 px-4 text-xs font-mono font-bold text-green-600">{row.conf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6fc4] hover:text-[#0d2b5e] transition-colors"
            >
              View Full Report
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   EXPERIMENT UPDATES — ISRO-style latest news section
───────────────────────────────────────────────────────────────────────────── */
const ExperimentUpdatesSection: React.FC = () => (
  <section className="bg-gray-50 py-16 border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Section header */}
        <div>
          <SectionEyebrow>Activity Log</SectionEyebrow>
          <SectionHeading>ALTRON Experiment Updates</SectionHeading>
          <SectionRule />
          <p className="text-sm text-gray-500 leading-relaxed">
            Real-time event log from the ALTRON procedure engine.
            Each event is timestamped and categorized by type.
          </p>
        </div>

        {/* Right: Updates list */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {EXPERIMENT_UPDATES.map((update, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 px-5 py-3.5 border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      update.type === 'success' ? 'bg-green-500' :
                      update.type === 'warning' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-gray-400 w-14">{update.time}</span>
                </div>
                <span className="text-sm text-gray-700">{update.event}</span>
                {update.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 ml-auto mt-0.5" />
                )}
                {update.type === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 ml-auto mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SYSTEM CAPABILITIES SECTION
───────────────────────────────────────────────────────────────────────────── */
const CapabilitiesSection: React.FC = () => (
  <section className="bg-white py-16 border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="text-center mb-10">
        <SectionEyebrow>Technical Capabilities</SectionEyebrow>
        <SectionHeading>System Capabilities</SectionHeading>
        <div className="w-10 h-[3px] bg-[#1a6fc4] mx-auto mt-4" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CAPABILITIES.map((cap) => (
          <div
            key={cap}
            className="flex items-center gap-2.5 p-4 bg-[#f7f9fc] border border-gray-200 rounded-lg hover:border-[#1a6fc4] hover:bg-[#f0f4fa] transition-colors group"
          >
            <div className="w-2 h-2 rounded-full bg-[#1a6fc4] shrink-0 group-hover:scale-125 transition-transform" />
            <span className="text-xs font-medium text-gray-700">{cap}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ABOUT ALTRON SECTION
───────────────────────────────────────────────────────────────────────────── */
const AboutSection: React.FC = () => (
  <section id="about" className="bg-gray-50 py-16 border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="max-w-3xl">
        <SectionEyebrow>About</SectionEyebrow>
        <SectionHeading>About ALTRON</SectionHeading>
        <SectionRule />
        <p className="text-base text-gray-600 leading-relaxed mb-4">
          ALTRON explores how computer vision and procedural intelligence can support scientific
          experiment execution in human-spaceflight environments. The system connects visual
          observation with procedural verification and real-time guidance.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          By combining human activity recognition, object detection, and a procedure engine,
          ALTRON can monitor a predefined experiment workflow and compare what it observes
          against what it expects — step by step.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          The prototype is designed to operate entirely on local hardware, making it suitable
          for evaluation in environments where external connectivity may be limited. Voice guidance
          and structured evidence generation are built into the core system.
        </p>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   INSTITUTIONAL FOOTER
───────────────────────────────────────────────────────────────────────────── */
const SiteFooter: React.FC = () => (
  <footer className="bg-[#071428] text-white">
    {/* Top footer bar — tricolor accent */}
    <div className="h-1 bg-gradient-to-r from-[#d32f2f] via-white/30 to-[#1a6fc4]" />

    <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#1a4080] flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-widest uppercase">ALTRON</div>
              <div className="text-[9px] font-medium tracking-[0.2em] text-blue-300 uppercase">
                AI Procedural Intelligence for Space Experiments
              </div>
            </div>
          </div>
          <p className="text-sm text-white/55 leading-relaxed max-w-sm mb-5">
            An advanced research prototype for AI-assisted experiment
            procedure verification in human spaceflight environments.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] px-2.5 py-1 border border-white/20 text-blue-300 rounded font-mono tracking-wider">
              AI / CV RESEARCH
            </span>
            <span className="text-[10px] px-2.5 py-1 border border-white/10 text-white/40 rounded font-mono tracking-wider">
              SPACE TECHNOLOGY PROTOTYPE
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-5">Navigation</div>
          <ul className="space-y-2.5">
            {[
              { label: 'Home',             path: '/' },
              { label: 'Experiments',      path: '/experiments' },
              { label: 'Live Monitor',     path: '/monitor' },
              { label: 'Reports',          path: '/reports' },
              { label: 'Mission Console',  path: '/dashboard' },
              { label: 'System',           path: '/settings' },
            ].map(({ label, path }) => (
              <li key={path}>
                <Link
                  to={path}
                  className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-white/30" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical */}
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-5">Technical</div>
          <div className="space-y-2.5 text-sm text-white/55">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">System Type</div>
              <div className="font-semibold text-white/70">Research Prototype</div>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Processing</div>
              <div className="font-semibold text-white/70">Local / Edge / Offline</div>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Category</div>
              <div className="font-semibold text-white/70">Space Technology · AI · CV</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/10 py-5 px-5 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-white/35">
        <span>ALTRON · AI Procedural Intelligence for Space Experiments · Research Prototype</span>
        <span className="uppercase tracking-wider">Not an official ISRO product · Research Prototype Only</span>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // If authenticated → go to dashboard; otherwise → go to login
  const handleConsole = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <FlashBar />
      <SiteHeader onConsole={handleConsole} isAuthenticated={isAuthenticated} userName={user?.name} />
      <main>
        <HeroSection onConsole={handleConsole} />
        <FeaturedExperimentSection />
        <WhatAltronDoesSection />
        <AIPipelineSection />
        <ProceduralIntelligenceSection />
        <LiveMonitorSection onConsole={handleConsole} />
        <VoiceGuidanceSection />
        <EvidenceSection />
        <ExperimentUpdatesSection />
        <CapabilitiesSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default LandingPage;
