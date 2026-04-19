/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#010828',
        cream: '#EFF4FF',
        neon: '#6FFF00',
      },
      fontFamily: {
        grotesk: ['Anton', 'Noto Sans KR', 'sans-serif'],
        condiment: ['Gaegu', 'Condiment', 'cursive'],
        kr: ['Noto Sans KR', 'sans-serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      maxWidth: {
        layout: '1831px',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};
