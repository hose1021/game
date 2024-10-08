/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      colors: {
        'wordle-correct': '#6aaa64',
        'wordle-present': '#c9b458',
        'wordle-absent': '#787c7e',
        'wordle-key': '#d3d6da',
        'background': 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        'foreground': 'var(--foreground)',
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
      },
      keyframes: {
        flip: {
          '0%, 100%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(90deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        press: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        flip: 'flip 0.5s ease-in-out',
        shake: 'shake 0.3s ease-in-out',
        press: 'press 0.1s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      opacity: {
        '80': '0.8',
      },
      willChange: {
        'transform': 'transform',
      },
      transform: {
        'gpu': 'translateZ(0)',
      },
    },
  },
  variants: {},
  plugins: [],
  darkMode: 'class',
}