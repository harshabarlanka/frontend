/** @type {import('tailwindcss').Config} */
export default {
  // Explicit content paths for maximum tree-shaking accuracy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Disable JIT safelist bloat — only ship classes actually used
  safelist: [],

  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fef9ee', 100: '#fdf0d3', 200: '#f9dea0', 300: '#f5c55e',
          400: '#f0a820', 500: '#e8900f', 600: '#cc6d09', 700: '#a84e0b',
          800: '#883e10', 900: '#703412', 950: '#3d1a05',
        },
        earth: {
          50:  '#faf7f2', 100: '#f2ebe0', 200: '#e4d4bf', 300: '#d3b897',
          400: '#bf9670', 500: '#b07d56', 600: '#a3694a', 700: '#88533f',
          800: '#6f4538', 900: '#5b3a30', 950: '#301c18',
        },
        spice: {
          50:  '#fff5f2', 100: '#ffe8e2', 200: '#ffd0c4', 300: '#ffad97',
          400: '#ff7d5a', 500: '#f95630', 600: '#e63a17', 700: '#c12e10',
          800: '#9f2a12', 900: '#832916', 950: '#481107',
        },
        leaf: {
          50:  '#f2f9f1', 100: '#e0f2de', 200: '#c2e5be', 300: '#95d090',
          400: '#62b45a', 500: '#3e9636', 600: '#2d7927', 700: '#256022',
          800: '#204d1e', 900: '#1c401a', 950: '#0a230b',
        },
      },

      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Lato"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      backgroundImage: {
        // Inline SVG grain texture — no external request
        grain: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',   // was 0.5s — snappier
        'slide-up': 'slideUp 0.3s ease-out', // was 0.4s
        'shimmer': 'shimmer 1.2s infinite',  // was 1.5s — tighter loop
      },

      keyframes: {
        fadeIn:  { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },

      // Explicitly limit border-radius variants to what's actually used
      // (avoids generating ~40 unused radius utilities)
      borderRadius: {
        none: '0',
        sm:   '0.125rem',
        DEFAULT: '0.25rem',
        md:   '0.375rem',
        lg:   '0.5rem',
        xl:   '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
    },
  },

  // CorePlugins: disable unused groups to shrink the base CSS
  corePlugins: {
    // Disabled — not used in this app
    float:       false,
    clear:       false,
    skew:        false,
    caretColor:  false,
    sepia:       false,
  },

  plugins: [],
}
