/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pink-light': '#FFCEE4',
        'pink-medium': '#FFB9D9',
        'gray-light': '#F3F3F3',
        'gray-dark': '#2C2C2C',
        'purple-light': '#E8D5FF',
        'purple-medium': '#D4B5FF',
        'blue-light': '#D5E8FF',
        'blue-medium': '#B5D4FF',
        'green-light': '#D5FFE8',
        'green-medium': '#B5FFD4',
      },
      fontFamily: {
        'pixel': ['NeoDonggeunmo', 'DotGothic16', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

