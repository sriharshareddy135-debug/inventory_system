/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f0f0f4',
          100: '#d8d8e4',
          200: '#b0b0c8',
          300: '#8888ac',
          400: '#606090',
          500: '#383874',
          600: '#2c2c5c',
          700: '#202044',
          800: '#14142c',
          900: '#080814',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
    },
  },
  plugins: [],
}
