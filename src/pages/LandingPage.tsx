import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroAstronautImg from '@/assets/hero_astronaut.png';
import stationScienceVideo from '@/assets/station_science_earth_obs.mp4';
import donPettitScienceVideo from '@/assets/don_pettit_science.mp4';
import seeingHomeVideo from '@/assets/seeing_home.mp4';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AltronLogo } from '@/components/AltronLogo';

interface SpaceStationFeed {
  id: string;
  name: string;
  shortLabel: string;
  src: string;
  publicSrc: string;
  quality: string;
}

const SPACE_STATION_FEEDS: SpaceStationFeed[] = [
  {
    id: 'station-science',
    name: 'Orbital Station Science & Earth Observation',
    shortLabel: 'Station Science',
    src: stationScienceVideo,
    publicSrc: '/assets/station_science.mp4',
    quality: '43 MB · 720p HD',
  },
  {
    id: 'astronaut-lab',
    name: 'Astronaut Microgravity Research Workstation',
    shortLabel: 'Astronaut Lab',
    src: donPettitScienceVideo,
    publicSrc: '/assets/astronaut_science.mp4',
    quality: '44 MB · 720p HD',
  },
  {
    id: 'cupola-orbital',
    name: 'Orbital Cupola & Deep Space Horizon',
    shortLabel: 'Orbital Horizon',
    src: seeingHomeVideo,
    publicSrc: '/assets/orbital_cupola.mp4',
    quality: '20 MB · 720p HD',
  },
];

/**
 * ALTRON — Single Front Landing Page with Max-Quality Space Station Video
 *
 * Requirements:
 * - One single canonical front page
 * - High-definition, distinct space station video background (not the internal CAM feed)
 * - Astronaut / space station / Earth observation cinematic visuals
 * - Subtle dark overlay preserving astronaut & space station clarity
 * - Minimal, focused aerospace content with "OPEN ALTRON CONSOLE" CTA
 * - Direct handoff into existing authentication flow
 */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeFeedIndex, setActiveFeedIndex] = useState(0);
  const activeFeed = SPACE_STATION_FEEDS[activeFeedIndex];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Configure video playback when active feed or motion preference changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    setVideoLoaded(false);
    setVideoError(false);

    video.muted = true;
    video.load();

    const handlePlaying = () => {
      setVideoLoaded(true);
      setVideoError(false);
    };

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or media load blocked -> fallback gracefully
        setVideoError(true);
      });
    }

    return () => {
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [activeFeedIndex, prefersReducedMotion]);

  // Primary CTA handler: Hand off directly to existing authentication flow
  const handleConsole = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative w-full h-screen min-h-[640px] overflow-hidden bg-[#020B18] text-white flex flex-col justify-between select-none">
      {/* ── 1. FULL-SCREEN LIVE SPACE BACKGROUND (MAX QUALITY) ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Static High-Resolution Fallback Image with Subtle Motion */}
        <img
          src={heroAstronautImg}
          alt="Astronaut inside orbital space station workstation"
          className={`absolute inset-0 w-full h-full object-cover object-[center_right] md:object-center transition-opacity duration-1000 ${
            videoLoaded && !videoError && !prefersReducedMotion ? 'opacity-0' : 'opacity-100'
          } ${prefersReducedMotion ? '' : 'animate-cinematic-drift'}`}
        />

        {/* Live Looping Max-Quality Background Video */}
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            key={activeFeed.id}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={heroAstronautImg}
            className={`absolute inset-0 w-full h-full object-cover object-[center_right] md:object-center transition-opacity duration-1000 ${
              videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* 1st priority: Drop-in static asset in public/assets/ */}
            <source src={activeFeed.publicSrc} type="video/mp4" />
            <source src="/assets/space_background.mp4" type="video/mp4" />
            {/* 2nd priority: Bundled space station video asset */}
            <source src={activeFeed.src} type="video/mp4" />
          </video>
        )}

        {/* ── 2. BACKGROUND OVERLAYS (Section 7) ── */}
        {/* Horizontal Gradient: Left dark for text legibility, clearing quickly towards center and right for full space visibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(2,11,24,0.86) 0%, rgba(2,11,24,0.72) 28%, rgba(2,11,24,0.30) 48%, rgba(2,11,24,0.06) 68%, transparent 100%)',
          }}
        />

        {/* Vertical Vignette: Anchors header and telemetry footer cleanly */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020B18]/75 via-transparent to-[#020B18]/85 pointer-events-none" />

        {/* Subtle aerospace subtle grid texture overlay (subdued 3% opacity) */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ── 3. HERO COMPOSITION: NATIVE ALTRON LOGO + TEXTUAL IDENTITY ── */}
      <main className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-16 flex-1 flex flex-col justify-center items-start py-8">
        <div className="max-w-xl text-left flex flex-col items-start">
          {/* 1. Animated Vector Logo Emblem (Extracted & Animated Native Element) */}
          <div className="mb-4 sm:mb-5">
            <AltronLogo
              size={185}
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 drop-shadow-[0_8px_32px_rgba(2,132,199,0.35)]"
            />
          </div>

          {/* 2. ALTRON Wordmark (Real HTML Text Matching Reference Identity) */}
          <div className="space-y-1 mb-3.5">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[0.24em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-sky-300 font-sans leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              ALTRON
            </h1>

            <p className="text-xs sm:text-sm md:text-base font-bold tracking-[0.26em] text-sky-400 uppercase drop-shadow-sm">
              AI PROCEDURAL INTELLIGENCE
            </p>

            <div className="flex items-center gap-3 pt-0.5">
              <span className="h-[1.5px] w-6 sm:w-10 bg-gradient-to-r from-transparent via-sky-400 to-sky-300" />
              <span className="text-[10px] sm:text-xs tracking-[0.28em] text-slate-300/90 uppercase font-semibold">
                FOR SPACE EXPERIMENTS
              </span>
              <span className="h-[1.5px] w-6 sm:w-10 bg-gradient-to-l from-transparent via-sky-400 to-sky-300" />
            </div>
          </div>

          {/* 3. Supporting Institutional Prototype Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-sky-950/50 border border-sky-400/30 text-sky-300/90 text-[10px] sm:text-[11px] font-mono font-medium tracking-[0.22em] uppercase mb-6 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Space Technology Research Prototype
          </div>

          {/* 4. Primary CTA Button: Seamless Existing Authentication Route */}
          <div>
            <button
              onClick={handleConsole}
              id="cta-open-altron-console"
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-3.5 sm:py-4 bg-[#1a6fc4] hover:bg-[#2589e8] text-white text-xs sm:text-sm font-bold tracking-[0.18em] uppercase rounded-sm shadow-[0_4px_28px_rgba(26,111,196,0.45)] hover:shadow-[0_6px_36px_rgba(37,137,232,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group cursor-pointer border border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-[#020B18]"
            >
              <span>{isAuthenticated ? 'OPEN OPERATIONS CONSOLE' : 'OPEN ALTRON CONSOLE'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </main>

      {/* ── 4. TECHNICAL MISSION STATUS FOOTER ── */}
      <footer className="relative z-20 w-full px-6 sm:px-10 md:px-14 lg:px-16 py-3.5 border-t border-white/10 bg-[#020B18]/70 backdrop-blur-md">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400/80 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-200 font-semibold tracking-wider">ALTRON</span>
            <span>·</span>
            <span>Space Technology Research Prototype</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-sky-400/90 uppercase text-[10px] font-semibold">
              LOCAL EDGE PROCESSING
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-emerald-400 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ONLINE
            </span>
          </div>

          {/* Space Station Feed Selector Pill */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-full pointer-events-auto">
            <div className="flex items-center gap-1 text-[10px] text-sky-400 font-semibold tracking-wider uppercase mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ISS FEED:</span>
            </div>
            {SPACE_STATION_FEEDS.map((feed, idx) => (
              <button
                key={feed.id}
                onClick={() => setActiveFeedIndex(idx)}
                title={`${feed.name} (${feed.quality})`}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  activeFeedIndex === idx
                    ? 'bg-[#1a6fc4] text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {feed.shortLabel}
              </button>
            ))}
            <span className="text-[9px] text-slate-500 font-mono hidden xl:inline ml-1 pl-1 border-l border-white/10">
              {activeFeed.quality}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
