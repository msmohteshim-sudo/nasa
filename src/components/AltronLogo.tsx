import React from 'react';

interface AltronLogoProps {
  size?: number | string;
  className?: string;
  showRingsAnimation?: boolean;
  showCorePulse?: boolean;
  showLightSweep?: boolean;
}

/**
 * AltronLogo
 * 
 * High-fidelity, native vector aerospace brand mark matching the ALTRON identity:
 * - Iconic metallic silver beveled 'A' chevron with aerospace winglets
 * - Concentric metallic chassis ring and rotating outer telemetry radar ring
 * - Dual tilted elliptical orbital tracks with metallic satellite spheres
 * - Pulsing central spherical AI energy core with spherical wireframe grid and reticle
 * - Subtle continuous light sweep and interactive hover responsiveness
 * - 100% transparent, crisp SVG vector rendering with no background artifacts
 */
export const AltronLogo: React.FC<AltronLogoProps> = ({
  size = 320,
  className = '',
  showRingsAnimation = true,
  showCorePulse = true,
  showLightSweep = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none group ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="ALTRON Logo"
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full overflow-visible transition-transform duration-500 group-hover:scale-[1.02]"
      >
        <defs>
          {/* ── 1. METALLIC GRADIENTS FOR 'A' CHEVRON ── */}
          {/* Left Bevel: Polished silver-chrome with sharp highlight */}
          <linearGradient id="altron-a-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="55%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Right Bevel: Brushed titanium-steel with deep aerospace contrast */}
          <linearGradient id="altron-a-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="90%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Center Ridge Highlight */}
          <linearGradient id="altron-ridge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.4" />
          </linearGradient>

          {/* Outer Chamfer Edge Accent */}
          <linearGradient id="altron-chamfer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="40%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* ── 2. METALLIC RING GRADIENTS ── */}
          <linearGradient id="altron-ring-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="75%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="altron-ring-groove" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* ── 3. GLOWING ORBITAL GRADIENTS ── */}
          <linearGradient id="altron-orbit-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="20%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="1" />
            <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="altron-orbit-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#e0f2fe" stopOpacity="1" />
            <stop offset="85%" stopColor="#0284c7" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.15" />
          </linearGradient>

          {/* ── 4. CENTRAL AI CORE GRADIENTS ── */}
          <radialGradient id="altron-core-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#e0f2fe" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#0284c7" />
            <stop offset="92%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>

          <radialGradient id="altron-core-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#0369a1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>

          {/* ── 5. SPHERICAL SATELLITE GRADIENTS ── */}
          <radialGradient id="altron-satellite-sphere" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#64748b" />
            <stop offset="90%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          <radialGradient id="altron-satellite-cyan" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>

          {/* ── 6. DYNAMIC LIGHT SWEEP GRADIENT ── */}
          <linearGradient id="altron-light-sweep-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* ── 7. FILTERS ── */}
          <filter id="altron-cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="altron-intense-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur1" />
            <feGaussianBlur stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="altron-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#020B18" floodOpacity="0.75" />
          </filter>

          {/* Clip path for 'A' light sweep */}
          <clipPath id="altron-a-clip">
            <polygon points="300,66 450,438 424,446 384,402 344,402 344,382 300,166 256,382 256,402 216,402 176,446 150,438" />
          </clipPath>
        </defs>

        <style>{`
          @keyframes altron-radar-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes altron-core-breathe {
            0%, 100% {
              transform: scale(0.97);
              opacity: 0.88;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
              filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.95));
            }
          }
          @keyframes altron-flare-rotate {
            0% { transform: rotate(0deg) scale(0.92); }
            50% { transform: rotate(180deg) scale(1.08); }
            100% { transform: rotate(360deg) scale(0.92); }
          }
          @keyframes altron-sweep {
            0% { transform: translate(-300px, -300px); }
            35% { transform: translate(350px, 350px); }
            100% { transform: translate(350px, 350px); }
          }
          @keyframes altron-orbit-pulse {
            0%, 100% { opacity: 0.75; }
            50% { opacity: 1; }
          }
          .altron-radar-ring {
            transform-origin: 300px 300px;
            animation: ${showRingsAnimation ? 'altron-radar-spin 48s linear infinite' : 'none'};
          }
          .altron-core-pulsar {
            transform-origin: 300px 305px;
            animation: ${showCorePulse ? 'altron-core-breathe 4s ease-in-out infinite' : 'none'};
          }
          .altron-stellar-flare {
            transform-origin: 300px 305px;
            animation: ${showCorePulse ? 'altron-flare-rotate 16s ease-in-out infinite' : 'none'};
          }
          .altron-light-sweep-bar {
            animation: ${showLightSweep ? 'altron-sweep 7s ease-in-out infinite' : 'none'};
          }
          .altron-orbit-glow-line {
            animation: ${showCorePulse ? 'altron-orbit-pulse 5s ease-in-out infinite' : 'none'};
          }
        `}</style>

        {/* ── LAYER 1: OUTER RADAR / TELEMETRY MARKINGS RING (ROTATING) ── */}
        <g className="altron-radar-ring opacity-40 group-hover:opacity-75 transition-opacity duration-500">
          {/* Fine Outer Concentric Radar Circle */}
          <circle
            cx="300"
            cy="300"
            r="228"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="4 8 2 8"
            opacity="0.6"
          />
          <circle
            cx="300"
            cy="300"
            r="215"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.2"
            strokeDasharray="16 12 4 12"
            opacity="0.75"
          />
          {/* Telemetry Reticle Ticks at 30-degree intervals */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="300"
              y1="76"
              x2="300"
              y2={deg % 90 === 0 ? "66" : "71"}
              stroke="#38bdf8"
              strokeWidth={deg % 90 === 0 ? "2" : "1.2"}
              transform={`rotate(${deg} 300 300)`}
              opacity="0.85"
            />
          ))}
        </g>

        {/* ── LAYER 2: BACK ARCS OF TILTED ORBITAL RINGS (BEHIND 'A') ── */}
        {/* Orbit 1: Tilted -26 degrees */}
        <g transform="rotate(-26 300 300)">
          <ellipse
            cx="300"
            cy="300"
            rx="245"
            ry="92"
            fill="none"
            stroke="url(#altron-orbit-1)"
            strokeWidth="2.5"
            filter="url(#altron-cyan-glow)"
            className="altron-orbit-glow-line"
          />
          {/* Secondary faint concentric orbit track */}
          <ellipse
            cx="300"
            cy="300"
            rx="237"
            ry="88"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeDasharray="3 6"
            opacity="0.4"
          />
        </g>

        {/* Orbit 2: Tilted +18 degrees */}
        <g transform="rotate(18 300 300)">
          <ellipse
            cx="300"
            cy="300"
            rx="235"
            ry="86"
            fill="none"
            stroke="url(#altron-orbit-2)"
            strokeWidth="2.2"
            filter="url(#altron-cyan-glow)"
            className="altron-orbit-glow-line"
          />
        </g>

        {/* ── LAYER 3: MAIN METALLIC CHASSIS RING ── */}
        <g filter="url(#altron-drop-shadow)">
          {/* Outer Bevel Shadow Lip */}
          <circle cx="300" cy="300" r="184" fill="none" stroke="#0f172a" strokeWidth="2" opacity="0.9" />

          {/* Main Heavy Metallic Ring Body */}
          <circle
            cx="300"
            cy="300"
            r="171"
            fill="none"
            stroke="url(#altron-ring-metal)"
            strokeWidth="24"
            className="group-hover:brightness-110 transition-all duration-300"
          />

          {/* Mid-Channel Groove */}
          <circle cx="300" cy="300" r="171" fill="none" stroke="url(#altron-ring-groove)" strokeWidth="4" />

          {/* Inner Cyan Highlight Rim */}
          <circle
            cx="300"
            cy="300"
            r="159"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.8"
            opacity="0.85"
            filter="url(#altron-cyan-glow)"
          />

          {/* Outer Chrome Highlight Rim */}
          <circle cx="300" cy="300" r="183" fill="none" stroke="#e2e8f0" strokeWidth="1.4" opacity="0.9" />

          {/* 4 Precision Alignment Brackets (Top, Right, Bottom, Left) */}
          {[0, 90, 180, 270].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 300 300)`}>
              <rect x="296" y="112" width="8" height="8" fill="#e2e8f0" rx="1" />
              <rect x="298" y="114" width="4" height="4" fill="#0284c7" />
            </g>
          ))}
        </g>

        {/* ── LAYER 4: CENTRAL AI ENERGY CORE (PULSING) ── */}
        <g className="altron-core-pulsar">
          {/* Ambient Deep Glow Aura */}
          <circle cx="300" cy="305" r="76" fill="url(#altron-core-halo)" filter="url(#altron-intense-glow)" />

          {/* Spherical Base Orb */}
          <circle
            cx="300"
            cy="305"
            r="44"
            fill="url(#altron-core-radial)"
            filter="url(#altron-cyan-glow)"
            className="group-hover:brightness-125 transition-all duration-300"
          />

          {/* Spherical Wireframe Latitude Rings */}
          <ellipse cx="300" cy="305" rx="44" ry="14" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.65" />
          <ellipse cx="300" cy="305" rx="44" ry="28" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.55" />
          <ellipse cx="300" cy="305" rx="44" ry="38" fill="none" stroke="#7dd3fc" strokeWidth="1" opacity="0.4" />

          {/* Spherical Wireframe Longitude Rings */}
          <ellipse cx="300" cy="305" rx="16" ry="44" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.6" />
          <ellipse cx="300" cy="305" rx="32" ry="44" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.5" />

          {/* Precision Targeting Crosshairs */}
          <line x1="230" y1="305" x2="370" y2="305" stroke="#e0f2fe" strokeWidth="1.4" opacity="0.85" />
          <line x1="300" y1="235" x2="300" y2="375" stroke="#e0f2fe" strokeWidth="1.4" opacity="0.85" />

          {/* Targeting Measurement Sub-Ticks */}
          <line x1="270" y1="301" x2="270" y2="309" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.8" />
          <line x1="330" y1="301" x2="330" y2="309" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.8" />
          <line x1="296" y1="275" x2="304" y2="275" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.8" />
          <line x1="296" y1="335" x2="304" y2="335" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.8" />
        </g>

        {/* Central Stellar Flare (Rotating & Pulsing) */}
        <g className="altron-stellar-flare pointer-events-none">
          {/* 4-Point Diamond Flare Rays */}
          <path
            d="M300,270 Q300,305 265,305 Q300,305 300,340 Q300,305 335,305 Q300,305 300,270 Z"
            fill="#ffffff"
            filter="url(#altron-intense-glow)"
            opacity="0.9"
          />
          {/* Micro Bright Singularity Point */}
          <circle cx="300" cy="305" r="5" fill="#ffffff" filter="url(#altron-cyan-glow)" />
        </g>

        {/* ── LAYER 5: THE ICONIC METALLIC 'A' CHEVRON ── */}
        <g filter="url(#altron-drop-shadow)">
          {/* Base Drop Shadow Silhouette */}
          <polygon
            points="300,66 450,438 424,446 384,402 344,402 344,382 300,166 256,382 256,402 216,402 176,446 150,438"
            fill="#020B18"
            opacity="0.45"
            transform="translate(0, 6)"
          />

          {/* LEFT HALF OF 'A' (Silver Chrome Bevel) */}
          <path
            d="M300,66 L300,166 L256,382 L216,402 L176,446 L150,438 Z"
            fill="url(#altron-a-left)"
            className="group-hover:brightness-105 transition-all duration-300"
          />

          {/* Inner Left Winglet Cutout Edge */}
          <path
            d="M256,382 L256,402 L216,402 Z"
            fill="#64748b"
          />

          {/* RIGHT HALF OF 'A' (Brushed Titanium Steel Bevel) */}
          <path
            d="M300,66 L450,438 L424,446 L384,402 L344,402 L344,382 L300,166 Z"
            fill="url(#altron-a-right)"
            className="group-hover:brightness-105 transition-all duration-300"
          />

          {/* Inner Right Winglet Cutout Edge */}
          <path
            d="M344,382 L384,402 L344,402 Z"
            fill="#334155"
          />

          {/* Outer Bevel Chamfer Ribs */}
          {/* Left outer edge chamfer */}
          <polygon
            points="300,66 304,74 156,432 150,438"
            fill="url(#altron-chamfer)"
            opacity="0.85"
          />
          {/* Right outer edge chamfer */}
          <polygon
            points="300,66 296,74 444,432 450,438"
            fill="#475569"
            opacity="0.9"
          />

          {/* Inner Aperture Edge Rims (Framing the Core) */}
          <path
            d="M300,166 L256,382"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M300,166 L344,382"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Central Vertical Spine / Ridge Highlight */}
          <line
            x1="300"
            y1="66"
            x2="300"
            y2="166"
            stroke="url(#altron-ridge)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#altron-cyan-glow)"
          />

          {/* Apex Specular Star Point */}
          <circle cx="300" cy="68" r="3.5" fill="#ffffff" filter="url(#altron-cyan-glow)" />

          {/* ── LIGHT SWEEP CLIP EFFECT ── */}
          <g clipPath="url(#altron-a-clip)">
            <rect
              className="altron-light-sweep-bar pointer-events-none"
              x="100"
              y="50"
              width="140"
              height="450"
              fill="url(#altron-light-sweep-grad)"
              transform="rotate(35 300 250)"
            />
          </g>
        </g>

        {/* ── LAYER 6: FRONT ORBIT ARCS & 3D SATELLITE SPHERES (OVER 'A') ── */}
        {/* Front segment of Orbit 1 crossing foreground */}
        <path
          d="M170,360 Q300,430 430,360"
          fill="none"
          stroke="url(#altron-orbit-1)"
          strokeWidth="2.8"
          filter="url(#altron-cyan-glow)"
          className="altron-orbit-glow-line"
        />

        {/* Front segment of Orbit 2 crossing foreground */}
        <path
          d="M175,250 Q300,175 425,250"
          fill="none"
          stroke="url(#altron-orbit-2)"
          strokeWidth="2.5"
          filter="url(#altron-cyan-glow)"
          className="altron-orbit-glow-line"
        />

        {/* Satellite 1: Large Major Satellite Node (Upper Left) */}
        <g filter="url(#altron-drop-shadow)">
          <circle cx="148" cy="180" r="16" fill="url(#altron-satellite-sphere)" />
          <circle cx="148" cy="180" r="16" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
          {/* Specular Point */}
          <circle cx="143" cy="174" r="4.5" fill="#ffffff" filter="url(#altron-cyan-glow)" />
          {/* Atmospheric Cyan Rim */}
          <circle cx="148" cy="180" r="18" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.45" filter="url(#altron-cyan-glow)" />
        </g>

        {/* Satellite 2: Medium Metallic Node (Upper Right) */}
        <g filter="url(#altron-drop-shadow)">
          <circle cx="445" cy="235" r="12" fill="url(#altron-satellite-sphere)" />
          <circle cx="445" cy="235" r="12" fill="none" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.7" />
          <circle cx="442" cy="231" r="3.2" fill="#ffffff" filter="url(#altron-cyan-glow)" />
        </g>

        {/* Satellite 3: Cyan Data Relay Node (Lower Left) */}
        <g filter="url(#altron-drop-shadow)">
          <circle cx="132" cy="365" r="10" fill="url(#altron-satellite-cyan)" filter="url(#altron-cyan-glow)" />
          <circle cx="130" cy="362" r="2.8" fill="#ffffff" />
        </g>

        {/* Satellite 4: Sub-Orbital Probe Node (Lower Right) */}
        <g filter="url(#altron-drop-shadow)">
          <circle cx="452" cy="385" r="9" fill="url(#altron-satellite-sphere)" />
          <circle cx="450" cy="382" r="2.2" fill="#ffffff" filter="url(#altron-cyan-glow)" />
        </g>

        {/* Micro Particle / Orbital Dust Nodes */}
        <circle cx="230" cy="155" r="3" fill="#e0f2fe" filter="url(#altron-cyan-glow)" opacity="0.8" />
        <circle cx="375" cy="165" r="3" fill="#38bdf8" filter="url(#altron-cyan-glow)" opacity="0.85" />
        <circle cx="215" cy="425" r="2.5" fill="#7dd3fc" opacity="0.7" />
        <circle cx="390" cy="420" r="2.5" fill="#e0f2fe" opacity="0.75" />
      </svg>
    </div>
  );
};

export default AltronLogo;
