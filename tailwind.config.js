/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 80px rgba(18, 139, 255, 0.18)',
      },
      colors: {
        ink: '#07111f',
        mint: '#2ee59d',
        ocean: '#1687ff',
        coral: '#ff6b6b',
        amberPulse: '#ffb84d',
      },
    },
  },
  plugins: [],
};
