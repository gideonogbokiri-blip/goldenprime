import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE699',
          300: '#FFDB66',
          400: '#FFD133',
          500: '#D4AF37',
          600: '#B8960F',
          700: '#8B7200',
          800: '#5F4E00',
          900: '#3A2E00',
        },
      },
      animation: {
        'shimmer': 'gold-shimmer 3s linear infinite',
        'pulse-gold': 'gold-pulse 3s ease-in-out infinite',
        'glow': 'gold-glow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'coin-spin 3s ease-in-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'skeleton': 'shimmer-line 1.5s infinite',
      },
      keyframes: {
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'gold-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.5)' },
        },
        'gold-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6))' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'coin-spin': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'shimmer-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
