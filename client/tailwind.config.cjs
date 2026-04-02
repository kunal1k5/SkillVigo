/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--sv-font-body)', 'Manrope', 'Segoe UI', 'sans-serif'],
        display: ['var(--sv-font-display)', 'Sora', 'Aptos', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.08)',
        lift: '0 18px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
