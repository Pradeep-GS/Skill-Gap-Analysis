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
          50: '#eefbf5',
          100: '#d5f5e3',
          500: '#00C68D',
          600: '#00a878',
          700: '#008a63',
        },
        secondary: {
          500: '#2C3947',
          600: '#232d38',
          700: '#1a2129',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
