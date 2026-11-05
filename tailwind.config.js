/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50: '#FFF3EE', 100: '#FFE0D3', 500: '#F25A27', 600: '#E8430F', 700: '#C2360A' },
        accent: { 50: '#EEF5FF', 100: '#D9E8FF', 500: '#3B82F6', 600: '#1E6FE0', 700: '#1859B8' },
        ink: { 700: '#16365F', 800: '#0F2A4A', 900: '#0B2447' },
      },
      boxShadow: { soft: '0 1px 2px rgba(15,42,74,.05), 0 4px 16px rgba(15,42,74,.06)', lift: '0 2px 4px rgba(15,42,74,.06), 0 14px 32px rgba(15,42,74,.12)', glow: '0 8px 24px rgba(242,90,39,.35)' },
      keyframes: {
        rise: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { from: { opacity: 0, transform: 'translateY(24px) scale(.96)' }, to: { opacity: 1, transform: 'none' } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        sweep: { from: { strokeWidth: 0, opacity: 0 }, to: { strokeWidth: 16, opacity: 1 } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: { rise: 'rise .5s cubic-bezier(.2,.7,.2,1) both', pop: 'pop .28s cubic-bezier(.2,.8,.2,1) both', fade: 'fade .2s ease-out both', floaty: 'floaty 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
