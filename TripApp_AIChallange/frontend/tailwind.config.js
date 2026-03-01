/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#1F3D2B',
          orange: '#C45C2E',
          cream: '#F4EBDC',
          teal: '#2F6F6D',
          rose: '#B76E5D',
          gold: '#D8A441',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
