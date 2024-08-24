import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{html,css,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
        mono: ['"Space Mono"', ...defaultTheme.fontFamily.mono]
      },
      colors: {
        'redis-white': '#FFFFFF',
        'redis-hyper': '#FF4438',
        'redis-deep-hyper': '#EB352A',
        'redis-black': '#000000',
        'redis-black-90': '#191919',
        'redis-black-70': '#4C4C4C',
        'redis-black-50': '#808080',
        'redis-black-30': '#B2B2B2',
        'redis-black-10': '#E5E5E5',
        'redis-light-gray': '#F0F0F0',
        'redis-midnight': '#091A23',
        'redis-dusk': '#163341',
        'redis-dusk-90': '#2D4754',
        'redis-dusk-70': '#5C707A',
        'redis-dusk-50': '#8A99A0',
        'redis-dusk-30': '#B9C2C6',
        'redis-dusk-10': '#E8EBEC',
        'redis-violet': '#C795E3',
        'redis-violet-50': '#E3CAF1',
        'redis-violet-20': '#F4EAF9',
        'redis-violet-10': '#F9F4FC',
        'redis-sky-blue': '#80DBFF',
        'redis-sky-blue-50': '#BFEDFF',
        'redis-sky-blue-20': '#E6F8FF',
        'redis-sky-blue-10': '#F2FBFF',
        'redis-yellow': '#DCFF1E',
        'redis-yellow-50': '#F1FFA5',
        'redis-yellow-20': '#F8FFD2',
        'redis-yellow-10': '#FBFFE8'
      }
    }
  },
  plugins: []
}
