import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#c2dbff',
          300: '#94beff',
          400: '#5e99ff',
          505: '#3875f6', // custom primary
          600: '#1d52d9',
          700: '#1840ab',
          800: '#193689',
          900: '#1a3070',
          950: '#101a44',
        },
        darkbg: {
          900: '#0b0f19',
          950: '#05070c',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
