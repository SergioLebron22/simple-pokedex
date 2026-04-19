/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        pokeRed: {
          light: '#ff6b6b',
          DEFAULT: '#e63946',
          dark: '#c1121f',
          deeper: '#922b21',
        },
        pokeDark: {
          DEFAULT: '#1a1a2e',
          mid: '#2d2d3d',
          card: '#0d0d1a',
          slot: '#111122',
        },
        pokeGold: '#ffd700',
        pokeGray: {
          light: '#aaaacc',
          mid: '#555566',
          border: '#4a4a5a',
        },
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { transform: 'translateY(24px)', opacity: 0 },
          to:   { transform: 'translateY(0)',    opacity: 1 },
        },
        pulse2: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(230,57,70,0.4)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(230,57,70,0)' },
        },
      },
      animation: {
        fadeIn:  'fadeIn 0.2s ease',
        slideUp: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
        pulse2:  'pulse2 2s infinite',
      },
      aspectRatio: { card: '2.5 / 3.5' },
    },
  },
  plugins: [],
};
