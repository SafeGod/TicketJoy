/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f51b5',
          '50': '#e8eaf6',
          '100': '#c5cae9',
          '200': '#9fa8da',
          '300': '#7986cb',
          '400': '#5c6bc0',
          '500': '#3f51b5',
          '600': '#3949ab',
          '700': '#303f9f',
          '800': '#283593',
          '900': '#1a237e',
        },
        secondary: {
          DEFAULT: '#ff4081',
          '50': '#fce4ec',
          '100': '#f8bbd0',
          '200': '#f48fb1',
          '300': '#f06292',
          '400': '#ec407a',
          '500': '#e91e63',
          '600': '#d81b60',
          '700': '#c2185b',
          '800': '#ad1457',
          '900': '#880e4f',
        },
        fet: '#003366', // Color principal de tu universidad
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
