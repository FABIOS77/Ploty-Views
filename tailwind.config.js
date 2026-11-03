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
          canvas: 'var(--ploty-canvas, #C5D4CA)',
          card: 'var(--ploty-card, #FFFFFF)',
          dark: 'var(--ploty-dark, #312F30)',
          primary: 'var(--ploty-primary, #7477FF)',
          accent: 'var(--ploty-accent, #F66554)',
        },
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'tactile-sm': 'var(--ploty-shadow-sm, 0 2px 0 0 #312F30)',
        'tactile': 'var(--ploty-shadow, 0 4px 0 0 #312F30)',
        'tactile-lg': 'var(--ploty-shadow-lg, 0 6px 0 0 #312F30)',
        'bento': '0 8px 30px rgba(49, 47, 48, 0.08)',
        'neon': '0 0 20px rgba(0, 240, 255, 0.45)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.4)',
        'matrix-glow': '0 0 18px rgba(16, 185, 129, 0.5)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
