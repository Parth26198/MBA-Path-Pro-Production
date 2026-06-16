/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd4ff',
          300: '#8eb8ff',
          400: '#5990ff',
          500: '#3366ff',
          600: '#1a44f5',
          700: '#1535e1',
          800: '#182db6',
          900: '#192a8f',
          950: '#121b57',
        },
        accent: {
          DEFAULT: '#f59e0b',
          foreground: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #121b57 0%, #3366ff 50%, #5990ff 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 38, 135, 0.15)',
        premium: '0 20px 60px -15px rgba(26, 68, 245, 0.35)',
      },
    },
  },
  plugins: [],
};
