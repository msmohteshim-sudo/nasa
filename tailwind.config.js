/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ALTRON institutional deep navy palette
        navy: {
          950: '#020B18',
          900: '#04111f',
          800: '#061729',
          700: '#0a2036',
          600: '#0e2d4a',
          500: '#14406a',
          400: '#1a5a94',
        },
        // Aerospace blue accent
        aero: {
          900: '#0b1f35',
          700: '#1153a0',
          500: '#1a6fc4',
          400: '#2589e8',
          300: '#4fa3f7',
          200: '#93c5fd',
          100: '#dbeafe',
        },
        // ISRO-inspired saffron/amber accent
        saffron: {
          600: '#c25c00',
          500: '#e06900',
          400: '#f97316',
          300: '#fb923c',
          200: '#fdba74',
        },
        // Status colors
        verified: '#16a34a',
        warning:  '#d97706',
        deviation: '#dc2626',
        // Neutral slate
        surface: {
          950: '#020B18',
          900: '#050e1a',
          800: '#0a1628',
          700: '#0f2037',
          600: '#172840',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'altron-hero': 'linear-gradient(135deg, #020B18 0%, #04111f 50%, #061729 100%)',
        'altron-card': 'linear-gradient(160deg, #061729 0%, #04111f 100%)',
        'aero-accent': 'linear-gradient(90deg, #1153a0 0%, #1a6fc4 100%)',
        'section-divider': 'linear-gradient(90deg, transparent, #1153a0, transparent)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'slide-left': 'slideLeft 0.5s ease-out forwards',
        'marquee': 'marquee 35s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'aero': '0 4px 24px 0 rgba(26, 111, 196, 0.20)',
        'aero-lg': '0 8px 40px 0 rgba(26, 111, 196, 0.28)',
        'card': '0 2px 16px 0 rgba(2, 11, 24, 0.60)',
        'card-hover': '0 4px 32px 0 rgba(26, 111, 196, 0.18)',
      },
    },
  },
  plugins: [],
}
