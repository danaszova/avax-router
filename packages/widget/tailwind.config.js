/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        avalanche: {
          red: '#E84142',
          dark: '#1A1A1A',
          gray: '#2D2D2D',
        },
      },
      borderRadius: {
        'widget': '16px',
      },
    },
  },
  plugins: [],
}