/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#070a12',
        foreground: '#f5f7fb',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
          hover: '#60a5fa',
        },
        secondary: {
          DEFAULT: 'rgba(255,255,255,0.075)',
          foreground: '#9aa8bd',
          border: 'rgba(255,255,255,0.14)',
        },
        accent: {
          DEFAULT: '#7cf7c8',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: 'rgba(13, 20, 34, 0.68)',
          border: 'rgba(255,255,255,0.14)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
