/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070c18', // deepest background
          900: '#0b1329', // page background
          850: '#0f1b38', // card background
          800: '#142346', // card hover / secondary
          700: '#1e325f', // border subtle
          600: '#2b447e', // border highlight
        },
        risk: {
          low: '#10b981',      // Emerald Green
          medium: '#f59e0b',   // Amber Yellow
          high: '#ef4444',     // Crimson Red
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
