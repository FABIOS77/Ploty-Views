/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ploty: {
          white: 'var(--ploty-white, #FFFFFF)',
          charcoal: 'var(--ploty-charcoal, #312F30)',
          periwinkle: 'var(--ploty-periwinkle, #7477FF)',
          coral: 'var(--ploty-coral, #F66554)',
          gold: 'var(--ploty-gold, #F9CD61)',
          sage: 'var(--ploty-sage, #C5D4CA)',
        },
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'tactile-sm': '0 2px 0 0 #312F30',
        'tactile': '0 4px 0 0 #312F30',
        'tactile-lg': '0 6px 0 0 #312F30',
        'bento': '0 8px 30px rgba(49, 47, 48, 0.08)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
