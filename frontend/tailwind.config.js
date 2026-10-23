/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#101828',
          navy: '#101828',
        },
        royal: {
          DEFAULT: '#2563EB',
          blue: '#2563EB',
          hover: '#1D4ED8',
        },
        ice: {
          DEFAULT: '#EAF2FF',
          blue: '#EAF2FF',
        },
        cloud: {
          DEFAULT: '#F8FAFC',
          white: '#F8FAFC',
        },
        success: {
          DEFAULT: '#15803D',
          green: '#15803D',
        },
        amber: {
          DEFAULT: '#B45309',
          alert: '#B45309',
        },
        brand: {
          50: '#EAF2FF',
          100: '#EAF2FF',
          200: '#CFE0FC',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#101828',
        },
      },
    },
  },
  plugins: [],
}
