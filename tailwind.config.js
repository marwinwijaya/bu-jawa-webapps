/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFF8F0',
          dark: '#F5E6D3',
        },
        brown: {
          DEFAULT: '#8B4513',
          light: '#A0522D',
          dark: '#654321',
        },
        'green-leaf': {
          DEFAULT: '#228B22',
          light: '#32CD32',
          dark: '#006400',
        },
      },
    },
  },
  plugins: [],
}
