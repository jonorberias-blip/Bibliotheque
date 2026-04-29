/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#1a56db', 50: '#eff6ff', 600: '#1a56db', 700: '#1e40af', 900: '#1e3a8a' },
        accent:   { DEFAULT: '#f59e0b', 400: '#fbbf24', 600: '#d97706' },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
